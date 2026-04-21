import { startSession } from "@/services/api";
import { heartbeat } from "@/services/api";

export const handleSession = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user?.id) return;

  const heartbeatInterval = setInterval(() => {
    heartbeat(user.id).catch(() => {
      // Avoid noisy unhandled rejections on transient network failures.
    });
  }, 10000);

  try {
    const res = await startSession(user.id);

    if (!res?.session_id) {
      console.error("Session creation failed");
      clearInterval(heartbeatInterval);
      return;
    }

    localStorage.setItem("session_id", res.session_id.toString());
    return () => clearInterval(heartbeatInterval);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unable to start session");
    clearInterval(heartbeatInterval);
    return;
  }
};
