import sqlite3
import json
import numpy as np
import pandas as pd
from protx.data.api.utils.plotly_figures import timeseries_lineplot

db_name = '/protx-data/cooks.db'


def currency(value1, value2):
    return '{:.0f}-{:.0f}'.format(round(value1 / 1000, 0), round(value2 / 1000, 0))


def not_currency(value1, value2):
    return '{:.0f}-{:.0f}'.format(value1, value2)


def hist_to_bar(vector, range_vals, bins):
    """
    vector: range of values
    range_vals: tuple of (min, max) or None
    bins: number of bins to pass to np.histogram()
    """

    try:
        assert len(vector) > 1
    except AssertionError:
        print('Data vector is empty.')
        return

    height, edges = np.histogram(vector, range=range_vals, bins=bins, density=False)

    return height, edges


def pearson_kurtosis(x):

    sigma = np.std(x)
    mean = np.mean(x)
    deviation = x - mean
    ratio = deviation / sigma
    k_vector = ratio ** 4
    k = np.mean(k_vector)

    return k


def get_bin_edges(query_return_df, label_template):
    all_data = query_return_df['VALUE'].values
    all_data = all_data[np.logical_not(np.isnan(all_data))]

    # resample data down to an annual sample size (data size is used in bin calc algorithms)
    n_draws = len(query_return_df['GEOID'].unique()) - 2

    # could perform resampling multiple times and average edges
    # but doing calc only once for efficiency
    sampled_data = list(np.random.choice(all_data, size=n_draws, replace=True))

    # make sure the min and max are always in the data or bin range will be wrong
    sampled_data.append(max(all_data))
    sampled_data.append(min(all_data))

    # Freedman Diaconis Estimator
    bin_edges = np.histogram_bin_edges(sampled_data, bins='fd')
    bar_centers = [round(((bin_edges[i - 1] + bin_edges[i]) / 2.0), 2) for i in range(1, len(bin_edges))]

    # measure kurtosis to determine binning strategy
    k = pearson_kurtosis(all_data)

    # k = 0 is close to a normal distribution; some of our data have k = 80
    if k < 10:

        label_fmt = [label_template(bin_edges[i - 1], bin_edges[i]) for i in range(1, len(bin_edges))]
        return bin_edges, bar_centers, label_fmt

    else:

        # find the 95th percentile of all data to use as binning threshold
        threshold_95 = np.quantile(all_data, 0.95)

        # subset the bin edges under the threshold
        edges_threshold = list(bin_edges[bin_edges < threshold_95])

        # add the maximum value back to the sequence
        edges_threshold.append(max(bin_edges))

        # calculate the bar centers so that the final wide bar isn't stretched
        bar_centers_threshold = bar_centers[0: len(edges_threshold) + 1]

        # update the bar labels
        label_fmt_threshold = [label_template(edges_threshold[i - 1], edges_threshold[i]) for i in
                               range(1, len(edges_threshold))]

        return edges_threshold, bar_centers_threshold, label_fmt_threshold


subplot_mapping_aes = {
    'people': {
        'AGE17': {'col': 1, 'range': (0, 100), 'label_fmt': not_currency, 'color': '#636EFA'},
        'GROUPQ': {'col': 2, 'range': (0, 100), 'label_fmt': not_currency, 'color': '#EF553B'},
        'NOHSDP': {'col': 3, 'range': (0, 100), 'label_fmt': not_currency, 'color': '#00CC96'},
        'POV': {'col': 4, 'range': (0, 100), 'label_fmt': not_currency, 'color': '#AB63FA'}
    },
    'hh': {
        'SNGPNT': {'col': 6, 'range': (0, 100), 'label_fmt': not_currency, 'color': '#FFA15A'}
    },
    'hu': {
        'CROWD': {'col': 8, 'range': (0, 100), 'label_fmt': not_currency, 'color': '#19D3F3'}
    },
    'dollars': {
        'PCI': {'col': 10, 'range': None, 'label_fmt': currency, 'color': '#FF6692'}
    }
}

