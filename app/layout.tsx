import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SM Literatura | Historias para cada momento",
  description: "Explora literatura infantil y juvenil, planes lectores y recursos para acompañar la lectura.",
  metadataBase: new URL("https://literatura-sm-redesign.vercel.app"),
  openGraph: {
    title: "SM Literatura | Historias para cada momento",
    description: "Explora literatura infantil y juvenil, planes lectores y recursos para acompañar la lectura.",
    type: "website",
    locale: "es_MX",
  },
  twitter: { card: "summary_large_image", title: "SM Literatura", description: "Historias para leer el mundo." },
  robots: { index: true, follow: true },
  icons: {
    icon: { url: "/favicon.png", type: "image/png" },
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
