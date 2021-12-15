import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import ObservedFeaturesPlot from './ObservedFeaturesPlotSimple';
import ChartInstructions from './ChartInstructions';
import './ObservedFeaturesChart.css';

function ObservedFeaturesChart({
  mapType,
  geography,
  observedFeature,
  year,
  selectedGeographicFeature,
  data,
  showInstructions,
  showRate
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (observedFeature === 'maltreatment') {
      return;
    }
    dispatch({
      type: 'FETCH_PROTX_DEMOGRAPHIC_DISTRIBUTION',
      payload: {
        area: geography,
        variable: observedFeature,
        unit: showRate ? 'percent' : 'count'
      }
    });
  }, [mapType, geography, observedFeature, showRate]);

  if (selectedGeographicFeature && observedFeature) {
    return (
      <div className="observed-features-report">
        <ObservedFeaturesPlot
          mapType={mapType}
          geography={geography}
          observedFeature={observedFeature}
          year={year}
          selectedGeographicFeature={selectedGeographicFeature}
          data={data}
          showRate={showRate}
        />
        <ChartInstructions currentReportType="hidden" />
      </div>
    );
  }
  return (
    <div className="observed-features-report">
      {showInstructions && <ChartInstructions currentReportType="observed" />}
    </div>
  );
}

ObservedFeaturesChart.propTypes = {
  mapType: PropTypes.string.isRequired,
  geography: PropTypes.string.isRequired,
  observedFeature: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
  showRate: PropTypes.bool.isRequired,
  showInstructions: PropTypes.bool
};

ObservedFeaturesChart.defaultProps = {
  showInstructions: false
};

export default ObservedFeaturesChart;
