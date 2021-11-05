import React from 'react';
import PropTypes from 'prop-types';
// import { getObservedFeatureDetails } from '../shared/dataUtils';
import {
  PREDICTIVE_FEATURES_TABLE_DATA,
  PREDICTIVE_FEATURES_TABLE_NOTES
} from './predictiveFeaturesTableData';
import './PredictiveFeaturesTable.css';

const tableData = PREDICTIVE_FEATURES_TABLE_DATA;
const tableNotes = PREDICTIVE_FEATURES_TABLE_NOTES;

function PredictiveFeaturesTable({
  observedFeature,
  selectedGeographicFeature
}) {
  const chartSubtitle = 'Table 1';
  const chartTitle = 'Texas Statewide Data';
  const selectedDemographicFeatureCheck = false; // true - populates data table.
  const currentObservedFeature = {};
  let selectedDemographicFeature;

  const determineIfPreselected = observedFeatureCode => {
    if (observedFeatureCode !== '') {
      const inList = PREDICTIVE_FEATURES_TABLE_DATA.find(
        f => observedFeatureCode === f.Code
      );
      if (inList) {
        return true;
      }
    }
    return false;
  };

  const isPreselected = determineIfPreselected(currentObservedFeature);

  if (observedFeature && !isPreselected) {
    /**
     * TODO: Populate the currentObservedFeature object using the observedFeature value.
     * currentObservedFeature = getObservedFeatureDetails(observedFeature);
     */

    // Check the object for completeness.
    if (!currentObservedFeature.name) {
      currentObservedFeature.name = 'Observed Feature Name';
    }
    if (!currentObservedFeature.strength) {
      currentObservedFeature.strength = 'TBD';
    }
    if (!currentObservedFeature.importance) {
      currentObservedFeature.importance = 'TBD';
    }
    if (!currentObservedFeature.average_rank) {
      currentObservedFeature.average_rank = 'TBD';
    }
    if (!currentObservedFeature.ensemble_rank) {
      currentObservedFeature.ensemble_rank = 'TBD';
    }

    selectedDemographicFeature = {
      Demographic_Feature: currentObservedFeature.name,
      Rank_By_Causal_Strength: currentObservedFeature.strength,
      Rank_By_Random_Forest_Feature_Importance:
        currentObservedFeature.importance,
      Average_Rank: currentObservedFeature.average_rank,
      Ensemble_Rank: currentObservedFeature.ensemble_rank
    };
  }

  const featuresTableHeaderRow = () => {
    return (
      <tr>
        <th className="feature-table-chart-label">Demographic Feature</th>
        <th className="feature-table-chart-cell ensemble-rank-label">
          Ensemble Rank
        </th>
        <th className="feature-table-chart-cell">
          Rank by Causal Strength <sup>a</sup>
        </th>
        <th className="feature-table-chart-cell">
          Rank by Random Forest Feature Importance <sup>b</sup>
        </th>
        <th className="feature-table-chart-cell">Average Rank</th>
      </tr>
    );
  };

  const featureTableHeader = featuresTableHeaderRow();

  const featureTableData = tableData.map((data, index) => {
    const i = index;
    return (
      <tr key={i}>
        <td>{data.Demographic_Feature}</td>
        <td className="ensemble-rank-value">{data.Ensemble_Rank}</td>
        <td>{data.Rank_By_Causal_Strength}</td>
        <td>{data.Rank_By_Random_Forest_Feature_Importance}</td>
        <td>{data.Average_Rank}</td>
      </tr>
    );
  });

  const featureTableAnnotations = tableNotes.map((noteRow, index) => {
    const i = index;
    return (
      <div className="feature-table-annotation" key={i}>
        <span className="feature-table-annotation-prefix">
          {noteRow.Note_Prefix}
        </span>
        <span className="feature-table-annotation-text">
          {noteRow.Note_Text}
        </span>
      </div>
    );
  });

  const getFeatureTable = () => {
    if (selectedDemographicFeatureCheck) {
      const getSelectedFeatureTableData = feature => {
        const currentSelectedFeature = feature;
        return (
          <tr className="feature-table-selected-feature">
            <td>{currentSelectedFeature.Demographic_Feature}</td>
            <td className="ensemble-rank-value">
              {currentSelectedFeature.Ensemble_Rank}
            </td>
            <td>{currentSelectedFeature.Rank_By_Causal_Strength}</td>
            <td>
              {currentSelectedFeature.Rank_By_Random_Forest_Feature_Importance}
            </td>
            <td>{currentSelectedFeature.Average_Rank}</td>
          </tr>
        );
      };

      const selectedDemographicFeatureTableData = getSelectedFeatureTableData(
        selectedDemographicFeature
      );

      return (
        <div className="feature-table">
          <div className="feature-table-chart-selection">
            <div className="feature-table-chart-title">
              {chartTitle}
              <span className="feature-table-chart-subtitle">
                ({chartSubtitle})
              </span>
            </div>
            <table>
              <thead>{featureTableHeader}</thead>
              <tbody>
                {featureTableData}
                {selectedFeatureTableData}
              </tbody>
            </table>
          </div>
          <div className="feature-table-info">{featureTableAnnotations}</div>
        </div>
      );
    }
    return (
      <div className="feature-table">
        <div className="feature-table-chart">
          <div className="feature-table-chart-title">
            {chartTitle}
            <span className="feature-table-chart-subtitle">
              ({chartSubtitle})
            </span>
          </div>
          <table>
            <thead>{featureTableHeader}</thead>
            <tbody>{featureTableData}</tbody>
          </table>
        </div>
        <div className="feature-table-info">{featureTableAnnotations}</div>
      </div>
    );
  };

  const featureTable = getFeatureTable();
  return featureTable;
}

PredictiveFeaturesTable.propTypes = {
  observedFeature: PropTypes.string
};

PredictiveFeaturesTable.defaultProps = {
  observedFeature: ''
};

export default PredictiveFeaturesTable;
