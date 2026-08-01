import { useMemo } from "react";
import { PRIZE_AMOUNT_USD, PRIZE_NOTE, TOTAL_NUMBERS } from "../lib/supabase";
import type { RaffleNumber } from "../lib/types";
import { Annotate } from "./Annotate";
import { Bunting, Heart, Leaf, Sparkle, Star } from "./Doodles";

interface PrizeBannerProps {
  numbers: RaffleNumber[];
}

export function PrizeBanner({ numbers }: PrizeBannerProps) {
  const sold = useMemo(
    () => numbers.filter((n) => n.status === "sold").length,
    [numbers]
  );
  const total = numbers.length || TOTAL_NUMBERS;
  const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
  const complete = sold >= total && total > 0;

  return (
    <section className="prize-card">
      {/* Guirnalda colgada del borde superior */}
      <div className="prize-bunting" aria-hidden="true">
        <Bunting width={280} color="#8a6d9c" />
      </div>

      {/* Doodles dispersos */}
      <Sparkle size={26} className="doodle doodle-1" color="#d98a9a" />
      <Star size={22} className="doodle doodle-2" color="#8fc9a6" />
      <Heart size={20} className="doodle doodle-3" color="#c9a0d8" />
      <Leaf size={24} className="doodle doodle-4" color="#8fc9a6" />
      <Sparkle size={18} className="doodle doodle-5" color="#e0b64a" />

      <p className="prize-kicker">Rifa solidaria con premio</p>

      <h2 className="prize-headline">
        <Annotate type="underline" color="#d98a9a" strokeWidth={3} delay={400}>
          Gana
        </Annotate>
      </h2>

      <div className="prize-amount-line">
        <span className="prize-amount-wrap">
          <Annotate
            type="circle"
            color="#8a6d9c"
            strokeWidth={2.6}
            padding={12}
            delay={700}
          >
            <span className="prize-amount-big">${PRIZE_AMOUNT_USD}</span>
          </Annotate>
          {/* Asterisco pulsante con globo al pasar el mouse (o tocar) */}
          <button
            type="button"
            className="prize-ast"
            aria-label={PRIZE_NOTE}
          >
            *
            <span className="prize-tip" role="tooltip">
              {PRIZE_NOTE}
            </span>
          </button>
        </span>
        <span className="prize-currency">dolares</span>
      </div>

      <p className="prize-note">
        El sorteo se realiza cuando los 300 numeros esten vendidos.
      </p>

      <div className="prize-progress">
        <div className="prize-progress-track">
          <div className="prize-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="prize-progress-label">
          {complete
            ? "Todos los numeros vendidos. Pronto se realiza la rifa."
            : `${sold} de ${total} numeros vendidos (${pct}%)`}
        </div>
      </div>
    </section>
  );
}
