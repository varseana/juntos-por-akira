import { useEffect, useMemo, useRef, useState } from "react";
import type { TickerMessage } from "../lib/types";
import { Heart, Star } from "./Doodles";

interface TickerProps {
  messages: TickerMessage[];
}

// Debe coincidir con el gap de .ticker-track en styles.css
const GAP = 44;
// Velocidad de desplazamiento en px por segundo (constante sin importar cuantos
// nombres haya, para que siempre se lea igual de comodo).
const SPEED = 70;

function TickerRow({ items }: { items: string[] }) {
  return (
    <>
      {items.map((text, i) => (
        <span className="ticker-item" key={i}>
          {i % 2 === 0 ? (
            <Heart size={16} color="#e88ba0" className="ticker-doodle" />
          ) : (
            <Star size={16} color="#7cc39b" className="ticker-doodle" />
          )}
          <span className="ticker-text">{text}</span>
        </span>
      ))}
    </>
  );
}

export function Ticker({ messages }: TickerProps) {
  const items = useMemo(
    () =>
      messages.length > 0
        ? messages.map((m) => m.message)
        : ["Gracias a todas las personas que hacen posible esta rifa por Akira"],
    [messages]
  );

  const measureRef = useRef<HTMLDivElement>(null);
  // copies: cuantas veces se repite la lista completa (siempre par, para que la
  // primera mitad sea identica a la segunda y el bucle -50% no tenga costura).
  // duration: se ajusta al ancho para mantener velocidad constante.
  const [layout, setLayout] = useState({ copies: 2, duration: 30 });

  // Mide el ancho de una sola copia de la lista y repite lo suficiente para que
  // media pista supere el ancho de la pantalla. Asi los nombres se "cargan"
  // fuera del marco y el usuario nunca ve espacios blancos.
  useEffect(() => {
    const recompute = () => {
      const el = measureRef.current;
      if (!el) return;
      const unit = el.scrollWidth + GAP;
      if (unit <= 0) return;
      const viewport = window.innerWidth;
      const half = Math.max(1, Math.ceil(viewport / unit) + 1);
      const halfWidth = half * unit;
      setLayout({
        copies: half * 2,
        duration: Math.max(20, Math.round(halfWidth / SPEED)),
      });
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    if (measureRef.current) ro.observe(measureRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [items]);

  // Arranque aleatorio: un delay negativo hace que empiece como si ya llevara un
  // rato corriendo, asi cada visita comienza en un punto distinto.
  const startDelay = useMemo(
    () => -(Math.random() * layout.duration),
    [layout.duration]
  );

  return (
    <div className="ticker-band" role="marquee" aria-label="Agradecimientos">
      {/* Medidor oculto: una sola copia, sin animar, solo para calcular anchos */}
      <div className="ticker-track ticker-measure" ref={measureRef} aria-hidden="true">
        <TickerRow items={items} />
      </div>

      <div
        className="ticker-track"
        style={{
          ["--ticker-duration" as string]: `${layout.duration}s`,
          animationDelay: `${startDelay}s`,
        }}
      >
        {Array.from({ length: layout.copies }).map((_, c) => (
          <TickerRow key={c} items={items} />
        ))}
      </div>
    </div>
  );
}
