import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as Constants from '../constants.js';
import { createRectangle, setRectangleCorners } from '../utils/rectangle_geojson.js';
import createGeodesicGeojson from '../utils/create_geodesic_geojson.js';
import dragPan from '../utils/drag_pan.js';

const DrawRectangleGeodesic = {};

DrawRectangleGeodesic.onSetup = function(opts) {
  this.clearSelectedFeatures();
  MapboxDraw.lib.doubleClickZoom.disable(this);
  dragPan.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.setActionableState(); // default actionable state is false for all actions
  return {};
};

DrawRectangleGeodesic.onMouseDown = DrawRectangleGeodesic.onTouchStart = function(state, e) {
  const startCorner = [e.lngLat.lng, e.lngLat.lat];
  // Create a tiny rectangle initially (both corners at same point)
  const rectangle = this.newFeature(createRectangle(startCorner, startCorner));
  this.addFeature(rectangle);
  state.rectangle = rectangle;
  state.startCorner = startCorner;
};

DrawRectangleGeodesic.onDrag = DrawRectangleGeodesic.onTouchMove = function(state, e) {
  if (state.rectangle && state.startCorner) {
    const currentCorner = [e.lngLat.lng, e.lngLat.lat];
    const minLng = Math.min(state.startCorner[0], currentCorner[0]);
    const maxLng = Math.max(state.startCorner[0], currentCorner[0]);
    const minLat = Math.min(state.startCorner[1], currentCorner[1]);
    const maxLat = Math.max(state.startCorner[1], currentCorner[1]);
    
    // Update rectangle coordinates: top-left, top-right, bottom-right, bottom-left
    // Note: Polygon.setCoordinates expects coordinates WITHOUT the closing point
    const coordinates = [
      [minLng, maxLat],  // top-left
      [maxLng, maxLat],  // top-right
      [maxLng, minLat],  // bottom-right
      [minLng, minLat]   // bottom-left
    ];
    
    state.rectangle.setCoordinates([coordinates]);
  }
};

DrawRectangleGeodesic.onMouseUp = DrawRectangleGeodesic.onTouchEnd = function(state, e) {
  if (state.rectangle) {
    this.map.fire(Constants.events.CREATE, { features: [state.rectangle.toGeoJSON()] });
    return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.rectangle.id] });
  }
};

DrawRectangleGeodesic.onKeyUp = function(state, e) {
  if (MapboxDraw.lib.CommonSelectors.isEscapeKey(e)) {
    if (state.rectangle) {
      this.deleteFeature([state.rectangle.id], { silent: true });
    }
    this.changeMode(Constants.modes.SIMPLE_SELECT);
  } else if (MapboxDraw.lib.CommonSelectors.isEnterKey(e) && state.rectangle) {
    this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.rectangle.id] });
  }
};

DrawRectangleGeodesic.onStop = function() {
  this.updateUIClasses({ mouse: Constants.cursors.NONE });
  MapboxDraw.lib.doubleClickZoom.enable(this);
  dragPan.enable(this);
  this.activateUIButton();
}

DrawRectangleGeodesic.toDisplayFeatures = function(state, geojson, display) {
  if (state.rectangle) {
    const isActivePolygon = geojson.properties.id === state.rectangle.id;
    geojson.properties.active = (isActivePolygon) ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
  }

  const displayGeodesic = (geojson) => {
    const geodesicGeojson = createGeodesicGeojson(geojson, { ctx: this._ctx });
    geodesicGeojson.forEach(display);
  };

  displayGeodesic(geojson);
};

export default DrawRectangleGeodesic;

