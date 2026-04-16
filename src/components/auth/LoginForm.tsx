'use client';

import Link from "next/link";
import { useState } from "react";
import { loginUser } from "@/services/api";

export default function LoginForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setStatus("error");
      setMessage("Enter both email and password to continue.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const res = await loginUser(form);

      localStorage.setItem("token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));

      window.location.href = "/dashboard";
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to log in right now.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-[var(--text)]">Log in</h2>
        <p className="text-sm leading-7 text-[var(--text-soft)]">
          Access your dashboard, documents, and quiz progress.
        </p>
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
            value={form.password}
            type="password"
            placeholder="Enter your password"
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
        onClick={handleLogin}
        disabled={status === "loading"}
        className="w-full rounded-[20px] bg-[#163433] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4745] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Signing you in..." : "Continue to dashboard"}
      </button>

      <p className="text-sm text-[var(--text-soft)]">
        New here?{" "}
        <Link href="/register" className="font-semibold text-[var(--accent)]">
          Create your account
        </Link>
      </p>
    </div>
  );
}
