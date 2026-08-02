import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Copia .env.example a .env.local y completa los valores de tu proyecto Supabase."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export const RAFFLE_ID = "akira";
export const TOTAL_NUMBERS = 300;
export const PRICE_PER_NUMBER = 1000;
// Premio en dolares. Se muestra con un asterisco: el pago se ajusta a colones
// al tipo de cambio del dia de la transferencia.
export const PRIZE_AMOUNT_USD = 100;
export const PRIZE_NOTE = "Se ajusta a colones al hacer la transferencia";
export const SINPE_NUMBER = "506 8556 9584";
export const SINPE_NAME = "Sean Alexander Vargas Romero";
export const WHATSAPP_NUMBER = "50685569584";
export const AKIRA_PHOTOS_BUCKET = "akira-photos";

/**
 * Plantillas de agradecimiento. Se llenan con el nombre de la persona y un
 * emoji de manos o corazon elegido al azar al momento de registrar la compra.
 */
export const THANKS_TEMPLATES = [
  "Gracias {nombre} por tu granito de arena",
  "Gracias por el apoyo {nombre}",
  "Gracias de corazon {nombre}",
] as const;

export const THANKS_EMOJIS = ["🙏", "🤲", "💜", "❤️", "🩷", "💖"] as const;

// Ruta secreta del panel de administracion. El panel solo aparece si visitas
// la pagina con este hash al final de la URL, por ejemplo:
//   https://tu-sitio.com/#/panel-akira-8f3k29
// Cambia este valor por uno propio y no lo compartas. Aunque alguien conozca la
// ruta, no puede modificar nada sin tu correo y contrasena de admin (RLS).
export const ADMIN_SECRET_PATH = "panel-akira-8f3k29";
