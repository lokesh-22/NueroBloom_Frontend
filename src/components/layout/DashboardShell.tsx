'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type UserProfile = {
  first_name?: string;
  email?: string;
};

const navItems = [
  { href: "/dashboard", label: "Overview", hint: "Study rhythm" },
  { href: "/upload", label: "Upload", hint: "Add new material" },
  { href: "/documents", label: "Documents", hint: "Summaries and quizzes" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return null;

    const rawUser = window.localStorage.getItem("user");
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawUser = window.localStorage.getItem("user");
    const token = window.localStorage.getItem("token");

    if (!rawUser || !token) {
      router.replace("/login");
      return;
    }

    try {
      JSON.parse(rawUser);
    } catch {
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  const initials = useMemo(() => {
    const name = user?.first_name?.trim();
    const email = user?.email?.trim();

    if (name) return name.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "NB";
  }, [user]);

  const logout = () => {
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("session_id");
    router.push("/login");
  };

  return (
    <div className="page-shell min-h-screen px-4 py-4 sm:px-6 lg:h-[100dvh] lg:overflow-hidden lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1500px] flex-col gap-4 lg:h-[calc(100dvh-2rem)] lg:min-h-0 lg:flex-row lg:gap-5">
        <aside className="glass-card-strong relative flex w-full flex-col justify-between overflow-hidden rounded-[30px] p-4 lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)] lg:w-[320px] lg:flex-none lg:p-6">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-32 rounded-b-[32px] bg-[radial-gradient(circle_at_top,rgba(241,169,74,0.18),transparent_70%)]" />
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[26px] bg-[#163433] p-5 text-white">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-sm" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    NeuroBloom
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Study control center</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold">
                  {initials}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/72">
                Upload material, review concise summaries, and turn every study
                session into a quiz-ready loop.
              </p>
            </div>

            <nav className="space-y-2.5">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-[22px] border px-4 py-4 transition ${
                      active
                        ? "border-[#163433] bg-[#163433] text-white shadow-[0_16px_36px_rgba(22,52,51,0.22)]"
                        : "border-[var(--line)] bg-white/55 text-[var(--text)] hover:border-[rgba(30,122,99,0.25)] hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className={`mt-1 text-xs ${active ? "text-white/70" : "text-[var(--text-soft)]"}`}>
                          {item.hint}
                        </div>
                      </div>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          active ? "bg-[var(--accent-warm)]" : "bg-[rgba(17,33,31,0.14)]"
                        }`}
                      />
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.68)] p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-soft)]">
                Signed in
              </p>
              <p className="mt-2 text-lg font-semibold">
                {user?.first_name || "Learner"}
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                {user?.email || "Your study space is ready"}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-full rounded-[20px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="glass-card-strong relative min-h-[70vh] flex-1 overflow-hidden rounded-[30px] p-4 sm:p-6 lg:h-[calc(100dvh-2rem)] lg:min-h-0 lg:p-0">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(30,122,99,0.16),transparent_70%)]" />
          <div className="dashboard-main-scroll relative h-full overflow-y-visible lg:overflow-y-auto">
            <div className="mx-auto max-w-6xl p-0 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
