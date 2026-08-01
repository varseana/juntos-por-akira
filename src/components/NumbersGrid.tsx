import { useMemo, useState } from "react";
import { supabase, PRICE_PER_NUMBER, WHATSAPP_NUMBER } from "../lib/supabase";
import type { RaffleNumber } from "../lib/types";
import { SketchBox } from "./SketchBox";
import { NumberCell } from "./NumberCell";
import { playSuccess, playUndo } from "../lib/sfx";

interface NumbersGridProps {
  numbers: RaffleNumber[];
  isAdmin: boolean;
  onChanged: () => void;
}

function formatColones(value: number): string {
  return value.toLocaleString("es-CR");
}

export function NumbersGrid({ numbers, isAdmin, onChanged }: NumbersGridProps) {
  const [busyN, setBusyN] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { sold, available } = useMemo(() => {
    let s = 0;
    for (const item of numbers) if (item.status === "sold") s += 1;
    return { sold: s, available: numbers.length - s };
  }, [numbers]);

  const raised = sold * PRICE_PER_NUMBER;

  const toggle = async (item: RaffleNumber) => {
    if (!isAdmin) return;
    setBusyN(item.n);
    setError(null);
    const nextStatus = item.status === "sold" ? "available" : "sold";
    const { error: updErr } = await supabase
      .from("raffle_numbers")
      .update({
        status: nextStatus,
        buyer_name: nextStatus === "available" ? null : item.buyer_name,
      })
      .eq("n", item.n);
    if (updErr) {
      setError(
        "No se pudo actualizar el numero. Verifica tu sesion de admin. " +
          updErr.message
      );
    } else {
      if (nextStatus === "sold") playSuccess();
      else playUndo();
      onChanged();
    }
    setBusyN(null);
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola, quiero consultar por un numero de la rifa Juntos por Akira."
  )}`;

  return (
    <SketchBox className="paper" seed={11} washi>
      <h2 className="section-title">Numeros de la rifa</h2>
      <p className="section-sub">
        300 numeros a mil colones cada uno. Elige el tuyo y aparta con Sinpe.
      </p>

      <div className="stats">
        <SketchBox className="stat" fill="#d9efe2" seed={21}>
          <span className="num">{available}</span>
          <span className="lbl">Disponibles</span>
        </SketchBox>
        <SketchBox className="stat" fill="#f9dfe6" seed={22}>
          <span className="num">{sold}</span>
          <span className="lbl">Vendidos</span>
        </SketchBox>
        <SketchBox className="stat" fill="#eae2f5" seed={23}>
          <span className="num">{formatColones(raised)}</span>
          <span className="lbl">Colones recaudados</span>
        </SketchBox>
      </div>

      {error && <div className="notice err">{error}</div>}

      <div className="grid">
        {numbers.map((item, idx) => (
          <NumberCell
            key={item.n}
            item={item}
            index={idx}
            isAdmin={isAdmin}
            busy={busyN === item.n}
            onToggle={toggle}
          />
        ))}
      </div>

      <div className="legend">
        <span>
          <span className="dot available" /> Disponible
        </span>
        <span>
          <span className="dot sold" /> Vendido
        </span>
      </div>

      {!isAdmin && (
        <div className="notice info" style={{ marginTop: 18 }}>
          Si el numero que quieres ya aparece vendido, escribe por WhatsApp al{" "}
          <strong>{"506 8556 9584"}</strong> y te ayudamos a elegir otro.{" "}
          <a
            className="btn btn-whatsapp"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 10 }}
          >
            Escribir por WhatsApp
          </a>
        </div>
      )}
    </SketchBox>
  );
}
