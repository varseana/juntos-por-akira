import { useMemo, useState } from "react";
import {
  supabase,
  PRICE_PER_NUMBER,
  TOTAL_NUMBERS,
} from "../lib/supabase";
import type { RaffleNumber } from "../lib/types";
import {
  buildThanks,
  findBuyerByPhone,
  formatPhone,
  groupBuyers,
  normalizePhone,
  parseNumberList,
} from "../lib/buyers";
import { playSuccess, playUndo } from "../lib/sfx";

interface TrackingPanelProps {
  numbers: RaffleNumber[];
  onClose: () => void;
  onChanged: () => void;
}

type Tab = "registrar" | "tabla";

/** Llave unica de un comprador en la tabla: telefono si tiene, nombre si no. */
function buyerKey(b: { name: string; phone: string | null }): string {
  return b.phone ? `tel:${normalizePhone(b.phone)}` : `nom:${b.name.toLowerCase()}`;
}

function formatColones(value: number): string {
  return value.toLocaleString("es-CR");
}

/**
 * Panel de seguimiento de compras. Dos vistas:
 *  - Registrar: formulario rapido. Al escribir un telefono ya conocido detecta
 *    a la persona y los numeros nuevos se AGREGAN a los que ya tenia.
 *  - Tabla: hoja de calculo con buscador por nombre, telefono o numero.
 * Solo se abre desde la barra de administracion.
 */
