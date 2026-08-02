import type { Buyer, RaffleNumber } from "./types";
import { THANKS_EMOJIS, THANKS_TEMPLATES } from "./supabase";

/** Deja el telefono en solo digitos para comparar sin importar el formato. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/** Formatea un telefono de Costa Rica como "8556 9584" si tiene 8 digitos. */
export function formatPhone(value: string | null): string {
  if (!value) return "";
  const digits = normalizePhone(value);
  if (digits.length === 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return value;
}

/**
 * Agrupa los numeros vendidos por persona. Se agrupa por telefono cuando existe
 * (es el dato mas confiable) y por nombre en minusculas cuando todavia no hay
 * telefono registrado.
 */
export function groupBuyers(numbers: RaffleNumber[]): Buyer[] {
  const map = new Map<string, Buyer>();
  for (const item of numbers) {
    if (item.status !== "sold") continue;
    const name = item.buyer_name?.trim() ?? "";
    const phone = item.buyer_phone?.trim() ?? "";
    if (!name && !phone) continue;
    const key = phone ? `tel:${normalizePhone(phone)}` : `nom:${name.toLowerCase()}`;
    const found = map.get(key);
    if (found) {
      found.numbers.push(item.n);
      if (!found.phone && phone) found.phone = phone;
      if (!found.name && name) found.name = name;
    } else {
      map.set(key, { name: name || "Sin nombre", phone: phone || null, numbers: [item.n] });
    }
  }
  const list = [...map.values()];
  for (const buyer of list) buyer.numbers.sort((a, b) => a - b);
  list.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return list;
}

/** Busca una persona ya registrada por telefono. */
export function findBuyerByPhone(
  buyers: Buyer[],
  phone: string
): Buyer | undefined {
  const digits = normalizePhone(phone);
  if (digits.length < 8) return undefined;
  return buyers.find(
    (b) => b.phone && normalizePhone(b.phone) === digits
  );
}

/**
 * Arma el mensaje de agradecimiento para una persona. La plantilla y el emoji
 * se eligen a partir del nombre, asi el mismo nombre siempre recibe el mismo
 * mensaje y no cambia entre vistas previas y el guardado real.
 */
export function buildThanks(name: string): string {
  const clean = name.trim();
  if (!clean) return "";
  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) {
    hash = (hash * 31 + clean.charCodeAt(i)) % 100000;
  }
  const template = THANKS_TEMPLATES[hash % THANKS_TEMPLATES.length];
  const emoji = THANKS_EMOJIS[(hash >> 3) % THANKS_EMOJIS.length];
  return `${template.replace("{nombre}", clean)} ${emoji}`;
}

/** Convierte "5, 12 20;33" en una lista de numeros validos y sin repetidos. */
export function parseNumberList(input: string, max: number): number[] {
  const out = new Set<number>();
  for (const chunk of input.split(/[^0-9]+/)) {
    if (!chunk) continue;
    const value = Number.parseInt(chunk, 10);
    if (Number.isFinite(value) && value >= 1 && value <= max) out.add(value);
  }
  return [...out].sort((a, b) => a - b);
}
