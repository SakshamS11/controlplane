import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Control Plane",
  description: "Mockup-only enterprise AI infrastructure control plane"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
