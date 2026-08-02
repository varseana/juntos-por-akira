import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  AkiraContent,
  Donation,
  RaffleNumber,
  TickerMessage,
} from "../lib/types";

interface RaffleData {
  numbers: RaffleNumber[];
  ticker: TickerMessage[];
  akira: AkiraContent | null;
  donations: Donation[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useRaffleData(): RaffleData {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [ticker, setTicker] = useState<TickerMessage[]>([]);
  const [akira, setAkira] = useState<AkiraContent | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const reload = useCallback(async () => {
    const [numRes, tickRes, akiraRes, donRes] = await Promise.all([
      supabase.from("raffle_numbers").select("*").order("n"),
      supabase
        .from("ticker_messages")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("akira_content").select("*").eq("id", "akira").single(),
      supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (!mounted.current) return;

    if (numRes.error) {
      setError(numRes.error.message);
    } else {
      setError(null);
      setNumbers((numRes.data as RaffleNumber[]) ?? []);
    }
    if (!tickRes.error) setTicker((tickRes.data as TickerMessage[]) ?? []);
    if (!akiraRes.error) setAkira((akiraRes.data as AkiraContent) ?? null);
    if (!donRes.error) setDonations((donRes.data as Donation[]) ?? []);
  }, []);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    reload().finally(() => {
      if (mounted.current) setLoading(false);
    });

    const channel = supabase
      .channel("akira-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "raffle_numbers" },
        () => reload()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticker_messages" },
        () => reload()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "akira_content" },
        () => reload()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        () => reload()
      )
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { numbers, ticker, akira, donations, loading, error, reload };
}
