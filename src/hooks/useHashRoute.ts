import { useEffect, useState } from "react";

/**
 * Lee la ruta desde el hash de la URL (por ejemplo "#/panel-akira-8f3k29").
 * Se usa para el acceso secreto de administracion: el panel solo se muestra si
 * el hash coincide con la ruta secreta. No expone ningun enlace visible.
 */
function currentRoute(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#\/?/, "");
}

export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(currentRoute());

  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}
