import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zelda & Co. | Luxury Apparel, Fine Jewelry & Beauty Salon",
  description: "Curated designer South Asian & contemporary apparel, 22K gold-plated jewelry, luxury footwear, cosmetics, and licensed beauty studio services.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans bg-theme-canvas text-theme-ink antialiased">
        {children}
      </body>
    </html>
  );
}
