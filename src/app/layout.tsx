import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto-École CV",
  description: "Gestion d’auto-école — Cap-Vert",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
