import React, { useEffect, useState } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SectionMessage, LoadingSpinner } from '_common';
import DisplaySelectors from './DisplaySelectors';
import MainMap from '../maps/MainMap';
import MaltreatmentChart from '../charts/MaltreatmentChart';
import ObservedFeaturesChart from '../charts/ObservedFeaturesChart';
import PredictiveFeaturesChart from '../charts/PredictiveFeaturesChart';
import './DashboardDisplay.css';
import './DashboardDisplay.module.scss';

function DashboardDisplay() {
  // Map type and selected types (i.e. geography, year etc)
  // TODO: control of this state should be moved to redux/sagas (https://jira.tacc.utexas.edu/browse/COOKS-55)
  const [mapType, setMapType] = useState('maltreatment');
  const [geography, setGeography] = useState('county');
  const [maltreatmentTypes, setMaltreatmentTypes] = useState(['ABAN']);
  const [observedFeature, setObservedFeature] = useState('CROWD');
  const [year, setYear] = useState('2019');
  const [selectedGeographicFeature, setSelectedGeographicFeature] = useState(
    ''
  );
  const [showRate, setShowRate] = useState(true);
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector(state => state.protx);
  const protxRoute = '/protx';

  // Get systems and any other initial data we need from the backend
  useEffect(() => {
    dispatch({ type: 'FETCH_PROTX' });
  }, []);

  if (error) {
    return (
      <div styleName="error">
        <SectionMessage type="warn">
          There was a problem loading the map data.
        </SectionMessage>
      </div>
    );
  }

  if (loading) {
    return (
      <div styleName="root">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div styleName="root">
      <Switch>
        <Route
          path={`${protxRoute}/maltreatment`}
          render={() => {
            setMapType('maltreatment');
            // maltreatment only has county data.
            setGeography('county');
            return (
              <>
                <DisplaySelectors
                  mapType={mapType}
                  geography={geography}
                  maltreatmentTypes={maltreatmentTypes}
                  observedFeature={observedFeature}
                  year={year}
                  showRate={showRate}
                  setGeography={setGeography}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  setYear={setYear}
                  setShowRate={setShowRate}
                />
                <div className="display-layout-root">
                  <div className="display-layout-map">
                    <MainMap
                      mapType={mapType}
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      showRate={showRate}
                      data={data}
                      selectedGeographicFeature={selectedGeographicFeature}
                      setSelectedGeographicFeature={
                        setSelectedGeographicFeature
                      }
                    />
                  </div>
                  <div className="display-layout-chart">
                    <MaltreatmentChart
                      mapType={mapType}
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      showRate={showRate}
                      selectedGeographicFeature={selectedGeographicFeature}
                      data={data}
                      showInstructions
                    />
                  </div>
                </div>
              </>
            );
          }}
        />
        <Route
          path={`${protxRoute}/demographics`}
          render={() => {
            // observedFeatures (i.e. Demographic Features) only has 2019 data.
            setYear('2019');
            setMapType('observedFeatures');
            return (
              <>
                <DisplaySelectors
                  mapType={mapType}
                  geography={geography}
                  maltreatmentTypes={maltreatmentTypes}
                  observedFeature={observedFeature}
                  year={year}
                  showRate={showRate}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  setGeography={setGeography}
                  setShowRate={setShowRate}
                />
                <div className="display-layout-root">
                  <div className="display-layout-map">
                    <MainMap
                      mapType={mapType}
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      showRate={showRate}
                      year={year}
                      data={data}
                      selectedGeographicFeature={selectedGeographicFeature}
                      setSelectedGeographicFeature={
                        setSelectedGeographicFeature
                      }
                    />
                  </div>
                  <div className="display-layout-chart">
                    <ObservedFeaturesChart
                      mapType={mapType}
                      geography={geography}
                      observedFeature={observedFeature}
                      selectedGeographicFeature={selectedGeographicFeature}
                      data={data}
                      showRate={showRate}
                      showInstructions
                    />
                  </div>
                </div>
              </>
            );
          }}
        />
        <Route
          path={`${protxRoute}/analytics`}
          render={() => {
            setMapType('observedFeatures');
            setYear('2019');
            setGeography('county');
            setShowRate(false);
            return (
              <>
                <DisplaySelectors
                  mapType={mapType}
                  geography={geography}
                  maltreatmentTypes={maltreatmentTypes}
                  observedFeature={observedFeature}
                  year={year}
                  showRate={showRate}
                  setMaltreatmentTypes={setMaltreatmentTypes}
                  setObservedFeature={setObservedFeature}
                  limitToTopObservedFeatureFields
                />
                <div className="display-layout-root">
                  <div className="display-layout-map">
                    <MainMap
                      mapType={mapType}
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      showRate={showRate}
                      data={data}
                      selectedGeographicFeature={selectedGeographicFeature}
                      setSelectedGeographicFeature={
                        setSelectedGeographicFeature
                      }
                    />
                  </div>
                  <div className="display-layout-chart">
                    <PredictiveFeaturesChart
                      mapType={mapType}
                      geography={geography}
                      maltreatmentTypes={maltreatmentTypes}
                      observedFeature={observedFeature}
                      year={year}
                      selectedGeographicFeature={selectedGeographicFeature}
                      data={data}
                      showInstructions
                    />
                  </div>
                </div>
              </>
            );
          }}
        />
        <Redirect from={protxRoute} to={`${protxRoute}/analytics`} />
      </Switch>
    </div>
  );
}

export default DashboardDisplay;
