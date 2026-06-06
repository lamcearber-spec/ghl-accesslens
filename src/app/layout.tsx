import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccessLens - User Access Evidence Packs",
  description: "Read-only HighLevel user, admin, and sub-account access exposure evidence packs.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
