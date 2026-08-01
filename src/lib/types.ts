export type RaffleNumberStatus = "available" | "sold";

export interface RaffleNumber {
  n: number;
  status: RaffleNumberStatus;
  buyer_name: string | null;
  updated_at: string;
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
