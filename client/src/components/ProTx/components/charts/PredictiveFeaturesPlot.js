import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import { getFipsIdName, getPredictiveFeaturesPlotData } from '../util';
import DebugPlot from './DebugPlot';
import './PredictiveFeaturesPlot.css';

/* Passing in the debugState property at component declaration will render component data in debug mode. */
function PredictiveFeaturesPlot({
  mapType,
  geography,
  maltreatmentTypes,
  observedFeature,
  year,
  selectedGeographicFeature,
  data,
  debugState
}) {
  // console.log(mapType);
  // console.log(geography);
  // console.log(maltreatmentTypes);
  // console.log(observedFeature);
  // console.log(year);
  // console.log(selectedGeographicFeature);
  // console.log(data);
  // console.log(debugState);

  const PLOT_TYPE = 'predictiveFeatures';

  const getPredictiveFeaturesChartLayout = (
    mapTypePredictiveFeatures,
    predictiveFeaturePredictiveFeatures,
    geographyPredictiveFeatures,
    selectedGeographicFeaturePredictiveFeatures,
    plotStatePredictiveFeatures
  ) => {
    return (
      <div className="predictive-features-plot-layout">
        <div className="predictive-features-plot-header">
          <div className="predictive-features-plot-info">
            <div className="predictive-features-plot-placeholder-text">
              TARGET: predictiveFeaturesPlot for the selected feature{' '}
              {predictiveFeaturePredictiveFeatures} in the{' '}
              {geographyPredictiveFeatures} of{' '}
              {selectedGeographicFeaturePredictiveFeatures}.
            </div>
          </div>
        </div>
        <div className="predictive-features-plot-chart-body">
          <div className="predictive-features-plot-chart-body-plot">
            <Plot
              data={plotStatePredictiveFeatures.data}
              layout={plotStatePredictiveFeatures.layout}
              config={plotStatePredictiveFeatures.config}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
    );
  };

  const predictiveFeaturesPlotData = getPredictiveFeaturesPlotData();

  const fipsIdValue = getFipsIdName(selectedGeographicFeature);
  const geoId = `${selectedGeographicFeature}:${fipsIdValue}`;

  const predictiveFeaturesChartLayout = getPredictiveFeaturesChartLayout(
    mapType,
    observedFeature,
    geography,
    selectedGeographicFeature,
    predictiveFeaturesPlotData.predictiveFeaturesPlotState
  );

  if (debugState) {
    return (
      <DebugPlot
        className="plot-debug"
        mapType={mapType}
        geography={geography}
        maltreatmentTypes={maltreatmentTypes}
        observedFeature={observedFeature}
        year={year}
        selectedGeographicFeature={selectedGeographicFeature}
        fipsIdValue={fipsIdValue}
        geoId={geoId}
        plotType={PLOT_TYPE}
        plotData={predictiveFeaturesPlotData}
        data={data}
      />
    );
  }

  return (
    <div className="predictive-features-plot">
      {predictiveFeaturesChartLayout}
    </div>
  );
}

PredictiveFeaturesPlot.propTypes = {
  mapType: PropTypes.string.isRequired,
  geography: PropTypes.string.isRequired,
  maltreatmentTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  observedFeature: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
  debugState: PropTypes.bool.isRequired
};

export default PredictiveFeaturesPlot;
