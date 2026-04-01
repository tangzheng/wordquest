import { useCallback, useEffect, useRef } from 'react';
import { tts } from '@/services/tts';
import { useGameStore } from '@/store/useGameStore';

export function useTTS() {
  const speechRate = useGameStore((s) => s.settings.speechRate);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      tts.init();
      initialized.current = true;
    }
  }, []);

  // Speak with user's preferred rate (or auto-detect if not set)
  const speak = useCallback(
    (text: string) => {
      // If user has customized the rate, use it; otherwise let TTS auto-detect
      const rate = speechRate !== 0.8 ? speechRate : undefined;
      return tts.speak(text, rate);
    },
    [speechRate]
  );

  // Speak word twice: normal speed then slow — great for learning
  const speakTwice = useCallback(
    (text: string) => {
      return tts.speakTwice(text);
    },
    []
  );

  const stop = useCallback(() => {
    tts.stop();
  }, []);

  return {
    speak,
    speakTwice,
    stop,
    isSupported: tts.isSupported(),
    voiceName: tts.getCurrentVoiceName(),
  };
}