export function TrackingPanel({
  numbers,
  onClose,
  onChanged,
}: TrackingPanelProps) {
  const [tab, setTab] = useState<Tab>("registrar");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [numsText, setNumsText] = useState("");
  const [addTicker, setAddTicker] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Fila en edicion inline: clave del comprador + los campos editados.
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const buyers = useMemo(() => groupBuyers(numbers), [numbers]);
  const byN = useMemo(() => {
    const map = new Map<number, RaffleNumber>();
    for (const item of numbers) map.set(item.n, item);
    return map;
  }, [numbers]);

  // Persona ya registrada con ese telefono, si existe.
  const existing = useMemo(
    () => findBuyerByPhone(buyers, phone),
    [buyers, phone]
  );

  const parsed = useMemo(
    () => parseNumberList(numsText, TOTAL_NUMBERS),
    [numsText]
  );

  const effectiveName = name.trim() || existing?.name || "";
  const thanks = effectiveName ? buildThanks(effectiveName) : "";

  // Numeros que ya estan vendidos a otra persona: no se pueden reasignar aqui.
  const conflicts = useMemo(() => {
    const ownerKey = existing?.phone
      ? normalizePhone(existing.phone)
      : normalizePhone(phone);
    return parsed.filter((n) => {
      const row = byN.get(n);
      if (!row || row.status !== "sold") return false;
      const rowPhone = normalizePhone(row.buyer_phone ?? "");
      if (rowPhone && ownerKey && rowPhone === ownerKey) return false;
      const rowName = (row.buyer_name ?? "").trim().toLowerCase();
      return rowName !== effectiveName.toLowerCase();
    });
  }, [parsed, byN, existing, phone, effectiveName]);

  const freshNumbers = useMemo(
    () => parsed.filter((n) => !conflicts.includes(n)),
    [parsed, conflicts]
  );

  const reset = () => {
    setPhone("");
    setName("");
    setNumsText("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    const digits = normalizePhone(phone);
    if (digits.length < 8) {
      setError("Escribe un telefono de al menos 8 digitos.");
      return;
    }
    if (!effectiveName) {
      setError("Escribe el nombre de la persona.");
      return;
    }
    if (freshNumbers.length === 0) {
      setError(
        conflicts.length > 0
          ? "Todos los numeros que escribiste ya estan vendidos a otra persona."
          : "Escribe al menos un numero entre 1 y 300."
      );
      return;
    }

    setBusy(true);
    const { error: updErr } = await supabase
      .from("raffle_numbers")
      .update({
        status: "sold",
        buyer_name: effectiveName,
        buyer_phone: digits,
      })
      .in("n", freshNumbers);

    if (updErr) {
      setError("No se pudo guardar. " + updErr.message);
      setBusy(false);
      return;
    }

    // Agradecimiento en el ticker, sin repetir si ya estaba.
    if (addTicker && thanks) {
      const { data: found } = await supabase
        .from("ticker_messages")
        .select("id")
        .eq("message", thanks)
        .limit(1);
      if (!found || found.length === 0) {
        await supabase.from("ticker_messages").insert({ message: thanks });
      }
    }

    playSuccess();
    const wasNew = !existing;
    setOk(
      `${wasNew ? "Registrada" : "Actualizada"} ${effectiveName}: ` +
        `${freshNumbers.length} ${
          freshNumbers.length === 1 ? "numero" : "numeros"
        } (${freshNumbers.join(", ")}).` +
        (conflicts.length > 0
          ? ` No se tomaron ${conflicts.join(", ")} porque ya estaban vendidos.`
          : "")
    );
    reset();
    onChanged();
    setBusy(false);
  };

  const startEdit = (b: { name: string; phone: string | null }) => {
    setEditKey(buyerKey(b));
    setEditName(b.name);
    setEditPhone(b.phone ? formatPhone(b.phone) : "");
    setError(null);
    setOk(null);
  };

  const cancelEdit = () => {
    setEditKey(null);
    setEditName("");
    setEditPhone("");
  };

  const saveEdit = async (buyer: { name: string; phone: string | null; numbers: number[] }) => {
    const newName = editName.trim();
    const newPhone = normalizePhone(editPhone);
    if (!newName) {
      setError("El nombre no puede quedar vacio.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: updErr } = await supabase
      .from("raffle_numbers")
      .update({
        buyer_name: newName,
        buyer_phone: newPhone || null,
      })
      .in("n", buyer.numbers);
    if (updErr) {
      setError("No se pudo guardar. " + updErr.message);
    } else {
      playSuccess();
      setOk(`Datos de ${newName} actualizados.`);
      cancelEdit();
      onChanged();
    }
    setBusy(false);
  };

  const release = async (n: number) => {
    setBusy(true);
    setError(null);
    const { error: updErr } = await supabase
      .from("raffle_numbers")
      .update({ status: "available", buyer_name: null, buyer_phone: null })
      .eq("n", n);
    if (updErr) setError("No se pudo liberar el numero. " + updErr.message);
    else {
      playUndo();
      onChanged();
    }
    setBusy(false);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buyers;
    const qDigits = normalizePhone(q);
    return buyers.filter((b) => {
      if (b.name.toLowerCase().includes(q)) return true;
      if (qDigits && b.phone && normalizePhone(b.phone).includes(qDigits))
        return true;
      return b.numbers.some((n) => String(n) === q);
    });
  }, [buyers, query]);

  const soldCount = useMemo(
    () => numbers.filter((n) => n.status === "sold").length,
    [numbers]
  );

  const copyTable = async () => {
    const text = buyers
      .map(
        (b) =>
          `${b.name}\t${formatPhone(b.phone)}\t${b.numbers.join(", ")}\t${
            b.numbers.length * PRICE_PER_NUMBER
          }`
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(
        `Nombre\tTelefono\tNumeros\tColones\n${text}`
      );
      setOk("Tabla copiada. Ya la puedes pegar en Excel o Sheets.");
    } catch {
      setError("El navegador no permitio copiar. Selecciona la tabla a mano.");
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal modal-wide" role="dialog" aria-modal="true">
        <h3>Seguimiento de compras</h3>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === "registrar" ? "on" : ""}`}
            onClick={() => setTab("registrar")}
          >
            Registrar compra
          </button>
          <button
            type="button"
            className={`tab ${tab === "tabla" ? "on" : ""}`}
            onClick={() => setTab("tabla")}
          >
            Tabla ({buyers.length})
          </button>
        </div>

        {error && <div className="notice err">{error}</div>}
        {ok && <div className="notice ok">{ok}</div>}

        {tab === "registrar" ? (
          <form onSubmit={save}>
            <div className="don-form-grid">
              <div className="field">
                <label htmlFor="tr-phone">Telefono</label>
                <input
                  id="tr-phone"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  maxLength={20}
                  placeholder="8556 9584"
                />
              </div>
              <div className="field">
                <label htmlFor="tr-name">Nombre</label>
                <input
                  id="tr-name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  placeholder={existing ? existing.name : "Nombre y apellido"}
                />
              </div>
            </div>

            {existing && (
              <div className="notice info">
                Ya tenes a <strong>{existing.name}</strong> con{" "}
                {existing.numbers.length}{" "}
                {existing.numbers.length === 1 ? "numero" : "numeros"}:{" "}
                {existing.numbers.join(", ")}. Los que escribas abajo se le{" "}
                <strong>agregan</strong>.
              </div>
            )}

            <div className="field">
              <label htmlFor="tr-nums">Numeros que compro</label>
              <input
                id="tr-nums"
                className="input"
                value={numsText}
                onChange={(e) => setNumsText(e.target.value)}
                inputMode="numeric"
                placeholder="25, 77, 89"
              />
              <p className="field-hint">
                Separalos con comas o espacios. Del 1 al 300.
              </p>
            </div>

            {parsed.length > 0 && (
              <div className="chip-row">
                {parsed.map((n) => (
                  <span
                    key={n}
                    className={`chip ${
                      conflicts.includes(n) ? "chip-bad" : "chip-ok"
                    }`}
                  >
                    {n}
                  </span>
                ))}
                <span className="chip-total">
                  {formatColones(freshNumbers.length * PRICE_PER_NUMBER)}{" "}
                  colones
                </span>
              </div>
            )}

            {conflicts.length > 0 && (
              <div className="notice err">
                Estos ya estan vendidos a otra persona y no se van a tomar:{" "}
                {conflicts.join(", ")}.
              </div>
            )}

            {thanks && (
              <div className="thanks-preview">
                <span className="thanks-lbl">Se agrega al ticker</span>
                <span className="thanks-text">{thanks}</span>
              </div>
            )}

            <label className="check-row">
              <input
                type="checkbox"
                checked={addTicker}
                onChange={(e) => setAddTicker(e.target.checked)}
              />
              Agregar el agradecimiento al ticker
            </label>

            <div className="row">
              <button className="btn" type="submit" disabled={busy}>
                {busy
                  ? "Guardando..."
                  : existing
                    ? "Agregar a esta persona"
                    : "Registrar compra"}
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
        ) : (
          <>
            <div className="don-form-grid">
              <div className="field">
                <label htmlFor="tr-search">Buscar</label>
                <input
                  id="tr-search"
                  className="input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nombre, telefono o numero"
                />
              </div>
              <div className="track-stats">
                <span>
                  <strong>{soldCount}</strong> de {TOTAL_NUMBERS} vendidos
                </span>
                <span>
                  <strong>{buyers.length}</strong> personas
                </span>
                <span>
                  <strong>
                    {formatColones(soldCount * PRICE_PER_NUMBER)}
                  </strong>{" "}
                  colones
                </span>
              </div>
            </div>

            <div className="table-wrap">
              <table className="track-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Telefono</th>
                    <th>Numeros</th>
                    <th>Cant</th>
                    <th>Colones</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-row">
                        No hay resultados para esa busqueda.
                      </td>
                    </tr>
                  ) : (
                    rows.map((b) => {
                      const key = buyerKey(b);
                      const isEditing = editKey === key;
                      return (
                        <tr key={key}>
                          {isEditing ? (
                            <>
                              <td>
                                <input
                                  className="input input-cell"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  maxLength={80}
                                  autoFocus
                                />
                              </td>
                              <td>
                                <input
                                  className="input input-cell"
                                  value={editPhone}
                                  onChange={(e) => setEditPhone(e.target.value)}
                                  inputMode="tel"
                                  maxLength={20}
                                  placeholder="8556 9584"
                                />
                              </td>
                              <td colSpan={2}>
                                <span className="chip-row tight">
                                  {b.numbers.map((n) => (
                                    <button
                                      key={n}
                                      type="button"
                                      className="chip chip-ok chip-btn"
                                      onClick={() => release(n)}
                                      disabled={busy}
                                      title={`Liberar el numero ${n}`}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </span>
                              </td>
                              <td>
                                <span className="row" style={{ gap: 6 }}>
                                  <button
                                    type="button"
                                    className="btn"
                                    style={{ padding: "4px 10px", fontSize: "0.82rem" }}
                                    onClick={() => saveEdit(b)}
                                    disabled={busy}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    type="button"
                                    className="btn ghost"
                                    style={{ padding: "4px 10px", fontSize: "0.82rem" }}
                                    onClick={cancelEdit}
                                    disabled={busy}
                                  >
                                    Cancelar
                                  </button>
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td>{b.name}</td>
                              <td className="mono">
                                {b.phone ? formatPhone(b.phone) : (
                                  <span style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>
                                    sin telefono
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className="chip-row tight">
                                  {b.numbers.map((n) => (
                                    <button
                                      key={n}
                                      type="button"
                                      className="chip chip-ok chip-btn"
                                      onClick={() => release(n)}
                                      disabled={busy}
                                      title={`Liberar el numero ${n}`}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </span>
                              </td>
                              <td className="mono">{b.numbers.length}</td>
                              <td className="mono">
                                {formatColones(b.numbers.length * PRICE_PER_NUMBER)}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="chip chip-ok chip-btn"
                                  style={{ padding: "3px 10px" }}
                                  onClick={() => startEdit(b)}
                                  disabled={busy}
                                  title="Editar nombre y telefono"
                                >
                                  Editar
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <p className="field-hint">
              Toca un numero para liberarlo y dejarlo disponible otra vez.
            </p>

            <div className="row">
              <button
                className="btn secondary"
                type="button"
                onClick={copyTable}
                disabled={buyers.length === 0}
              >
                Copiar tabla
              </button>
              <button className="btn ghost" type="button" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
