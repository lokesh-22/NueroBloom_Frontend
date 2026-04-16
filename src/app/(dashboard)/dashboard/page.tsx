'use client';

import { useEffect, useState } from "react";
import { handleSession } from "@/utils/sessionTracker";
import { getStats, type StatsResponse } from "@/services/api";

type StoredUser = {
  id?: number;
  first_name?: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [userName] = useState(() => {
    if (typeof window === "undefined") return "Learner";

    const user = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
    return user?.first_name || "Learner";
  });
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;

    if (!user?.id) return;
    const userId = user.id;

    let cleanup: (() => void) | undefined;
    handleSession().then((fn) => {
      cleanup = fn;
    });

    getStats(userId).then(setStats).catch((err: Error) => setError(err.message));

    const timer = setInterval(() => {
      setLiveSeconds((prev) => prev + 1);
    }, 1000);

    const interval = setInterval(() => {
      getStats(userId).then(setStats).catch(() => undefined);
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, []);

  if (!stats && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="glass-card rounded-[28px] px-6 py-5 text-sm text-[var(--text-soft)]">
          Loading your study dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] bg-[rgba(178,75,75,0.08)] p-6 text-[var(--danger)]">
        {error}
      </div>
    );
  }

  const total = (stats?.total_time || 0) + liveSeconds;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h}h ${m}m ${s}s`;
  };

  const insightCards = [
    {
      label: "Total study time",
      value: formatTime(total),
      note: "Includes your active session right now.",
    },
    {
      label: "Study sessions",
      value: `${stats?.total_sessions || 0}`,
      note: "Each focused block builds consistency.",
    },
    {
      label: "Today’s pace",
      value: liveSeconds > 0 ? `${Math.floor(liveSeconds / 60)} min live` : "Just started",
      note: "Keep the tab open while you revise.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#163433] px-6 py-7 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-12 top-0 h-36 w-36 rounded-full bg-white/10" />
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Overview
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance">
            Welcome back, {userName}. Let’s keep the momentum going.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/75">
            NeuroBloom is already tracking your current focus session. Review your
            study time, jump into documents, or upload fresh material to build the
            next quiz set.
          </p>
        </div>

        <div className="gradient-border glass-card flex min-h-[220px] flex-col justify-between rounded-[30px] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Focus pulse
          </p>
          <div className="my-4">
            <p className="text-4xl font-semibold text-[var(--text)]">
              {formatTime(liveSeconds)}
            </p>
            <div className="mt-4 h-2 rounded-full bg-[rgba(17,33,31,0.08)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-warm))]"
                style={{ width: `${Math.min(100, Math.max(18, Object.keys(stats || {}).length * 14 + Math.floor(liveSeconds / 18))) }%` }}
              />
            </div>
          </div>
          <p className="text-sm leading-7 text-[var(--text-soft)]">
            This timer reflects your active visit on the dashboard and gives your
            study habit a visible rhythm.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {insightCards.map((card) => (
          <article
            key={card.label}
            className="glass-card min-h-[190px] rounded-[26px] p-5"
          >
            <p className="text-sm font-semibold text-[var(--text-soft)]">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--text)]">{card.value}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[28px] border border-[var(--line)] bg-white/70 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Recommended flow
          </p>
          <div className="mt-5 space-y-4">
            {[
              "Upload a fresh lecture PDF or revision sheet.",
              "Open the generated summary and skim the core concepts.",
              "Take the quiz to force recall before your next session.",
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-[22px] bg-[var(--bg)] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(30,122,99,0.12)] font-semibold text-[var(--accent)]">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-[var(--text)]">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.74)] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Why this works
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Condense first",
                text: "A shorter summary lowers the friction to restart a hard topic.",
              },
              {
                title: "Recall second",
                text: "Quiz yourself after reading so understanding turns into memory.",
              },
              {
                title: "Track effort",
                text: "Visible session time helps you stay honest about consistency.",
              },
              {
                title: "Repeat smoothly",
                text: "One place for files, summaries, and questions reduces context switching.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-[22px] bg-white p-5">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