# ## Demographics demo: response to user selection, time series
#
# 1. User selects the "Demographics" tab.
#
# 2. User selects the following from drop down menus:
#
#     - Area (currently fixed to counties)
#     - Demographic
#     - Years (currently fixed to 2019)
#     - (pending: rate vs percent)
#
#
# 3. User selects an area from the map (must happen after drop-down selection for "area" is made)

# ### Select variable across all years

yearly_data_query = '''
select d.VALUE, d.GEOID, d.GEOTYPE, d.DEMOGRAPHICS_NAME, d.YEAR,
    d.UNITS as count_or_pct, g.DISPLAY_TEXT as geo_display, u.UNITS as units, u.DISPLAY_TEXT as units_display
from {report_type} d
left join display_geotype g on
    g.GEOID = d.GEOID and
    g.GEOTYPE = d.GEOTYPE and
    g.YEAR = d.YEAR
join display_data u on
    d.DEMOGRAPHICS_NAME = u.NAME
where d.GEOTYPE = "{area}" and
    d.UNITS = "{unit}" and
    d.DEMOGRAPHICS_NAME = "{variable}";
'''

# ### Select annual values for a focal area

focal_query = '''
select d.VALUE, d.GEOID, d.GEOTYPE, d.DEMOGRAPHICS_NAME, d.YEAR,
    d.UNITS as count_or_pct, g.DISPLAY_TEXT as geo_display, u.UNITS as units, u.DISPLAY_TEXT as units_display
from {report_type} d
left join display_geotype g on
    g.GEOID = d.GEOID and
    g.GEOTYPE = d.GEOTYPE and
    g.YEAR = d.YEAR
join display_data u on
    d.DEMOGRAPHICS_NAME = u.NAME
where d.GEOTYPE = "{area}" and
    d.UNITS = "{unit}" and
    d.DEMOGRAPHICS_NAME = "{variable}" and
    d.GEOID = "{geoid}" and
    d.GEOTYPE = "{area}";
'''


def demographic_data_prep(query_return_df):
    """Return a dictionary that specifies a timeseries of histograms"""

    ########################
    # USER INPUT PARSING ## (but below shows parsing from return data)
    ########################

    # range should be min - 10%, max + 10%
    range_vals = (np.nanmin(query_return_df['VALUE']) * 0.9, np.nanmax(query_return_df['VALUE']) * 1.1)

    ###########################################################
    # RETURN DATA PROCESSING -- AESTHETICS FOR ALL SUBPLOTS ##
    ###########################################################

    # parse the units themselves; dollars use label_template "currency"
    # with the exception of median rent as a percent of household income, which uses "not_currency"
    # all others use "not_currency"
    if (query_return_df['units'].unique().item() == 'dollars') and \
            (query_return_df['DEMOGRAPHICS_NAME'] != 'MEDIAN_GROSS_RENT_PCT_HH_INCOME').unique().item():
        label_template = currency
        # division is done in formatting helper but could be pushed up to .db file
        label_units = query_return_df['units_display'].unique().item() + ' (1000s of dollars)'
    else:
        label_template = not_currency
        label_units = query_return_df['units_display'].unique().item()
        # for line plots, PCI should use median and others should use mean
    if query_return_df['DEMOGRAPHICS_NAME'].unique().item() == 'PCI':
        center = 'median'
    else:
        center = 'mean'

    ############################################################
    # CALCULATE HISTOGRAM BIN EDGES FOR DATA ACROSS ALL YEARS ##
    ############################################################

    bin_edges, bar_centers, bar_labels = get_bin_edges(query_return_df, label_template)
    bin_width = bin_edges[1] - bin_edges[0]
    # add the width to the second-to-last element in the bin edge vector
    # this avoids inflating the max if there extra-wide final bins for skewed distributions
    hist_min = bin_edges[0]
    hist_max = bin_edges[-2] + bin_width

    ################################################
    # RESPONSE VALUE FOR DATA AND PLOT AESTHETICS ##
    ################################################

    # set up response dictionary
    data_response = {
        'fig_aes': {
            'yrange': (hist_min, hist_max),
            'simple_yrange': range_vals,
            'xrange': (0, 0),  # for horizontal boxplots, updated dynamically
            'geotype': query_return_df['GEOTYPE'].unique().item(),
            'label_units': label_units,
            'bar_labels': None,
            'bar_centers': None,
            'focal_display': None,
            'center': center
        },
        'years': {
            i: {'focal_value': None,
                'mean': None,
                'median': None,
                'bars': [None]} for i in range(2011, 2020)}
    }

    ################################
    # CALCULATE ANNUAL HISTOGRAMS ##
    ################################

    for year in range(2010, 2020):
        data = query_return_df[query_return_df['YEAR'] == year]['VALUE'].values
        data = data[np.logical_not(np.isnan(data))]

        if len(data) > 0:
            hbar, _ = hist_to_bar(
                data,
                range_vals=range_vals,
                bins=bin_edges
            )

            ####################
            # UNIQUE BY YEAR ##
            ####################
            data_response['years'][year]['mean'] = np.mean(data)
            data_response['years'][year]['median'] = np.quantile(data, q=[0.5]).item()
            data_response['years'][year]['bars'] = hbar

            #######################################################
            # SHARED BY ALL SUBPLOTS BUT DYNAMICALLY CALCUALTED ##
            #######################################################

            # update the max xrange to the greater of (prior max, new height + 10%)
            data_response['fig_aes']['xrange'] = (0, max(data_response['fig_aes']['xrange'][1], max(hbar) * 1.1))

            ###########################
            # SHARED BY ALL SUBPLOTS ##
            ###########################

            if not data_response['fig_aes']['bar_labels']:
                data_response['fig_aes']['bar_labels'] = bar_labels
                data_response['fig_aes']['bar_centers'] = bar_centers

    return data_response


