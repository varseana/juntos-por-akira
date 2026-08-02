import { useState } from "react";
import { RoughSVG } from "react-rough-fiber";
import { useAuth } from "./hooks/useAuth";
import { useRaffleData } from "./hooks/useRaffleData";
import { useHashRoute } from "./hooks/useHashRoute";
import { CatBackground } from "./components/CatBackground";
import { Ticker } from "./components/Ticker";
import { NumbersGrid } from "./components/NumbersGrid";
import { PaymentSection } from "./components/PaymentSection";
import { AkiraSection } from "./components/AkiraSection";
import { PrizeBanner } from "./components/PrizeBanner";
import { TextureDefs } from "./components/TextureDefs";
import { LoginModal } from "./components/LoginModal";
import { TickerManager } from "./components/TickerManager";
import { TrackingPanel } from "./components/TrackingPanel";
import { DonationsWall } from "./components/DonationsWall";
import { ReelDraw } from "./components/ReelDraw";
import { SketchBox } from "./components/SketchBox";
import { ADMIN_SECRET_PATH, SINPE_NUMBER } from "./lib/supabase";
import { getMuted, playPop, setMuted } from "./lib/sfx";

export default function App() {
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const { numbers, ticker, akira, donations, loading, error, reload } =
    useRaffleData();
  const route = useHashRoute();
  const [showTicker, setShowTicker] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [muted, setMutedState] = useState(getMuted());

  // El acceso de admin solo existe si la URL tiene el hash secreto.
  const adminRouteActive = route === ADMIN_SECRET_PATH;

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playPop();
  };

  return (
    <div className="app">
      <TextureDefs />
      <CatBackground />

      {isAdmin && (
        <div className="admin-bar">
          <div className="container">
            <span className="who">Modo administracion activo</span>
            <div className="row">
              <button
                className="btn"
                onClick={() => {
                  playPop();
                  setShowTracking(true);
                }}
              >
                Registrar compras
              </button>
              <button
                className="btn secondary"
                onClick={() => {
                  playPop();
                  setShowTicker(true);
                }}
              >
                Gestionar ticker
              </button>
              <button className="btn ghost" onClick={() => signOut()}>
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="mute-toggle"
        onClick={toggleMute}
        aria-label={muted ? "Activar sonidos" : "Silenciar sonidos"}
        title={muted ? "Activar sonidos" : "Silenciar sonidos"}
      >
        {muted ? "Sonido apagado" : "Sonido encendido"}
      </button>

      <div className="container">
        <header className="site-header">
          <div className="heart-wrap">
            <RoughSVG options={{ roughness: 1.8, strokeWidth: 2 }}>
              <svg
                width="72"
                height="64"
                viewBox="0 0 24 24"
                fill="#f3c9d4"
                stroke="#8a6d9c"
                aria-hidden="true"
              >
                <path d="M12 21C-4 11 4 2 12 8c8-6 16 3 0 13z" />
              </svg>
            </RoughSVG>
          </div>
          <h1>Juntos por Akira</h1>
          <p>
            Una rifa solidaria para cubrir el tratamiento de Akira. Cada numero
            que compras nos acerca a su recuperacion.
          </p>
        </header>
      </div>

      {/* Tira de agradecimientos: de borde a borde de la pantalla */}
      <Ticker messages={ticker} />

      <div className="container">
        {loading || authLoading ? (
          <div className="loading">
            <span className="loading-cat" aria-hidden="true">
              <svg width="64" height="64" viewBox="0 0 100 100" fill="none"
                stroke="#8a6d9c" strokeWidth="2.4" strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M14 78c-6-16-4-38 8-50l9 13c9-5 21-5 30 0l9-13c12 12 14 34 8 50" />
                <path d="M14 78c6 12 20 18 32 18s26-6 32-18" />
                <circle cx="34" cy="52" r="2.4" />
                <circle cx="56" cy="52" r="2.4" />
              </svg>
            </span>
            Cargando la rifa de Akira...
          </div>
        ) : error ? (
          <SketchBox className="paper" fill="#f9dfe6" seed={7}>
            <div className="notice err">
              No pudimos cargar la informacion de la rifa. Recarga la pagina en
              unos segundos. Detalle: {error}
            </div>
          </SketchBox>
        ) : (
          <>
            <PrizeBanner numbers={numbers} />
            <AkiraSection
              content={akira}
              isAdmin={isAdmin}
              onChanged={reload}
            />
            <NumbersGrid
              numbers={numbers}
              isAdmin={isAdmin}
              onChanged={reload}
            />
            <ReelDraw numbers={numbers} isAdmin={isAdmin} />
            <DonationsWall
              donations={donations}
              isAdmin={isAdmin}
              onChanged={reload}
            />
            <PaymentSection />
          </>
        )}

        <footer className="footer">
          <p>
            Gracias por ayudar a Akira. Consultas por WhatsApp al {SINPE_NUMBER}.
          </p>
        </footer>
      </div>

      {/* El modal de login solo aparece con la ruta secreta y sin sesion. */}
      {adminRouteActive && !isAdmin && !authLoading && (
        <LoginModal onClose={() => {
          window.location.hash = "";
        }} />
      )}
      {showTicker && isAdmin && (
        <TickerManager
          messages={ticker}
          onClose={() => setShowTicker(false)}
          onChanged={reload}
        />
      )}
      {showTracking && isAdmin && (
        <TrackingPanel
          numbers={numbers}
          onClose={() => setShowTracking(false)}
          onChanged={reload}
        />
      )}
    </div>
  );
}
