"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/", label: "Log sale" },
  { href: "/today", label: "Today" },
  { href: "/report", label: "Report" },
  { href: "/settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") {
    return <div className="min-h-full">{children}</div>;
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
      <header className="no-print sticky top-0 z-10 border-b border-steel/50 bg-paper">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-lg font-semibold tracking-tight">Barber Ledger</p>
          <form action={logout}>
            <button
              type="submit"
              className="min-h-12 rounded-xl px-3 text-base font-medium text-steel underline-offset-4 hover:text-ink hover:underline"
            >
              Lock
            </button>
          </form>
        </div>
        <nav className="hidden gap-2 px-4 pb-3 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex min-h-12 items-center rounded-xl px-4 text-base font-medium ${
                isActive(pathname, link.href)
                  ? "bg-pole text-white"
                  : "text-ink hover:bg-ink/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 px-4 py-5 pb-28 md:pb-10">{children}</main>
      <nav className="no-print fixed inset-x-0 bottom-0 z-10 border-t border-steel/50 bg-paper md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-16 items-center justify-center px-1 text-center text-sm font-medium ${
                isActive(pathname, link.href) ? "text-pole" : "text-steel"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
