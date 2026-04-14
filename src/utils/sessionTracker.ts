import { startSession } from "@/services/api";
import { heartbeat } from "@/services/api";

export const handleSession = async () => {
 const user = JSON.parse(localStorage.getItem("user") || "{}");

setInterval(() => {
  if (user?.id) {
    heartbeat(user.id);
  }
}, 10000); // every 10 sec

  if (!user?.id) return;

  // ✅ ALWAYS CALL — backend decides reuse
  const res = await startSession(user.id);

  if (!res?.session_id) {
    console.error("Session creation failed");
    return;
  }

  localStorage.setItem("session_id", res.session_id.toString());
};