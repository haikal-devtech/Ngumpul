/**
 * Calculates distance and duration between two points using Google Distance Matrix API.
 * Requires GOOGLE_MAPS_API_KEY environment variable.
 */
export async function getDistanceMatrix(origin: { lat: number, lng: number }, destination: { lat: number, lng: number }, mode: "driving" | "transit" | "walking" = "driving") {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=${mode}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(data.error_message || "Distance Matrix API error");
  }

  const result = data.rows[0]?.elements[0];
  if (result?.status !== "OK") {
    return null;
  }

  return {
    distance: result.distance.text,
    duration: result.duration.text,
    distanceValue: result.distance.value, // in meters
    durationValue: result.duration.value, // in seconds
  };
}
