import { useState, useEffect, useCallback } from 'react';

/**
 * useAqi — fetches real-time air quality data for the user's location.
 *
 * Uses browser geolocation (or stored lat/lon) to call the OpenWeatherMap
 * Air Pollution API. Returns AQI index (1-5), PM2.5, PM10, NO2, and a
 * display badge descriptor.
 *
 * Falls back gracefully: if geolocation is denied or the API fails,
 * returns nulls and does not block the analysis flow.
 *
 * Requires VITE_OWM_API_KEY environment variable (OpenWeatherMap API key).
 */

const AQI_LABELS = {
  1: { label: 'Good Air', color: 'green' },
  2: { label: 'Good Air', color: 'green' },
  3: { label: 'Moderate', color: 'yellow' },
  4: { label: 'Poor Air — Barrier protection recommended', color: 'red' },
  5: { label: 'Poor Air — Barrier protection recommended', color: 'red' },
};

export function useAqi(storedLatLon = null) {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAqi = useCallback(async (lat, lon) => {
    const apiKey = import.meta.env?.VITE_OWM_API_KEY;
    if (!apiKey) {
      // No API key — graceful fallback, do not block
      setAqiData(null);
      return null;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      if (!res.ok) throw new Error(`AQI API returned ${res.status}`);
      const json = await res.json();
      const item = json?.list?.[0];
      if (!item) throw new Error('No AQI data in response');

      const aqi_index = item.main?.aqi ?? null;
      const pm25 = item.components?.pm2_5 ?? null;
      const pm10 = item.components?.pm10 ?? null;
      const no2 = item.components?.no2 ?? null;

      const badge = aqi_index ? AQI_LABELS[aqi_index] : null;

      const data = { aqi_index, pm25, pm10, no2, badge };
      setAqiData(data);
      setError(null);
      return data;
    } catch (e) {
      // Graceful fallback — set nulls, don't block analysis
      setAqiData(null);
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFromGeolocation = useCallback(async () => {
    // Use stored lat/lon if available (from onboarding) — don't re-prompt
    if (storedLatLon?.lat && storedLatLon?.lon) {
      return fetchAqi(storedLatLon.lat, storedLatLon.lon);
    }

    if (!navigator.geolocation) {
      // Fallback: try IP-based estimation
      return fetchFromIP();
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const data = await fetchAqi(pos.coords.latitude, pos.coords.longitude);
          resolve(data);
        },
        async () => {
          // Permission denied — fall back to IP-based city estimation
          const data = await fetchFromIP();
          resolve(data);
        },
        { timeout: 8000, maximumAge: 600000 }
      );
    });
  }, [storedLatLon, fetchAqi]);

  const fetchFromIP = useCallback(async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error('IP geolocation failed');
      const json = await res.json();
      if (json.latitude && json.longitude) {
        return fetchAqi(json.latitude, json.longitude);
      }
    } catch (e) {
      // Silent fallback
    }
    setAqiData(null);
    return null;
  }, [fetchAqi]);

  return { aqiData, loading, error, fetchAqi: fetchFromGeolocation };
}