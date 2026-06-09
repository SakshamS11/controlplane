import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MY FIRM Control Plane",
  description: "Enterprise AI control plane MVP"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
