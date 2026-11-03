"use client";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { AppShell } from "./app-shell";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <Suspense>
        <AppShell>{children}</AppShell>
      </Suspense>
    </ThemeProvider>
  );
}
