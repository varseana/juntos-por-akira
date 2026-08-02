import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RaffleNumber } from "../lib/types";
import { SketchBox } from "./SketchBox";
import { playSuccess } from "../lib/sfx";

interface ReelDrawProps {
  numbers: RaffleNumber[];
  isAdmin: boolean;
}

// Debe coincidir con .reel-card en styles.css: ancho + margen derecho.
const CARD_W = 96;
const GAP = 12;
const UNIT = CARD_W + GAP;
const IDLE_SPEED = 90; // pixeles por segundo
const SPIN_MS = 5200;
const SPIN_LEAD = 46; // tarjetas que pasan antes de la ganadora
const SPIN_TAIL = 12; // tarjetas despues, para que nunca quede vacio a la derecha

/** Mezcla una lista sin tocar la original (Fisher-Yates). */
function shuffle<T>(input: T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/**
 * Carril horizontal infinito con los 300 numeros en orden aleatorio. Cada
 * tarjeta muestra el numero y, si ya se vendio, el nombre de quien lo compro.
 *
 * En reposo se mueve con una animacion de CSS sobre dos copias de la tira, asi
 * el ciclo cierra sin costura y sin recalcular nada en JavaScript. Arranca desde
 * un punto al azar en cada visita.
 *
 * El publico solo ve el carril moverse. El boton para escoger la ganadora
 * aparece unicamente con sesion de administracion: en ese caso el carril acelera
 * y desacelera hasta dejar la tarjeta premiada en el centro.
 */
export function ReelDraw({ numbers, isAdmin }: ReelDrawProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);

  const [spinStrip, setSpinStrip] = useState<number[] | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);

  const byN = useMemo(() => {
    const map = new Map<number, RaffleNumber>();
    for (const item of numbers) map.set(item.n, item);
    return map;
  }, [numbers]);

  // Orden aleatorio fijo mientras el componente este montado. Depende solo de
  // la cantidad para que un cambio de estado de un numero no vuelva a mezclar
  // el carril entero mientras la persona lo esta viendo.
  const poolSize = numbers.length;
  const pool = useMemo(
    () => shuffle(Array.from({ length: poolSize }, (_, i) => i + 1)),
    [poolSize]
  );

  const soldNumbers = useMemo(
    () => numbers.filter((item) => item.status === "sold").map((item) => item.n),
    [numbers]
  );

  const nameOf = useCallback(
    (n: number) => byN.get(n)?.buyer_name?.trim() ?? "",
    [byN]
  );

  // Una copia recorre su ancho completo; se pintan dos copias y se desplaza
  // media tira, con lo que el corte cae en una posicion identica.
  const oneCopyWidth = pool.length * UNIT;
  const idleDuration = oneCopyWidth / IDLE_SPEED;
  // Punto de arranque al azar, distinto en cada visita.
  const idleDelay = useMemo(() => -(Math.random() * idleDuration), [idleDuration]);

  const spin = () => {
    if (spinStrip || soldNumbers.length === 0) return;
    const target = soldNumbers[Math.floor(Math.random() * soldNumbers.length)];

    // Relleno antes y despues de la ganadora, del mismo orden aleatorio.
    const filler = shuffle(pool.filter((n) => n !== target));
    const lead: number[] = [];
    for (let i = 0; i < SPIN_LEAD; i += 1) {
      lead.push(filler[i % filler.length]);
    }
    const tail: number[] = [];
    for (let i = 0; i < SPIN_TAIL; i += 1) {
      tail.push(filler[(SPIN_LEAD + i) % filler.length]);
    }

    setWinner(null);
    setSpinStrip([...lead, target, ...tail]);
  };

  // Arranca la animacion guiada una vez que la tira ya esta en el DOM.
  useEffect(() => {
    if (!spinStrip) return;
    const track = spinRef.current;
    const host = hostRef.current;
    if (!track || !host) return;

    const center = host.clientWidth / 2 - CARD_W / 2;
    const end = -(SPIN_LEAD * UNIT) + center;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    track.style.transition = "none";
    track.style.transform = "translate3d(0, 0, 0)";

    const raf = window.requestAnimationFrame(() => {
      track.style.transition = reduce
        ? "none"
        : `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.03, 1)`;
      track.style.transform = `translate3d(${end}px, 0, 0)`;
    });

    const finish = () => {
      setWinner(spinStrip[SPIN_LEAD]);
      setBurst((b) => b + 1);
      playSuccess();
    };

    if (reduce) {
      // Sin animacion: se resuelve de una vez.
      const t = window.setTimeout(finish, 60);
      return () => {
        window.cancelAnimationFrame(raf);
        window.clearTimeout(t);
      };
    }

    track.addEventListener("transitionend", finish);
    return () => {
      window.cancelAnimationFrame(raf);
      track.removeEventListener("transitionend", finish);
    };
  }, [spinStrip]);

  const backToIdle = () => {
    setWinner(null);
    setSpinStrip(null);
  };

  if (pool.length === 0) return null;

  const spinning = spinStrip !== null;

  return (
    <SketchBox className="paper" fill="#d9efe2" seed={91} washi>
      <h2 className="section-title" style={{ textAlign: "center" }}>
        El carril de la suerte
      </h2>
      <p className="section-sub" style={{ textAlign: "center" }}>
        Cuando todos los numeros esten vendidos, aqui se escoge al ganador.
      </p>

      <div className="reel" ref={hostRef}>
        {/* Marca del centro: ahi cae la tarjeta ganadora */}
        <span className="reel-marker" aria-hidden="true" />

        {spinning ? (
          <div className="reel-track" ref={spinRef}>
            {spinStrip.map((n, i) => (
              <ReelCard
                key={`s-${i}`}
                n={n}
                sold={byN.get(n)?.status === "sold"}
                name={nameOf(n)}
                win={winner !== null && i === SPIN_LEAD}
              />
            ))}
          </div>
        ) : (
          <div
            className="reel-track reel-idle"
            style={{
              animationDuration: `${idleDuration}s`,
              animationDelay: `${idleDelay}s`,
            }}
          >
            {/* Dos copias del mismo orden: el ciclo cierra sin costura */}
            {[0, 1].map((copy) =>
              pool.map((n) => (
                <ReelCard
                  key={`${copy}-${n}`}
                  n={n}
                  sold={byN.get(n)?.status === "sold"}
                  name={nameOf(n)}
                  win={false}
                />
              ))
            )}
          </div>
        )}

        <span className="reel-fade left" aria-hidden="true" />
        <span className="reel-fade right" aria-hidden="true" />

        {burst > 0 && winner !== null && (
          <div className="reel-confetti" key={burst} aria-hidden="true">
            {Array.from({ length: 26 }, (_, i) => (
              <span
                key={i}
                className="conf"
                style={{
                  left: `${50 + (i - 13) * 3.4}%`,
                  animationDelay: `${(i % 7) * 60}ms`,
                  ["--dx" as string]: `${(i - 13) * 14}px`,
                  ["--rot" as string]: `${(i % 5) * 90 + 45}deg`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {winner !== null && (
        <div className="reel-result">
          <span className="reel-result-k">Numero premiado</span>
          <span className="reel-result-v">
            {winner}
            {nameOf(winner) ? ` con ${nameOf(winner)}` : ""}
          </span>
        </div>
      )}

      {/* El sorteo solo se puede correr desde la sesion de administracion. */}
      {isAdmin && (
        <div className="row" style={{ marginTop: 16 }}>
          <button
            className="btn"
            type="button"
            onClick={spin}
            disabled={spinning || soldNumbers.length === 0}
          >
            {spinning && winner === null ? "Girando..." : "Escoger ganador"}
          </button>
          {spinning && (
            <button className="btn ghost" type="button" onClick={backToIdle}>
              Volver al carril
            </button>
          )}
          {soldNumbers.length === 0 && (
            <span className="field-hint">
              Todavia no hay numeros vendidos para sortear.
            </span>
          )}
        </div>
      )}
    </SketchBox>
  );
}

interface ReelCardProps {
  n: number;
  sold: boolean;
  name: string;
  win: boolean;
}

function ReelCard({ n, sold, name, win }: ReelCardProps) {
  return (
    <div className={`reel-card ${sold ? "sold" : ""} ${win ? "win" : ""}`}>
      <span className="reel-n">{n}</span>
      <span className="reel-name">{sold ? name || "Vendido" : "Libre"}</span>
    </div>
  );
}
