import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { TickerMessage } from "../lib/types";

interface TickerManagerProps {
  messages: TickerMessage[];
  onClose: () => void;
  onChanged: () => void;
}

export function TickerManager({
  messages,
  onClose,
  onChanged,
}: TickerManagerProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    const { error: insErr } = await supabase
      .from("ticker_messages")
      .insert({ message: value });
    if (insErr) {
      setError("No se pudo agregar el mensaje. " + insErr.message);
    } else {
      setText("");
      onChanged();
    }
    setBusy(false);
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError(null);
    const { error: delErr } = await supabase
      .from("ticker_messages")
      .delete()
      .eq("id", id);
    if (delErr) {
      setError("No se pudo eliminar el mensaje. " + delErr.message);
    } else {
      onChanged();
    }
    setBusy(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <h3>Mensajes del ticker</h3>
        {error && <div className="notice err">{error}</div>}
        <form onSubmit={add}>
          <div className="field">
            <label htmlFor="ticker-input">Nuevo agradecimiento</label>
            <input
              id="ticker-input"
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
              placeholder="Gracias a Maria por su aporte"
            />
          </div>
          <div className="row">
            <button className="btn" type="submit" disabled={busy}>
              Agregar
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={onClose}
              disabled={busy}
            >
              Cerrar
            </button>
          </div>
        </form>

        <ul className="ticker-admin-list">
          {messages.length === 0 && (
            <li style={{ justifyContent: "center" }}>Aun no hay mensajes.</li>
          )}
          {messages.map((m) => (
            <li key={m.id}>
              <span>{m.message}</span>
              <button
                className="del-btn"
                onClick={() => remove(m.id)}
                disabled={busy}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
