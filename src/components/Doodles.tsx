/**
 * Pequenos motivos handmade dibujados como SVG inline: estrellas, destellos,
 * corazones, hojas y guirnalda (bunting). Trazo tipo lapiz, sin relleno pesado.
 * Todos son decorativos (aria-hidden).
 */

interface DoodleProps {
  size?: number;
  className?: string;
  color?: string;
}

const base = (color: string) => ({
  fill: "none",
  stroke: color,
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function Sparkle({ size = 24, className, color = "#8a6d9c" }: DoodleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...base(color)}
    >
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      <path d="M12 9c0 1.6 1.4 3 3 3-1.6 0-3 1.4-3 3 0-1.6-1.4-3-3-3 1.6 0 3-1.4 3-3z" />
    </svg>
  );
}

export function Star({ size = 24, className, color = "#8a6d9c" }: DoodleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...base(color)}
    >
      <path d="M12 3l2.4 5.6 6 .5-4.6 3.9 1.5 5.9L12 16.6 6.7 19.4l1.5-5.9L3.6 9.6l6-.5z" />
    </svg>
  );
}

export function Heart({ size = 24, className, color = "#8a6d9c" }: DoodleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...base(color)}
    >
      <path d="M12 20C2 13 6 5 12 9c6-4 10 4 0 11z" />
    </svg>
  );
}

export function Leaf({ size = 24, className, color = "#8a6d9c" }: DoodleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...base(color)}
    >
      <path d="M4 20C4 10 12 4 20 4c0 10-8 16-16 16z" />
      <path d="M4 20C8 16 12 12 20 4" />
    </svg>
  );
}

/** Huella de gato, en trazo de lapiz. */
export function Paw({ size = 20, className, color = "#8a6d9c" }: DoodleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...base(color)}
      strokeWidth={1.8}
    >
      <ellipse cx="7.5" cy="9" rx="2.1" ry="2.6" />
      <ellipse cx="12" cy="7" rx="2.1" ry="2.6" />
      <ellipse cx="16.5" cy="9" rx="2.1" ry="2.6" />
      <path d="M12 13c-3 0-5 2.2-5 4.3S9.2 20 12 20s5-.6 5-2.7S15 13 12 13z" />
    </svg>
  );
}

/** Guirnalda de banderines (bunting) para colgar sobre un titulo. */
export function Bunting({
  className,
  color = "#8a6d9c",
  width = 240,
}: DoodleProps & { width?: number }) {
  const fills = ["#f3c9d4", "#bfe3cf", "#d9cdeb", "#f4e7d3", "#f9dfe6"];
  const flags = [20, 64, 108, 152, 196];
  return (
    <svg
      width={width}
      height={40}
      viewBox="0 0 240 40"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 8 Q120 26 234 8"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      {flags.map((x, i) => (
        <path
          key={x}
          d={`M${x} 10 L${x + 24} 12 L${x + 12} 32 Z`}
          fill={fills[i % fills.length]}
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
