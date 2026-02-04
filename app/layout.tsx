import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";

import Providers from "./providers";

const geistKarla = Karla({
  variable: "--font-geist-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Somnium",
  description: "A Screen Sharing App",
  icons: {
    icon: "/assets/icons/logo.svg",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistKarla.variable} font-karla antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
