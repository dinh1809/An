// Nominatim Geocoding Utility
// Uses OpenStreetMap's free geocoding API

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

export const searchLocation = async (query: string): Promise<GeocodingResult | null> => {
  if (!query.trim()) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

export const searchLocations = async (query: string, limit = 5): Promise<GeocodingResult[]> => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    return (data || []).map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};
