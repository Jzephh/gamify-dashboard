import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PowerLevel Dashboard",
  description: "Track your XP, level up, complete quests, and earn badges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
