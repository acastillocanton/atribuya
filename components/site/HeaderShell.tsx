"use client";

import { useEffect, useState } from "react";

// Contenedor de la cabecera sticky. Transparente en la parte superior (hero
// limpio) y con fondo gris + desenfoque al hacer scroll, para que el contenido
// que pasa por debajo no se transparente sobre el logo y los controles.
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled
          ? "border-line bg-bg/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
