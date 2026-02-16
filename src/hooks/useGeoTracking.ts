import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const UPDATE_INTERVAL_MS = 15_000; // 15 seconds

export function useGeoTracking() {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const entregadorIdRef = useRef<string | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < UPDATE_INTERVAL_MS) return;
    if (!entregadorIdRef.current) return;

    lastUpdateRef.current = now;

    try {
      await supabase
        .from("entregadores")
        .update({ latitude: lat, longitude: lng })
        .eq("id", entregadorIdRef.current);
    } catch (err) {
      console.error("Erro ao atualizar localização:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!navigator.geolocation) {
      console.warn("Geolocalização não suportada pelo navegador");
      return;
    }

    const init = async () => {
      // Get entregador id
      const { data } = await supabase
        .from("entregadores")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) return;
      entregadorIdRef.current = data.id;

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn("Erro de geolocalização:", err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 20_000,
          timeout: 15_000,
        }
      );

      // Also get immediate position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Force immediate first update
          lastUpdateRef.current = 0;
          updateLocation(position.coords.latitude, position.coords.longitude);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10_000 }
      );
    };

    init();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [user, updateLocation]);
}
