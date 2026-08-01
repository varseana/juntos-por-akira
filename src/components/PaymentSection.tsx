import {
  PRICE_PER_NUMBER,
  SINPE_NAME,
  SINPE_NUMBER,
  WHATSAPP_NUMBER,
} from "../lib/supabase";
import { SketchBox } from "./SketchBox";

export function PaymentSection() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola, quiero comprar un numero de la rifa Juntos por Akira."
  )}`;

  return (
    <SketchBox className="paper" fill="#f9dfe6" seed={31} washi>
      <h2 className="section-title">Como comprar tu numero</h2>
      <p className="section-sub">
        El pago es por Sinpe Movil. Cada numero cuesta{" "}
        {PRICE_PER_NUMBER.toLocaleString("es-CR")} colones.
      </p>

      <div className="pay-grid">
        <SketchBox className="pay-row" fill="#fbf3e7" seed={41}>
          <div className="k">Sinpe Movil</div>
          <div className="v">{SINPE_NUMBER}</div>
        </SketchBox>
        <SketchBox className="pay-row" fill="#fbf3e7" seed={42}>
          <div className="k">A nombre de</div>
          <div className="v">{SINPE_NAME}</div>
        </SketchBox>
        <SketchBox className="pay-row" fill="#fbf3e7" seed={43}>
          <div className="k">Precio por numero</div>
          <div className="v">
            {PRICE_PER_NUMBER.toLocaleString("es-CR")} colones
          </div>
        </SketchBox>
      </div>

      <ol className="steps">
        <li>Elige un numero disponible en la cuadricula de arriba.</li>
        <li>
          Envia el Sinpe Movil al numero {SINPE_NUMBER} por el monto del numero.
        </li>
        <li>
          En el motivo del Sinpe escribe el numero que estas comprando. Por
          ejemplo: numero 42.
        </li>
        <li>
          Si el numero que querias ya aparece como vendido, escribe por WhatsApp
          al {SINPE_NUMBER} y te ayudamos a elegir otro.
        </li>
      </ol>

      <div className="row" style={{ marginTop: 18 }}>
        <a
          className="btn btn-whatsapp"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </SketchBox>
  );
}
