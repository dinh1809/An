import { useCallback, useRef, useEffect, useState } from "react";

type SoundType = "correct" | "wrong" | "levelUp" | "gameOver";

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  ramp?: "up" | "down";
  secondFrequency?: number;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  correct: {
    frequency: 880, // A5 - High-pitched satisfying "ping"
    duration: 0.15,
    type: "sine",
    volume: 0.2,
    ramp: "down",
  },
  wrong: {
    frequency: 220, // A3 - Low-pitched "thud"
    duration: 0.2,
    type: "triangle",
    volume: 0.15,
    ramp: "down",
  },
  levelUp: {
    frequency: 523.25, // C5 - Ascending chime
    duration: 0.4,
    type: "sine",
    volume: 0.25,
    ramp: "up",
    secondFrequency: 783.99, // G5
  },
  gameOver: {
    frequency: 392, // G4 - Descending tone
    duration: 0.5,
    type: "triangle",
    volume: 0.2,
    ramp: "down",
    secondFrequency: 261.63, // C4
  },
};

interface UseGameSoundReturn {
  playSound: (type: SoundType) => void;
  triggerHaptic: (duration?: number) => void;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  initAudio: () => void;
}

export function useGameSound(): UseGameSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Load mute preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gameSoundMuted");
      if (stored === "true") {
        setIsMuted(true);
      }
    }
  }, []);

  // Initialize audio context (must be called after user interaction)
  const initAudio = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    // Resume if suspended (browsers require user interaction)
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  // Persist mute preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gameSoundMuted", String(isMuted));
    }
  }, [isMuted]);

  // Play a sound effect
  const playSound = useCallback((type: SoundType) => {
    if (isMuted) return;
    if (typeof window === "undefined") return;

    if (!audioContextRef.current) {
      initAudio();
    }

    const ctx = audioContextRef.current;
    if (!ctx) return;

    const config = SOUND_CONFIGS[type];
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

    // Handle frequency transitions for special sounds
    if (config.secondFrequency) {
      oscillator.frequency.linearRampToValueAtTime(
        config.secondFrequency,
        ctx.currentTime + config.duration * 0.8
      );
    }

    // Volume envelope
    gainNode.gain.setValueAtTime(config.volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  }, [isMuted, initAudio]);

  // Trigger haptic feedback (mobile)
  const triggerHaptic = useCallback((duration: number = 50) => {
    if (isMuted) return;
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  }, [isMuted]);

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);

  return {
    playSound,
    triggerHaptic,
    isMuted,
    setMuted,
    initAudio,
  };
}

// Export a context for global access
import { createContext, useContext, ReactNode } from "react";

interface GameSoundContextValue extends UseGameSoundReturn { }

const GameSoundContext = createContext<GameSoundContextValue | null>(null);

export function GameSoundProvider({ children }: { children: ReactNode }) {
  const soundHook = useGameSound();

  return (
    <GameSoundContext.Provider value={soundHook}>
      {children}
    </GameSoundContext.Provider>
  );
}

export function useGameSoundContext(): GameSoundContextValue {
  const context = useContext(GameSoundContext);
  if (!context) {
    throw new Error("useGameSoundContext must be used within GameSoundProvider");
  }
  return context;
}
