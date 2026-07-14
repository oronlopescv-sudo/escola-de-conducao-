import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AutoEscola CV",
  description: "Gestão de escola de condução — Cabo Verde",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
