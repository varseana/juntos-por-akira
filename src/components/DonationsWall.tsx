import { useMemo, useState } from "react";
import type { Donation } from "../lib/types";
import { SketchBox } from "./SketchBox";
import { Paw } from "./Doodles";
import { supabase } from "../lib/supabase";
import { playSuccess, playUndo } from "../lib/sfx";

interface DonationsWallProps {
  donations: Donation[];
  isAdmin: boolean;
  onChanged: () => void;
}

const HEARTS = ["❤️", "💜", "💖", "🧡", "💕"];

function formatColones(value: number): string {
  return value.toLocaleString("es-CR");
}

/**
 * Muro de donaciones estilo papelitos pegados con washi tape, cada uno ladeado
 * un poco distinto para que se vea puesto a mano. Son las personas que dieron
 * plata sin comprar numeros. El admin puede agregar y quitar desde aqui mismo.
 */
export function DonationsWall({
  donations,
  isAdmin,
  onChanged,
}: DonationsWallProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => donations.reduce((sum, d) => sum + d.amount, 0),
    [donations]
  );

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const donorName = name.trim();
    const value = Number.parseInt(amount, 10);
    if (!donorName || !Number.isFinite(value) || value <= 0) {
      setError("Escribe el nombre y un monto mayor a cero.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: insErr } = await supabase.from("donations").insert({
      donor_name: donorName,
      amount: value,
      message: message.trim(),
    });
    if (insErr) {
      setError("No se pudo guardar la donacion. " + insErr.message);
    } else {
      setName("");
      setAmount("");
      setMessage("");
      playSuccess();
      onChanged();
    }
    setBusy(false);
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError(null);
    const { error: delErr } = await supabase
      .from("donations")
      .delete()
      .eq("id", id);
    if (delErr) {
      setError("No se pudo eliminar la donacion. " + delErr.message);
    } else {
      playUndo();
      onChanged();
    }
    setBusy(false);
  };

  // Sin donaciones y sin sesion de admin no hay nada que mostrar.
  if (donations.length === 0 && !isAdmin) return null;

  return (
    <SketchBox className="paper" fill="#f9dfe6" seed={73} washi>
      <h2 className="section-title">Donaciones de corazon</h2>
      <p className="section-sub">
        Personas que aportaron sin comprar numeros, solo por ayudar a Akira.
      </p>

      {donations.length > 0 && (
        <div className="don-head">
          <span className="don-total">{formatColones(total)} colones</span>
          <span className="don-count">
            {donations.length === 1
              ? "1 persona ha donado con amor por Akira"
              : `${donations.length} personas han donado con amor por Akira`}
          </span>
        </div>
      )}

      {error && <div className="notice err">{error}</div>}

      {donations.length === 0 ? (
        <div className="notice info">
          Aun no hay donaciones registradas. Agrega la primera desde el
          formulario de abajo.
        </div>
      ) : (
        <div className="don-wall">
          {donations.map((d, i) => (
            <article className="don-note" key={d.id}>
              <span className="don-paw" aria-hidden="true">
                <Paw size={20} color="#8a6d9c" />
              </span>
              {d.message.trim() && (
                <p className="don-quote">{`"${d.message.trim()}"`}</p>
              )}
              <p className="don-name">{d.donor_name}</p>
              <p className="don-amt">{formatColones(d.amount)} colones</p>
              <span className="don-heart" aria-hidden="true">
                {HEARTS[i % HEARTS.length]}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  className="don-del"
                  onClick={() => remove(d.id)}
                  disabled={busy}
                  aria-label={`Quitar la donacion de ${d.donor_name}`}
                >
                  x
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      {isAdmin && (
        <form className="don-form" onSubmit={add}>
          <h3 className="don-form-title">Registrar una donacion</h3>
          <div className="don-form-grid">
            <div className="field">
              <label htmlFor="don-name">Nombre</label>
              <input
                id="don-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="Nombre de quien dono"
              />
            </div>
            <div className="field">
              <label htmlFor="don-amount">Monto en colones</label>
              <input
                id="don-amount"
                className="input"
                type="number"
                min={1}
                step={100}
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="don-msg">Mensaje que dejo</label>
            <input
              id="don-msg"
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              placeholder="con mucho amor"
            />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Guardando..." : "Agregar al muro"}
          </button>
        </form>
      )}
    </SketchBox>
  );
}
