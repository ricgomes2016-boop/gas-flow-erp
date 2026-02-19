import { useEffect, useRef, useState, useCallback } from "react";
import { haversineDistance } from "@/lib/haversine";

const PROXIMITY_THRESHOLD_METERS = 150;

interface CheckinState {
  isNearby: boolean;
  distanceMeters: number | null;
  destinationCoords: { lat: number; lng: number } | null;
}

export function useProximityCheckin(
  endereco: string | null,
  clienteLat?: number | null,
  clienteLng?: number | null
) {
  const [state, setState] = useState<CheckinState>({
    isNearby: false,
    distanceMeters: null,
    destinationCoords: clienteLat && clienteLng ? { lat: clienteLat, lng: clienteLng } : null,
  });
  const watchIdRef = useRef<number | null>(null);

  const checkProximity = useCallback(
    (driverLat: number, driverLng: number) => {
      if (!state.destinationCoords) return;

      const dist = haversineDistance(
        driverLat,
        driverLng,
        state.destinationCoords.lat,
        state.destinationCoords.lng
      );
      const distMeters = dist * 1000;

      setState((prev) => ({
        ...prev,
        isNearby: distMeters <= PROXIMITY_THRESHOLD_METERS,
        distanceMeters: Math.round(distMeters),
      }));
    },
    [state.destinationCoords]
  );

  useEffect(() => {
    if (clienteLat && clienteLng) {
      setState((prev) => ({
        ...prev,
        destinationCoords: { lat: clienteLat, lng: clienteLng },
      }));
    }
  }, [clienteLat, clienteLng]);

  useEffect(() => {
    if (!state.destinationCoords || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => checkProximity(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [state.destinationCoords, checkProximity]);

  return state;
}
