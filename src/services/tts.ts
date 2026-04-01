/**
 * Text-to-Speech service using Web Speech API
 * Optimized for children's English word learning
 *
 * Voice quality priority:
 * - macOS: Samantha (en-US), Karen (en-AU), Daniel (en-GB) are high quality
 * - iOS: Samantha (Enhanced) is excellent
 * - Chrome: Google UK English Female/Male are clear and natural
 * - Edge: Microsoft natural voices are very good
 */
class TTSService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private initialized = false;
  private voiceList: SpeechSynthesisVoice[] = [];

  async init(): Promise<void> {
    if (this.initialized) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.synth = window.speechSynthesis;
    this.voiceList = await this.getVoices();
    this.voice = this.selectBestVoice(this.voiceList);

    if (this.voice) {
      console.info(`[TTS] Selected voice: ${this.voice.name} (${this.voice.lang})`);
    }

    this.initialized = true;
  }

  /**
   * Speak a word or phrase
   * For single words: slightly faster rate for natural sound
   * For phrases: slower rate for clarity
   */
  speak(text: string, rate?: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      // Workaround: Chrome sometimes pauses mid-speech if the synth
      // has been idle. Calling resume() before speak() prevents this.
      this.synth.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      // Auto-detect: single word vs phrase
      const isSingleWord = !text.includes(' ');
      const defaultRate = isSingleWord ? 0.9 : 0.8;
      utterance.rate = rate ?? defaultRate;

      // Keep pitch natural — don't artificially adjust
      utterance.pitch = 1.0;
      utterance.volume = 1;

      if (this.voice) {
        utterance.voice = this.voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // Graceful degradation

      this.synth.speak(utterance);

      // Chrome bug workaround: long utterances get cut off after ~15s
      // Keep-alive timer resets the pause detection
      if (isSingleWord) return;
      const keepAlive = setInterval(() => {
        if (!this.synth?.speaking) {
          clearInterval(keepAlive);
          return;
        }
        this.synth.pause();
        this.synth.resume();
      }, 10000);

      utterance.onend = () => {
        clearInterval(keepAlive);
        resolve();
      };
    });
  }

  /**
   * Speak a word twice — once normal, once slow
   * Great for learning: kids hear the natural pronunciation first,
   * then a slow version to catch each sound
   */
  async speakTwice(text: string): Promise<void> {
    await this.speak(text, 0.9);
    // Small pause between repetitions
    await new Promise((r) => setTimeout(r, 400));
    await this.speak(text, 0.7);
  }

  stop(): void {
    this.synth?.cancel();
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voiceList.filter((v) => v.lang.startsWith('en'));
  }

  getCurrentVoiceName(): string {
    return this.voice?.name ?? 'Default';
  }

  /**
   * Allow user to switch voice
   */
  setVoice(voiceName: string): void {
    const voice = this.voiceList.find((v) => v.name === voiceName);
    if (voice) {
      this.voice = voice;
    }
  }

  /**
   * Select the best available voice with ranked preferences
   * Prioritizes natural-sounding, clear female voices (research shows
   * children respond better to them in educational contexts)
   */
  private selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;

    // Ranked voice preferences — tested on macOS/iOS/Chrome/Edge
    // Higher priority = better quality for children's word learning
    const preferences = [
      // macOS / iOS premium voices (very natural)
      (v: SpeechSynthesisVoice) => v.name === 'Samantha' && v.lang === 'en-US',
      (v: SpeechSynthesisVoice) => v.name.includes('Samantha (Enhanced)'),
      (v: SpeechSynthesisVoice) => v.name === 'Karen' && v.lang === 'en-AU',
      (v: SpeechSynthesisVoice) => v.name === 'Moira' && v.lang === 'en-IE',
      (v: SpeechSynthesisVoice) => v.name === 'Tessa' && v.lang === 'en-ZA',
      (v: SpeechSynthesisVoice) => v.name === 'Daniel' && v.lang === 'en-GB',

      // Chrome Google voices (good quality, consistent cross-platform)
      (v: SpeechSynthesisVoice) => v.name === 'Google UK English Female',
      (v: SpeechSynthesisVoice) => v.name === 'Google US English',
      (v: SpeechSynthesisVoice) => v.name === 'Google UK English Male',

      // Edge Microsoft natural voices (excellent if available)
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.name.includes('Natural') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.startsWith('en'),

      // Generic fallbacks — prefer en-US, then any English
      (v: SpeechSynthesisVoice) => v.lang === 'en-US' && !v.name.includes('Compact'),
      (v: SpeechSynthesisVoice) => v.lang === 'en-GB' && !v.name.includes('Compact'),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
    ];

    for (const predicate of preferences) {
      const match = voices.find(predicate);
      if (match) return match;
    }

    return voices[0];
  }

  private getVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve([]);
        return;
      }

      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Chrome/Safari load voices asynchronously
      const onVoicesChanged = () => {
        const v = this.synth?.getVoices() ?? [];
        if (v.length > 0) {
          this.synth?.removeEventListener('voiceschanged', onVoicesChanged);
          resolve(v);
        }
      };

      this.synth.addEventListener('voiceschanged', onVoicesChanged);

      // Timeout fallback — some browsers never fire voiceschanged
      setTimeout(() => {
        this.synth?.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(this.synth?.getVoices() ?? []);
      }, 2000);
    });
  }
}

export const tts = new TTSService();
