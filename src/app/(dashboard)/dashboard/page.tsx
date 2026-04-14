'use client';

import { useEffect, useState } from "react";
import { handleSession } from "@/utils/sessionTracker";
import { getStats } from "@/services/api";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user?.id) return;

    // ✅ START / REUSE SESSION
    let cleanup: any;
    handleSession().then((fn) => {
      cleanup = fn;
    });

    // ✅ FETCH STATS INIT
    getStats(user.id).then(setStats);

    // ✅ LIVE TIMER (UX)
    const timer = setInterval(() => {
      setLiveSeconds((prev) => prev + 1);
    }, 1000);

    // ✅ REFRESH STATS
    const interval = setInterval(() => {
      getStats(user.id).then(setStats);
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, []);

  if (!stats) return <div>Loading...</div>;

  const total = stats.total_time + liveSeconds;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="p-10">
      <h1 className="text-xl mb-4">Dashboard</h1>

      <p>Total Study Time: {formatTime(total)}</p>
      <p>Total Sessions: {stats.total_sessions}</p>
    </div>
  );
}