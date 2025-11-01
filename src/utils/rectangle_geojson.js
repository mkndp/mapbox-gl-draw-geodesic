import hat from 'hat';
import * as Constants from '../constants.js';

export function createRectangle(corner1, corner2, properties = {}) {
  if (!corner1 || !corner2) {
    throw new Error('Both corners are required');
  }

  // Calculate rectangle coordinates from two corners
  const minLng = Math.min(corner1[0], corner2[0]);
  const maxLng = Math.max(corner1[0], corner2[0]);
  const minLat = Math.min(corner1[1], corner2[1]);
  const maxLat = Math.max(corner1[1], corner2[1]);

  // Create rectangle polygon: top-left, top-right, bottom-right, bottom-left, back to top-left
  const coordinates = [
    [minLng, maxLat],  // top-left
    [maxLng, maxLat],  // top-right
    [maxLng, minLat],  // bottom-right
    [minLng, minLat],  // bottom-left
    [minLng, maxLat]   // close polygon
  ];

  return {
    id: hat(),
    type: Constants.geojsonTypes.FEATURE,
    properties: {
      [Constants.properties.RECTANGLE]: true,
      ...properties
    },
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [coordinates]
    }
  };
}

export function isRectangleByTypeAndProperties(type, properties) {
  return type === Constants.geojsonTypes.POLYGON &&
    properties[Constants.properties.RECTANGLE] === true;
}

export function isRectangle(geojson) {
  return isRectangleByTypeAndProperties(geojson.geometry.type, geojson.properties);
}

export function getRectangleCorners(geojson) {
  if (!isRectangle(geojson)) {
    throw new Error('GeoJSON is not a rectangle');
  }

  const coords = geojson.geometry.coordinates[0];
  // First corner is top-left, third corner is bottom-right
  return {
    corner1: coords[0], // top-left
    corner2: coords[2]  // bottom-right
  };
}

export function setRectangleCorners(geojson, corner1, corner2) {
  if (!isRectangle(geojson)) {
    throw new Error('GeoJSON is not a rectangle');
  }

  const minLng = Math.min(corner1[0], corner2[0]);
  const maxLng = Math.max(corner1[0], corner2[0]);
  const minLat = Math.min(corner1[1], corner2[1]);
  const maxLat = Math.max(corner1[1], corner2[1]);

  const coordinates = [
    [minLng, maxLat],
    [maxLng, maxLat],
    [maxLng, minLat],
    [minLng, minLat],
    [minLng, maxLat]
  ];

  geojson.geometry.coordinates = [coordinates];
}

