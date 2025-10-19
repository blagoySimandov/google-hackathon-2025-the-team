export interface LatLng {
  lat: number;
  lng: number;
}

export interface Bounds {
  northeast: LatLng;
  southwest: LatLng;
}

export function isPointInBounds(lat: number, lon: number, bounds: Bounds): boolean {
  return lat >= bounds.southwest.lat &&
         lat <= bounds.northeast.lat &&
         lon >= bounds.southwest.lng &&
         lon <= bounds.northeast.lng;
}

export function getBoundsCenter(bounds: Bounds): LatLng {
  return {
    lat: (bounds.northeast.lat + bounds.southwest.lat) / 2,
    lng: (bounds.northeast.lng + bounds.southwest.lng) / 2,
  };
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
