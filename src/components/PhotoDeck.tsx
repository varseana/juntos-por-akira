import { useCallback, useEffect, useRef, useState } from "react";

interface PhotoDeckProps {
  photos: string[];
}

const AUTO_MS = 4000;
const LIFT_MS = 480;

/**
 * Pila de fotos con profundidad: la del frente se eleva en un arco y pasa al
 * fondo mientras las demas avanzan, con transicion suave. Avanza sola cada 4s y
 * tambien al hacer clic o tocar. Elementos persistentes (no se recrean) para
 * que la animacion CSS corra fluida. Respeta prefers-reduced-motion.
 */
export function PhotoDeck({ photos }: PhotoDeckProps) {
  // pos[i] = posicion visual de la foto i (0 = frente).
  const [pos, setPos] = useState<number[]>(() => photos.map((_, i) => i));
  const [leaving, setLeaving] = useState<number | null>(null);
  const animating = useRef(false);
  const timer = useRef<number | null>(null);

  // Si cambia la cantidad de fotos, reinicia el orden.
  useEffect(() => {
    setPos(photos.map((_, i) => i));
    setLeaving(null);
  }, [photos.length]);

  const advance = useCallback(() => {
    if (animating.current || photos.length < 2) return;
    animating.current = true;
    const frontIdx = pos.indexOf(0);
    setLeaving(frontIdx);
    window.setTimeout(() => {
      // Todas avanzan una posicion; la del frente (0) va al fondo (n-1).
      setPos((prev) => prev.map((p) => (p + photos.length - 1) % photos.length));
      setLeaving(null);
      animating.current = false;
    }, LIFT_MS);
  }, [pos, photos.length]);

  // Auto avance calmado.
  useEffect(() => {
    if (photos.length < 2) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;
    timer.current = window.setInterval(advance, AUTO_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [advance, photos.length]);

  if (photos.length === 0) return null;

  // Una sola foto: se muestra sin pila ni animacion.
  if (photos.length === 1) {
    return (
      <div className="photo-deck single">
        <img className="deck-photo" src={photos[0]} alt="Foto de Akira" />
      </div>
    );
  }

  return (
    <div
      className="photo-deck"
      onClick={advance}
      role="button"
      tabIndex={0}
      aria-label="Ver la siguiente foto de Akira"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advance();
        }
      }}
    >
      {photos.map((url, i) => {
        const visualPos = Math.min(pos[i], 2);
        const cls =
          leaving === i ? "deck-photo leaving" : `deck-photo pos-${visualPos}`;
        return (
          <img key={url} className={cls} src={url} alt="Foto de Akira" />
        );
      })}
      <span className="deck-hint">Toca para ver mas</span>
    </div>
  );
}
