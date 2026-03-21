import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UGC Marketplace 360",
  description: "Conecta con las mejores creadoras de contenido UGC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-background text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
