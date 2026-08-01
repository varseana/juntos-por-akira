import { useEffect, useRef, type ReactNode } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";

type AnnotationType =
  | "underline"
  | "box"
  | "circle"
  | "highlight"
  | "strike-through"
  | "crossed-off"
  | "bracket";

interface AnnotateProps {
  children: ReactNode;
  type?: AnnotationType;
  color?: string;
  strokeWidth?: number;
  padding?: number;
  multiline?: boolean;
  /** Retraso en ms antes de animar el trazo. */
  delay?: number;
  className?: string;
}

/**
 * Envuelve contenido con una anotacion dibujada a mano (rough-notation):
 * circulos, subrayados o resaltados con trazo tipo marcador. Se dibuja al montar.
 */
export function Annotate({
  children,
  type = "underline",
  color = "#8a6d9c",
  strokeWidth = 2.4,
  padding = 4,
  multiline = false,
  delay = 250,
  className,
}: AnnotateProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const annotation: RoughAnnotation = annotate(el, {
      type,
      color,
      strokeWidth,
      padding,
      multiline,
      animationDuration: reduce ? 0 : 900,
    });
    const timer = window.setTimeout(() => annotation.show(), delay);
    return () => {
      window.clearTimeout(timer);
      annotation.remove();
    };
  }, [type, color, strokeWidth, padding, multiline, delay]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
