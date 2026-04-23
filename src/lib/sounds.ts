"use client";

// ── Web Audio sound engine ───────────────────────────────────
// Browsers block audio until the user interacts. We unlock it
// on the first user gesture (click/touch anywhere on the page).

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // Resume if suspended (common on mobile)
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// Call this once on any user gesture to unblock audio
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  const c = getCtx();
  if (!c) return;
  // Play a silent buffer to unlock
  const buf = c.createBuffer(1, 1, 22050);
  const src = c.createBufferSource();
  src.buffer = buf;
  src.connect(c.destination);
  src.start(0);
}

function play(fn: (ctx: AudioContext) => void) {
  try {
    const c = getCtx();
    if (!c) return;
    fn(c);
  } catch { /* silently ignore */ }
}

// Pop/click — short tap sound
export function sfxPop() {
  play((c) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.setValueAtTime(700, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(250, c.currentTime + 0.07);
    g.gain.setValueAtTime(0.35, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
    o.start(); o.stop(c.currentTime + 0.07);
  });
}

// Success chime — ascending notes
export function sfxSuccess() {
  play((c) => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "sine";
      o.frequency.value = freq;
      const t = c.currentTime + i * 0.1;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.start(t); o.stop(t + 0.3);
    });
  });
}

// Wrong/buzzer — descending sawtooth
export function sfxWrong() {
  play((c) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(250, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.3);
    g.gain.setValueAtTime(0.25, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    o.start(); o.stop(c.currentTime + 0.3);
  });
}

// Countdown tick — sharp click
export function sfxTick() {
  play((c) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = 1000;
    g.gain.setValueAtTime(0.2, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
    o.start(); o.stop(c.currentTime + 0.04);
  });
}

// Game over jingle — descending sad notes
export function sfxGameOver() {
  play((c) => {
    [392, 349, 330, 262].forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "triangle";
      o.frequency.value = freq;
      const t = c.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t); o.stop(t + 0.35);
    });
  });
}

// Combo — exciting rising beep
export function sfxCombo() {
  play((c) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = "square";
    o.frequency.setValueAtTime(440, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, c.currentTime + 0.15);
    g.gain.setValueAtTime(0.18, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
    o.start(); o.stop(c.currentTime + 0.15);
  });
}
