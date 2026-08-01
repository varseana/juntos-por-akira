import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      onClose();
    } catch (err) {
      setError(
        "No se pudo iniciar sesion. Revisa el correo y la contrasena. " +
          (err instanceof Error ? err.message : "")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <h3>Acceso de administracion</h3>
        <form onSubmit={submit}>
          {error && <div className="notice err">{error}</div>}
          <div className="field">
            <label htmlFor="login-email">Correo</label>
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-pass">Contrasena</label>
            <input
              id="login-pass"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="row">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Entrando..." : "Entrar"}
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={onClose}
              disabled={busy}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
