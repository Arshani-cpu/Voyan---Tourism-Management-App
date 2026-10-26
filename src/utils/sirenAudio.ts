/**
 * Web Audio API synthesizer for emergency acoustic siren
 * Generates alternating European / Two-tone ambulance frequency sweep
 * (750 Hz to 1200 Hz cycle) at high clarity without external audio assets.
 */

let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let sirenInterval: ReturnType<typeof setInterval> | null = null;
let isHighTone = false;

export const startEmergencySiren = (): boolean => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    stopEmergencySiren(); // ensure any previous sound is cleared

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

    // Set gain with safety ramp to prevent clicking
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();

    // Two-tone alternating siren (Hi-Lo frequency alarm)
    sirenInterval = setInterval(() => {
      if (!audioCtx || !oscillator) return;
      isHighTone = !isHighTone;
      const targetFreq = isHighTone ? 1200 : 750;
      oscillator.frequency.cancelScheduledValues(audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.25);
    }, 400);

    return true;
  } catch (err) {
    console.warn('AudioContext not allowed or failed to start:', err);
    return false;
  }
};

export const stopEmergencySiren = () => {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }

  if (oscillator && audioCtx) {
    try {
      if (gainNode) {
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      }
      setTimeout(() => {
        try {
          oscillator?.stop();
          oscillator?.disconnect();
          oscillator = null;
        } catch {
          // ignore
        }
      }, 60);
    } catch {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch {
        // ignore
      }
      oscillator = null;
    }
  }
};
