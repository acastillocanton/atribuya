import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@/components/analytics/Analytics";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  preload: true,
  axes: ["opsz", "SOFT"],
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-text",
  preload: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://atribuya.com"),
  title: "Atribuya — Gestión interna de reseñas",
  description:
    "Plataforma interna de Atribuya para gestionar reseñas de Google Business Profile por comercial.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fraunces.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
