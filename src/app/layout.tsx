import "./globals.css";
import type { Metadata } from "next";
import { initializeDatabase } from "@/lib/init-db";

export const metadata: Metadata = {
  title: "AutoEscola CV",
  description: "Gestão de escola de condução — Cabo Verde",
};

// Initialize database on startup
initializeDatabase().catch(console.error);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
