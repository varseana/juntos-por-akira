/**
 * Sonidos "pop" cute generados con Web Audio API. No necesita archivos.
 * Se respeta prefers-reduced-motion y se puede silenciar por completo.
 */

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (muted) return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  // Los navegadores suspenden el contexto hasta la primera interaccion.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    window.localStorage.setItem("akira-muted", value ? "1" : "0");
  } catch {
    // almacenamiento no disponible, se ignora
  }
}

export function getMuted(): boolean {
  try {
    return window.localStorage.getItem("akira-muted") === "1";
  } catch {
    return false;
  }
}

muted = getMuted();

interface PopOptions {
  startFreq: number;
  endFreq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function playTone({
  startFreq,
  endFreq,
  duration,
  type = "sine",
  gain = 0.14,
}: PopOptions) {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const vol = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(endFreq, 1),
    now + duration
  );

  vol.gain.setValueAtTime(0.0001, now);
  vol.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(vol);
  vol.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Pop suave y agudo, para hover / clicks ligeros. */
export function playPop() {
  playTone({ startFreq: 620, endFreq: 880, duration: 0.13, type: "sine" });
}

/** Pop mas alegre y ascendente, para marcar un numero como vendido. */
export function playSuccess() {
  playTone({ startFreq: 520, endFreq: 990, duration: 0.16, type: "triangle" });
  window.setTimeout(
    () =>
      playTone({
        startFreq: 780,
        endFreq: 1320,
        duration: 0.16,
        type: "triangle",
      }),
    90
  );
}

/** Pop descendente, para deshacer o volver a disponible. */
export function playUndo() {
  playTone({ startFreq: 760, endFreq: 380, duration: 0.16, type: "sine" });
}
