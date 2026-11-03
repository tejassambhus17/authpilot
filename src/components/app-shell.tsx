"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowUpRight, CheckCircle2, Menu, Moon, Sun, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useSyncExternalStore } from "react";
import { BrandMark } from "./brand";

const links = [
  { href: "/", label: "Explore" },
  { href: "/guides", label: "Guides" },
  { href: "/saved", label: "Saved" },
  { href: "/methodology", label: "How it works" },
];
const subscribeTheme = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeTheme,
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label="Toggle theme"
      title={dark ? "Switch to light appearance" : "Switch to dark appearance"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}

function Navigation({ close }: { close?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Main navigation" className="primary-navigation">
      {links.map((link) => {
        const active =
          link.href === "/"
            ? path === "/" || path === "/research"
            : link.href === "/guides"
              ? path.startsWith("/guides")
              : path === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={close}
            aria-current={active ? "page" : undefined}
            className={active ? "nav-link active" : "nav-link"}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="app-frame">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="topbar">
        <Link href="/" className="brand" aria-label="AuthPilot home">
          <BrandMark size={29} />
          <span>AuthPilot</span>
        </Link>
        <div className="desktop-navigation">
          <Navigation />
        </div>
        <div className="topbar-actions">
          <ThemeToggle />
          <Dialog.Root open={menu} onOpenChange={setMenu}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="icon-button mobile-menu"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="mobile-overlay" />
              <Dialog.Content className="mobile-navigation-dialog">
                <Dialog.Title>AuthPilot workspace</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Navigate between Explore, Guides, Saved, and How it works.
                </Dialog.Description>
                <Dialog.Close
                  className="icon-button mobile-close"
                  aria-label="Close navigation"
                >
                  <X size={21} />
                </Dialog.Close>
                <Navigation close={() => setMenu(false)} />
                <p>
                  Research with evidence.
                  <br />
                  Build with a clear next step.
                </p>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="app-footer">
        <div className="footer-brand">
          <BrandMark size={23} />
          <strong>AuthPilot</strong>
          <span>OAuth integration research</span>
        </div>
        <div className="footer-promises">
          <span>
            <CheckCircle2 size={14} />
            Live research
          </span>
          <Link href="/methodology#evidence">
            <CheckCircle2 size={14} />
            Source-linked guidance
          </Link>
          <Link href="/guides">
            <CheckCircle2 size={14} />
            Practical & actionable
          </Link>
          <Link href="/methodology">
            Methodology
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
