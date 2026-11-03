"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Compass,
  FlaskConical,
  Library,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { BrandMark } from "./brand";

function NavContent({ close }: { close?: () => void }) {
  const path = usePathname();
  const params = useSearchParams();
  const items = [
    {
      href: "/",
      text: "Provider library",
      icon: Library,
      active: path === "/" && params.get("view") !== "researched",
    },
    {
      href: "/?view=researched",
      text: "Researched guides",
      icon: BookOpen,
      active: path === "/" && params.get("view") === "researched",
    },
    {
      href: "/research",
      text: "Research a provider",
      icon: Compass,
      active: path === "/research",
    },
  ];
  return (
    <>
      <Link href="/" className="brand" onClick={close}>
        <BrandMark />
        <span>
          AuthPilot<span className="brand-dot">.</span>
        </span>
      </Link>
      <div className="workspace-label">
        <span className="workspace-avatar">A</span>
        <span>
          Developer workspace<small>OAuth, with a clear next step.</small>
        </span>
      </div>
      <nav aria-label="Main navigation" className="sidebar-nav">
        {items.map((item) => (
          <Link
            onClick={close}
            key={item.href}
            href={item.href}
            className={item.active ? "nav-item active" : "nav-item"}
            aria-current={item.active ? "page" : undefined}
          >
            <item.icon size={17} />
            {item.text}
            {item.text === "Research a provider" && (
              <Plus size={14} className="nav-end" />
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-section-label">RESOURCES</div>
      <Link
        className={`nav-item ${path === "/methodology" ? "active" : ""}`}
        href="/methodology"
        onClick={close}
      >
        <FlaskConical size={17} />
        How AuthPilot works
      </Link>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <div className="note-symbol">
            <BookOpen size={18} />
          </div>
          <strong>Evidence over guesswork.</strong>
          <p>Official sources. Honest unknowns. Your next step, clarified.</p>
          <Link href="/methodology" onClick={close}>
            Our approach <ArrowUpRight size={13} />
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <button
      className="theme-toggle"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun size={16} />
      ) : (
        <Moon size={16} />
      )}
      <span>
        {mounted && resolvedTheme === "dark"
          ? "Light appearance"
          : "Dark appearance"}
      </span>
      <span className="theme-shortcut">
        {mounted && resolvedTheme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const title = path.startsWith("/guides/")
    ? "Integration guide"
    : path === "/research"
      ? "Research a provider"
      : path === "/methodology"
        ? "How AuthPilot works"
        : "Provider library";
  const [menu, setMenu] = useState(false);
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <NavContent />
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumb">
            <Dialog.Root open={menu} onOpenChange={setMenu}>
              <Dialog.Trigger asChild>
                <button
                  className="icon-button mobile-menu"
                  aria-label="Open navigation"
                >
                  <Menu size={20} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="mobile-overlay" />
                <Dialog.Content className="mobile-sidebar">
                  <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    AuthPilot workspace navigation.
                  </Dialog.Description>
                  <Dialog.Close
                    className="icon-button mobile-close"
                    aria-label="Close navigation"
                  >
                    <X size={20} />
                  </Dialog.Close>
                  <NavContent close={() => setMenu(false)} />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <span className="breadcrumb-workspace">Workspace</span>
            <ChevronRight size={13} />
            <span>{title}</span>
          </div>
          <Link href="/methodology#evidence" className="topbar-evidence">
            <span className="status-dot" />
            Built on official sources
            <ArrowUpRight size={13} />
          </Link>
        </header>
        <main id="main-content">{children}</main>
        <footer className="app-footer">
          <span>
            <BrandMark size={15} />
            Clarity before you connect.
          </span>
          <Link href="/methodology">
            Evidence & methodology <ArrowUpRight size={12} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