def update_focal_area(display_dict, focal_data):
    #############################################
    # GET DISPLAY TEXT FOR SPECIFIC GEOGRAPHY ##
    #############################################

    if focal_data['geo_display'].unique().item():
        display_name = focal_data['geo_display'].unique().item()
    else:
        display_name = focal_data['GEOID'].unique().item()

    ##########################################################
    # CONVERT VALUES TO DICTIONARY AND ADD TO DISPLAY DICT ##
    ##########################################################

    focal_dict = focal_data[['YEAR', 'VALUE']].set_index('YEAR').transpose().to_dict(orient='records')[0]
    display_dict['fig_aes']['focal_display'] = display_name
    for year in range(2011, 2020):
        try:
            focal_val = focal_dict[year]
        except KeyError:
            focal_val = None

        display_dict['years'][year]['focal_value'] = focal_val

    return display_dict


def demographic_data_query(area, unit, variable):
    db_conn = sqlite3.connect(db_name)
    selection = {'area': area, 'unit': unit, 'variable': variable, 'report_type': 'demographics'}
    query = yearly_data_query.format(**selection)
    query_result = pd.read_sql_query(query, db_conn)
    db_conn.close()
    return query_result


def demographic_focal_area_data_query(area, geoid, unit, variable):
    db_conn = sqlite3.connect(db_name)
    selection = {'area': area, 'geoid': geoid, 'unit': unit, 'variable': variable, 'report_type': 'demographics'}
    query = focal_query.format(**selection)
    query_result = pd.read_sql_query(query, db_conn)
    db_conn.close()
    return query_result


def demographics_simple_lineplot_figure(area, geoid, unit, variable):
    # Get Statewide data.
    state_data = demographic_data_query(area, unit, variable)
    # Munge statewide data.
    state_result = demographic_data_prep(state_data)

    # Get selected geography data.
    geography_data = demographic_focal_area_data_query(area, geoid, unit, variable)

    # Combine statewide and geography data results.
    plot_result = update_focal_area(
        state_result,
        geography_data
    )

    # Generate the plot figure data object.
    plot_figure = timeseries_lineplot(plot_result)
    return json.loads(plot_figure.to_json())
