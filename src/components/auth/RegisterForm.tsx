'use client';

import Link from "next/link";
import { useState } from "react";
import { registerUser } from "@/services/api";

export default function RegisterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.first_name || !form.last_name) {
      setStatus("error");
      setMessage("Fill in all fields before creating your account.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      await registerUser(form);
      setStatus("success");
      setMessage("Registration complete. You can log in right away.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to create your account.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-[var(--text)]">Create account</h2>
        <p className="text-sm leading-7 text-[var(--text-soft)]">
          Set up your workspace for document summaries, quizzes, and focused study sessions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">First name</span>
          <input
            value={form.first_name}
            placeholder="Aarav"
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="w-full rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Last name</span>
          <input
            value={form.last_name}
            placeholder="Sharma"
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="w-full rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Email</span>
          <input
            value={form.email}
            placeholder="you@example.com"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Password</span>
          <input
            type="password"
            value={form.password}
            placeholder="Choose a password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
      </div>

      {message && (
        <div
          className={`rounded-[18px] px-4 py-3 text-sm ${
            status === "error"
              ? "bg-[rgba(178,75,75,0.1)] text-[var(--danger)]"
              : "bg-[rgba(30,122,99,0.1)] text-[var(--accent)]"
          }`}
        >
          {message}
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={status === "loading"}
        className="w-full rounded-[20px] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Creating account..." : "Create NeuroBloom account"}
      </button>

      <p className="text-sm text-[var(--text-soft)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--accent)]">
          Log in
        </Link>
      </p>
    </div>
  );
}
