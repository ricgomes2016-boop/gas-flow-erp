export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
}

/**
 * Geocode an address string using Nominatim (OpenStreetMap) - free, no API key needed.
 * Returns the first matching result or null.
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim().length < 5) return null;

  try {
    const query = encodeURIComponent(address.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=br&limit=1&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "pt-BR",
        },
      }
    );

    const data = await response.json();
    if (!data || data.length === 0) return null;

    const result = data[0];
    const addr = result.address || {};

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      endereco: addr.road || undefined,
      bairro: addr.suburb || addr.neighbourhood || undefined,
      cidade: addr.city || addr.town || addr.village || undefined,
      cep: addr.postcode || undefined,
    };
  } catch (error) {
    console.error("Erro ao geocodificar endereço:", error);
    return null;
  }
}

/**
 * Reverse geocode lat/lng to an address using Nominatim.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "pt-BR",
        },
      }
    );

    const result = await response.json();
    if (!result || result.error) return null;

    const addr = result.address || {};

    return {
      latitude: lat,
      longitude: lng,
      displayName: result.display_name,
      endereco: addr.road || undefined,
      bairro: addr.suburb || addr.neighbourhood || undefined,
      cidade: addr.city || addr.town || addr.village || undefined,
      cep: addr.postcode || undefined,
    };
  } catch (error) {
    console.error("Erro ao reverter geocodificação:", error);
    return null;
  }
}
