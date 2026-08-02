export type RaffleNumberStatus = "available" | "sold";

export interface RaffleNumber {
  n: number;
  status: RaffleNumberStatus;
  buyer_name: string | null;
  buyer_phone: string | null;
  updated_at: string;
}

export interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  message: string;
  created_at: string;
}

/** Una persona con todos los numeros que compro, agrupados. */
export interface Buyer {
  name: string;
  phone: string | null;
  numbers: number[];
}

export interface TickerMessage {
  id: string;
  message: string;
  created_at: string;
}

export interface AkiraContent {
  id: string;
  title: string;
  body: string;
  photos: string[];
  updated_at: string;
}
