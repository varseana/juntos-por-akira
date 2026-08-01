import { useEffect, useRef } from "react";
import rough from "roughjs";
import type { RaffleNumber } from "../lib/types";
import { playPop } from "../lib/sfx";

interface NumberCellProps {
  item: RaffleNumber;
  isAdmin: boolean;
  busy: boolean;
  index: number;
  onToggle: (item: RaffleNumber) => void;
}

const CELL = 66;

export function NumberCell({
  item,
  isAdmin,
  busy,
  index,
  onToggle,
}: NumberCellProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const sold = item.status === "sold";

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const rc = rough.svg(svg);
    const node = rc.rectangle(4, 4, CELL - 8, CELL - 8, {
      fill: sold ? "#d98a9a" : "#bfe3cf",
      fillStyle: "solid",
      stroke: "#5b4a63",
      strokeWidth: 2,
      roughness: 1.8,
      // Deterministic seed per number keeps the sketch stable across redraws.
      seed: item.n * 7 + 3,
    });
    svg.appendChild(node);
  }, [sold, item.n]);

  const label = sold
    ? `Numero ${item.n}, vendido`
    : `Numero ${item.n}, disponible`;

  return (
    <button
      type="button"
      className={`cell ${sold ? "sold" : ""} ${isAdmin ? "admin" : ""}`}
      onClick={() => isAdmin && !busy && onToggle(item)}
      onMouseEnter={() => {
        if (isAdmin && !busy) playPop();
      }}
      disabled={busy || !isAdmin}
      aria-label={label}
      title={
        isAdmin
          ? sold
            ? "Marcar como disponible"
            : "Marcar como vendido"
          : label
      }
      style={{ animationDelay: `${Math.min(index * 6, 600)}ms` }}
    >
      <svg
        ref={svgRef}
        className="cell-svg"
        width={CELL}
        height={CELL}
        viewBox={`0 0 ${CELL} ${CELL}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      />
      <span className="cell-num">{item.n}</span>
    </button>
  );
}
