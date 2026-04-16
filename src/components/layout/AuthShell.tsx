'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  const pathname = usePathname();

  return (
    <div className="page-shell relative min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-between gap-8 lg:flex-row lg:items-stretch">
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[32px] border border-white/50 bg-[#163433] px-6 py-8 text-white shadow-[0_30px_80px_rgba(18,34,33,0.28)] sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,169,74,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(136,220,193,0.18),transparent_30%)]" />
          <div className="relative flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-[0.2em] text-white/90">
              NEUROBLOOM
            </Link>
            <div className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
              Study OS
            </div>
          </div>

          <div className="relative space-y-6 py-10 lg:py-16">
            <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#f6d39b]">
              {eyebrow}
            </span>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-balance sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-lg text-base leading-8 text-white/76 sm:text-lg">
                {description}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "Fast", label: "PDF to summary" },
                { value: "Smart", label: "Quiz generation" },
                { value: "Live", label: "Study tracking" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/14 bg-white/8 p-4 backdrop-blur"
                >
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p className="mt-2 text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-wrap gap-3 text-sm text-white/72">
            <span className="rounded-full border border-white/14 px-4 py-2">
              Learn from your own notes
            </span>
            <span className="rounded-full border border-white/14 px-4 py-2">
              Revise with spaced practice
            </span>
            <span className="rounded-full border border-white/14 px-4 py-2">
              Stay accountable with sessions
            </span>
          </div>
        </div>

        <div className="glass-card-strong gradient-border flex w-full max-w-xl flex-col justify-center rounded-[32px] px-6 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center gap-2 rounded-full bg-[rgba(17,33,31,0.04)] p-1">
            <Link
              href="/login"
              className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                pathname === "/login"
                  ? "bg-[#163433] text-white shadow-sm"
                  : "text-[var(--text-soft)]"
              }`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                pathname === "/register"
                  ? "bg-[#163433] text-white shadow-sm"
                  : "text-[var(--text-soft)]"
              }`}
            >
              Register
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
