import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const burst = useCallback((options?: { origin?: { x: number; y: number } }) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: options?.origin ?? { y: 0.6 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#51CF66', '#A78BFA', '#FF9800'],
    });
  }, []);

  const rain = useCallback(() => {
    const end = Date.now() + 2500;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 25,
        startVelocity: 20,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#51CF66', '#A78BFA'],
      });
    }, 200);
  }, []);

  const stars = useCallback(() => {
    const defaults = { spread: 360, ticks: 80, gravity: 0.4, decay: 0.94, startVelocity: 15 };
    confetti({ ...defaults, particleCount: 50, scalar: 1.2, shapes: ['star'], colors: ['#FFE66D', '#FF9800', '#FF6B6B'] });
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 30, scalar: 0.8, shapes: ['star'], colors: ['#FFE66D', '#FFA94D'] });
    }, 300);
  }, []);

  return { burst, rain, stars };
}
