import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import L from 'leaflet';
import { Message, LoadingSpinner, DropdownSelector } from '_common';
import MapProviders from './MapProviders';
import './MainMap.css';
import './MainMap.module.scss';
import 'leaflet/dist/leaflet.css';

function MainMap() {
  let mapContainer;
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector(state => state.protx);

  // Get systems and any other initial data we need from the backend
  useEffect(() => {
    dispatch({ type: 'FETCH_PROTX' });
  }, []);

  useEffect(() => {
    if (loading === true) {
      return;
    }
    const initialState = {
      lat: 32.7767,
      lng: -96.797,
      zoom: 12,
      minZoom: 5,
      maxZoom: 17
    };

    const map = L.map(mapContainer).setView(
      [initialState.lat, initialState.lng],
      initialState.zoom
    );

    // Create Layers Control.
    const { providers, layers: baseMaps } = MapProviders();
    providers[3].addTo(map);
    const overlayMaps = {};
    L.control.layers(baseMaps, overlayMaps).addTo(map);
  }, [loading, data, mapContainer]);

  if (error) {
    return (
      <div styleName="root">
        <Message type="error">
          There was a problem loading the map.
        </Message>
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
      <div styleName="control-bar-container">
        <div styleName="control">
          <span styleName="label">Select Area</span>
          <DropdownSelector>
            <optgroup label="Select Areas">
              <option value="dfpsRegions">DFPS Regions</option>
              <option value="counties">Counties</option>
              <option value="metropolitanAreas">Metropolitan Areas</option>
              <option value="cities">Cities</option>
              <option value="zipCodes">Zip Codes</option>
              <option value="schoolDistricts">School Districts</option>
              <option value="censusTracts">Census Tracts</option>
            </optgroup>
          </DropdownSelector>
        </div>
        <div styleName="control">
          <span styleName="label">Select Display</span>
          <DropdownSelector>
            <optgroup label="Select Display">
              <option value="allCIs">All CIs</option>
              <option value="selectCIs">Select CIs</option>
              <option value="trendOverTime">Trend Over Time</option>
              <option value="thresholds">Thresholds</option>
              <option value="nbhdSocialTapestry">NbhdS ocialTapestry</option>
              <option value="socialCorrelates">Social Correlates</option>
              <option value="predictions">Predictions</option>
              <option value="resources">Sesources</option>
            </optgroup>
          </DropdownSelector>
        </div>
        <div styleName="control">
          <span styleName="label">Select TimeFrame</span>
          <DropdownSelector disabled>
            <optgroup label="Select Timeframe" />
          </DropdownSelector>
        </div>
      </div>
      <div
        styleName="map"
        className="map-container"
        ref={el => (mapContainer = el)}
      />
    </div>
  );
}

export default MainMap;
