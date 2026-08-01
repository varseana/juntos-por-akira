import { useMemo } from "react";
import {
  CatCurled,
  CatSitting,
  YarnBall,
  FishSkeleton,
  Fish,
  PawPrint,
  Mouse,
  Butterfly,
  Flower,
  LeafSprig,
  TeaCup,
  Mushroom,
  Bee,
  StarBig,
  HeartBig,
} from "./Critters";

/**
 * Fondo vivo pero calmado: motivos line-art variados flotando en tres capas de
 * profundidad (lejos, medio, cerca). Cada motivo usa wrappers anidados para que
 * la deriva, el balanceo y el giro tengan duraciones independientes. Colores
 * pastel y opacidades bajas: se sienten, no distraen. Respeta reduce-motion.
 */

type Tier = "far" | "mid" | "near";

interface Floater {
  Comp: React.ComponentType<{ className?: string; color?: string }>;
  top: string;
  left: string;
  tier: Tier;
  color: string;
  driftDelay: number;
  bobDelay: number;
  swayDelay: number;
}

const INK = "#8a6d9c";
const PINK = "#d98a9a";
const MINT = "#7cc39b";
const GOLD = "#e0b64a";
const LAV = "#b79ec9";

// Distribucion pensada para cubrir el viewport sin amontonarse.
const FLOATERS: Floater[] = [
  { Comp: CatCurled, top: "10%", left: "6%", tier: "near", color: INK, driftDelay: 0, bobDelay: 0, swayDelay: 0 },
  { Comp: YarnBall, top: "18%", left: "84%", tier: "mid", color: PINK, driftDelay: -6, bobDelay: -2, swayDelay: -4 },
  { Comp: FishSkeleton, top: "44%", left: "90%", tier: "far", color: LAV, driftDelay: -12, bobDelay: -5, swayDelay: -8 },
  { Comp: PawPrint, top: "62%", left: "4%", tier: "mid", color: MINT, driftDelay: -3, bobDelay: -1, swayDelay: -6 },
  { Comp: CatSitting, top: "74%", left: "88%", tier: "near", color: INK, driftDelay: -9, bobDelay: -4, swayDelay: -2 },
  { Comp: Butterfly, top: "34%", left: "48%", tier: "far", color: LAV, driftDelay: -15, bobDelay: -7, swayDelay: -10 },
  { Comp: Flower, top: "86%", left: "34%", tier: "mid", color: PINK, driftDelay: -5, bobDelay: -3, swayDelay: -1 },
  { Comp: Fish, top: "6%", left: "62%", tier: "far", color: MINT, driftDelay: -18, bobDelay: -6, swayDelay: -12 },
  { Comp: Mouse, top: "52%", left: "16%", tier: "far", color: LAV, driftDelay: -7, bobDelay: -9, swayDelay: -3 },
  { Comp: TeaCup, top: "26%", left: "24%", tier: "far", color: GOLD, driftDelay: -11, bobDelay: -2, swayDelay: -7 },
  { Comp: Mushroom, top: "68%", left: "56%", tier: "far", color: PINK, driftDelay: -14, bobDelay: -8, swayDelay: -9 },
  { Comp: LeafSprig, top: "90%", left: "72%", tier: "far", color: MINT, driftDelay: -4, bobDelay: -6, swayDelay: -11 },
  { Comp: Bee, top: "14%", left: "40%", tier: "far", color: GOLD, driftDelay: -16, bobDelay: -3, swayDelay: -5 },
  { Comp: StarBig, top: "48%", left: "68%", tier: "far", color: GOLD, driftDelay: -8, bobDelay: -10, swayDelay: -2 },
  { Comp: HeartBig, top: "80%", left: "18%", tier: "far", color: PINK, driftDelay: -10, bobDelay: -4, swayDelay: -8 },
];

export function CatBackground() {
  // Duraciones ligeramente distintas por indice para desincronizar el conjunto.
  const floaters = useMemo(() => FLOATERS, []);

  return (
    <div className="bg-critters" aria-hidden="true">
      {/* Luz calida difusa detras del contenido */}
      <div className="bg-glow" />
      {floaters.map((f, i) => {
        const driftDur = f.tier === "near" ? 24 : f.tier === "mid" ? 32 : 42;
        const bobDur = 8 + (i % 5);
        const swayDur = 18 + (i % 7);
        const Comp = f.Comp;
        return (
          <div
            key={i}
            className={`float float--${f.tier}`}
            style={{
              top: f.top,
              left: f.left,
              color: f.color,
              animationDuration: `${driftDur}s`,
              animationDelay: `${f.driftDelay}s`,
            }}
          >
            <div
              className="bob"
              style={{
                animationDuration: `${bobDur}s`,
                animationDelay: `${f.bobDelay}s`,
              }}
            >
              <div
                className="sway"
                style={{
                  animationDuration: `${swayDur}s`,
                  animationDelay: `${f.swayDelay}s`,
                }}
              >
                <Comp className="critter" color={f.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
