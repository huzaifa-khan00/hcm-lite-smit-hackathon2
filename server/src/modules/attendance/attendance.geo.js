import { badRequest } from "../../utils/httpError.js";

const EARTH_RADIUS_M = 6371000;
const rad = (d) => (d * Math.PI) / 180;

export function distanceMeters(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function verifyLocation(office, coords) {
  if (!coords || office?.lat == null || office?.lng == null) return;
  const allowed = office.radiusMeters ?? 150;
  const distance = distanceMeters({ lat: office.lat, lng: office.lng }, coords);
  if (distance > allowed) {
    throw badRequest(
      `You are ${Math.round(distance)} m from the office (allowed ${allowed} m)`,
    );
  }
}
