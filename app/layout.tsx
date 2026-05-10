import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Quest — RPG Coding Adventure",
  description: "Learn programming by defeating bugs, solving puzzles, and leveling up your hero!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
