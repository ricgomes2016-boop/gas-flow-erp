import { useRef, useCallback, useEffect } from "react";

/**
 * Hook that plays a persistent alarm sound in a loop until stopped.
 * Uses Web Audio API to generate an alert tone (no external audio file needed).
 */
export function useDeliveryAlarm() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);

  const playBeep = useCallback((ctx: AudioContext) => {
    // Play two-tone alert beep
    const now = ctx.currentTime;

    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "square";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second tone (higher)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(1100, now + 0.18);
    gain2.gain.setValueAtTime(0.3, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.35);

    // Third tone (even higher for urgency)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "square";
    osc3.frequency.setValueAtTime(1320, now + 0.4);
    gain3.gain.setValueAtTime(0.35, now + 0.4);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.4);
    osc3.stop(now + 0.6);
  }, []);

  const startAlarm = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      // Play immediately
      playBeep(ctx);

      // Repeat every 2 seconds
      intervalRef.current = setInterval(() => {
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        playBeep(ctx);
      }, 2000);
    } catch (e) {
      console.warn("Web Audio API não disponível:", e);
    }
  }, [playBeep]);

  const stopAlarm = useCallback(() => {
    isPlayingRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, [stopAlarm]);

  return { startAlarm, stopAlarm, isPlaying: isPlayingRef };
}
