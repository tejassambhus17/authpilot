import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import { Providers } from "@/components/providers";
export const metadata: Metadata = {
  title: {
    default: "AuthPilot — Clarity before you connect",
    template: "%s · AuthPilot",
  },
  description:
    "Navigate OAuth app setup, provider review, and approval with actionable guides grounded in official documentation.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
