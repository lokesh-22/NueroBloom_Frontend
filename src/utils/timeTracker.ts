import { trackTime } from "@/services/api";

export const startTracking = () => {
  const user = JSON.parse(localStorage.getItem("user")!);

  let start = Date.now();
  let active = true;

  // detect tab inactive
  document.addEventListener("visibilitychange", () => {
    active = !document.hidden;
  });

  const interval = setInterval(() => {
    if (!active) return;

    const seconds = Math.floor((Date.now() - start) / 1000);

    if (seconds > 0) {
      trackTime(user.id, seconds);
      start = Date.now();
    }
  }, 10000);

  return () => clearInterval(interval);
};