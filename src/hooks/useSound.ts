import { useCallback, useEffect, useRef } from 'react';
import { audio } from '@/services/audio';
import { useGameStore } from '@/store/useGameStore';

type SoundName = 'click' | 'correct' | 'wrong' | 'star' | 'badge' | 'flip' | 'match' | 'complete';

export function useSound() {
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      audio.init();
      initialized.current = true;
    }
    audio.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const play = useCallback((name: SoundName) => {
    audio.play(name);
  }, []);

  return { play };
}
