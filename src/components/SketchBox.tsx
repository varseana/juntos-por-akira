import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import rough from "roughjs";

interface SketchBoxProps {
  children: ReactNode;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  radius?: number;
  seed?: number;
  /** Muestra una tira de washi tape pegada arriba del cuadro. */
  washi?: boolean;
}

/**
 * Draws a hand-drawn rounded rectangle behind its children using rough.js.
 * The SVG is redrawn whenever the element is resized so the border always
 * matches the real content box.
 */
export function SketchBox({
  children,
  className,
  fill = "#fbf3e7",
  stroke = "#8a6d9c",
  strokeWidth = 2.4,
  roughness = 1.6,
  radius = 14,
  seed = 1,
  washi = false,
}: SketchBoxProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) {
        setSize({
          w: Math.round(box.width),
          h: Math.round(box.height),
        });
      }
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || size.w < 4 || size.h < 4) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const rc = rough.svg(svg);
    const pad = strokeWidth + 2;
    const w = size.w - pad * 2;
    const h = size.h - pad * 2;
    const r = Math.min(radius, w / 2, h / 2);
    const x = pad;
    const y = pad;
    // Rounded-rect path drawn by rough.js.
    const path = `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${
      x + w
    } ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${
      y + h
    } L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${
      y + r
    } Q ${x} ${y} ${x + r} ${y} Z`;
    const node = rc.path(path, {
      fill,
      fillStyle: "solid",
      stroke,
      strokeWidth,
      roughness,
      seed,
      bowing: 1,
    });
    svg.appendChild(node);
  }, [size, fill, stroke, strokeWidth, roughness, radius, seed]);

  return (
    <div ref={hostRef} className={`sketch ${className ?? ""}`}>
      {washi && <span className="washi" aria-hidden="true" />}
      <svg
        ref={svgRef}
        className="sketch-svg"
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      />
      <div className="sketch-content">{children}</div>
    </div>
  );
}
