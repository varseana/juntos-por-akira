/**
 * Motivos line-art para el fondo: gatos, bolita de lana, esqueleto de pez, pez,
 * huella, raton, mariposa, flor, hoja, taza, hongo, abeja, estrella, corazon.
 * Todos en viewBox 0 0 100 100, trazo unico, sin relleno pesado. Decorativos.
 */
import type { ComponentType } from "react";

interface CritterProps {
  className?: string;
  color?: string;
}

const svgProps = (color: string) => ({
  viewBox: "0 0 100 100",
  fill: "none",
  stroke: color,
  strokeWidth: 3.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
});

const dot = (color: string) => ({ fill: color, stroke: "none" });

export function CatCurled({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M50 30 C28 30 18 48 22 66 C25 80 42 82 58 80 C76 78 84 64 80 50 C77 39 66 34 58 40 C63 30 57 24 50 30 Z" />
      <path d="M50 30 l6 -8 M50 30 l-4 -9" />
      <path d="M78 66 C88 66 90 56 82 54" />
    </svg>
  );
}

export function CatSitting({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M34 30 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0" />
      <path d="M37 20 l-4 -12 l12 6 M63 20 l4 -12 l-12 6" />
      <path d="M34 42 C30 60 30 78 34 84 L66 84 C70 78 70 60 66 42" />
      <path d="M66 82 C82 82 84 66 74 60" />
      <circle cx="44" cy="30" r="1.8" {...dot(color)} />
      <circle cx="56" cy="30" r="1.8" {...dot(color)} />
    </svg>
  );
}

export function YarnBall({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <circle cx="46" cy="52" r="26" />
      <path d="M28 34 C44 46 48 60 40 76" />
      <path d="M64 34 C48 46 44 60 52 76" />
      <path d="M30 42 C50 50 54 62 68 60" />
      <path d="M70 66 C84 70 88 82 80 90 C76 94 70 92 72 86" />
    </svg>
  );
}

export function FishSkeleton({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <circle cx="24" cy="50" r="10" />
      <circle cx="20" cy="47" r="1.8" {...dot(color)} />
      <path d="M34 50 H82" />
      <path d="M42 40 L42 60 M52 38 L52 62 M62 40 L62 60 M72 42 L72 58" />
      <path d="M82 50 L94 40 M82 50 L94 60 M94 40 L94 60" />
    </svg>
  );
}

export function Fish({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M18 50 C34 34 60 34 74 50 C60 66 34 66 18 50 Z" />
      <path d="M74 50 L90 40 M74 50 L90 60 M90 40 L90 60" />
      <path d="M32 44 C36 50 36 50 32 56" />
      <circle cx="30" cy="48" r="2" {...dot(color)} />
    </svg>
  );
}

export function PawPrint({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M50 58 C40 58 34 66 34 74 C34 82 42 84 50 84 C58 84 66 82 66 74 C66 66 60 58 50 58 Z" />
      <circle cx="34" cy="46" r="6" />
      <circle cx="47" cy="40" r="6" />
      <circle cx="61" cy="42" r="6" />
      <circle cx="70" cy="52" r="5.5" />
    </svg>
  );
}

export function Mouse({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M30 66 C30 50 46 44 58 50 C70 56 72 70 60 76 C48 82 30 80 30 66 Z" />
      <circle cx="40" cy="48" r="9" />
      <circle cx="56" cy="46" r="8" />
      <circle cx="34" cy="60" r="1.8" {...dot(color)} />
      <path d="M62 74 C78 78 82 62 72 58" />
    </svg>
  );
}

export function Butterfly({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M50 32 L50 74" />
      <path d="M50 40 C34 24 20 30 26 44 C20 52 34 58 50 48" />
      <path d="M50 40 C66 24 80 30 74 44 C80 52 66 58 50 48" />
      <path d="M50 32 C46 24 42 22 40 20 M50 32 C54 24 58 22 60 20" />
    </svg>
  );
}

export function Flower({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <circle cx="50" cy="40" r="7" />
      <ellipse cx="50" cy="26" rx="6" ry="11" />
      <ellipse cx="50" cy="26" rx="6" ry="11" transform="rotate(72 50 40)" />
      <ellipse cx="50" cy="26" rx="6" ry="11" transform="rotate(144 50 40)" />
      <ellipse cx="50" cy="26" rx="6" ry="11" transform="rotate(216 50 40)" />
      <ellipse cx="50" cy="26" rx="6" ry="11" transform="rotate(288 50 40)" />
      <path d="M50 47 L50 84" />
      <path d="M50 66 C40 60 34 64 36 72 C46 74 50 70 50 66" />
    </svg>
  );
}

export function LeafSprig({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M50 88 C50 60 54 40 60 20" />
      <path d="M54 68 C40 64 34 72 40 82 C52 82 56 74 54 68 Z" />
      <path d="M56 52 C70 48 76 56 70 66 C58 66 54 58 56 52 Z" />
      <path d="M54 34 C42 30 36 38 42 48 C54 48 56 40 54 34 Z" />
    </svg>
  );
}

export function TeaCup({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M30 46 L70 46 C68 66 62 72 50 72 C38 72 32 66 30 46 Z" />
      <path d="M70 50 C82 50 82 64 70 64" />
      <path d="M26 78 L74 78" />
      <path d="M42 38 C46 32 40 28 44 22 M56 38 C60 32 54 28 58 22" />
    </svg>
  );
}

export function Mushroom({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M22 48 C22 30 40 20 50 20 C60 20 78 30 78 48 C60 54 40 54 22 48 Z" />
      <path d="M40 50 C40 66 40 76 46 82 L54 82 C60 76 60 66 60 50" />
      <circle cx="38" cy="38" r="3" />
      <circle cx="55" cy="34" r="4" />
      <circle cx="65" cy="42" r="2.5" />
    </svg>
  );
}

export function Bee({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <ellipse cx="50" cy="54" rx="20" ry="14" />
      <path d="M44 42 L44 66 M54 42 L54 66" />
      <path d="M40 44 C28 30 22 42 34 48 M60 44 C72 30 78 42 66 48" />
      <path d="M70 54 L80 54" />
      <path d="M40 42 C36 34 34 34 32 32 M46 40 C44 34 44 34 42 30" />
    </svg>
  );
}

export function StarBig({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M50 18 L59 40 L83 42 L64 57 L71 80 L50 66 L29 80 L36 57 L17 42 L41 40 Z" />
    </svg>
  );
}

export function HeartBig({ className, color = "#8a6d9c" }: CritterProps) {
  return (
    <svg className={className} {...svgProps(color)}>
      <path d="M50 78 C20 58 22 30 40 30 C48 30 50 38 50 42 C50 38 52 30 60 30 C78 30 80 58 50 78 Z" />
    </svg>
  );
}

export const CRITTERS: ComponentType<CritterProps>[] = [
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
];
