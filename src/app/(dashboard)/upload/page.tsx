'use client';

import { useState } from "react";
import { uploadDocument } from "@/services/api";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}") as { id?: number };
    if (!user.id) {
      setStatus("error");
      setMessage("You need to log in before uploading a document.");
      return;
    }

    if (!file) {
      setStatus("error");
      setMessage("Choose a file before uploading.");
      return;
    }

    try {
      setStatus("uploading");
      setMessage("");
      await uploadDocument(file, user.id);
      setStatus("success");
      setMessage("Document uploaded. Processing has started in the background.");
      setFile(null);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#163433] p-7 text-white">
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-xs uppercase tracking-[0.28em] text-white/62">
            Upload material
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance">
            Add your study document and let NeuroBloom build the next review cycle.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/74">
            Upload PDFs or notes, then return to the documents area for summaries,
            extracted text, and quiz practice.
          </p>
        </div>
        <div className="glass-card rounded-[30px] p-6">
          <p className="text-sm font-semibold text-[var(--text)]">Best results</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-soft)]">
            <li>Use clean lecture notes or revision PDFs with readable text.</li>
            <li>Short, focused documents usually generate clearer quizzes.</li>
            <li>Open the document detail page after upload to review progress.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="gradient-border glass-card-strong rounded-[30px] p-6 sm:p-8">
          <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] bg-white/66 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
              File picker
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Choose your next document</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
              Once uploaded, processing starts automatically in the backend worker.
            </p>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[24px] bg-[var(--bg)] px-6 py-10 text-center transition hover:bg-[var(--bg-strong)]">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                Select file
              </span>
              <span className="mt-4 text-lg font-semibold text-[var(--text)]">
                {file ? file.name : "Click to browse your study material"}
              </span>
              <span className="mt-2 text-sm text-[var(--text-soft)]">
                PDF and text-based study files work best.
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {message && (
              <div
                className={`mt-5 rounded-[18px] px-4 py-3 text-sm ${
                  status === "error"
                    ? "bg-[rgba(178,75,75,0.1)] text-[var(--danger)]"
                    : "bg-[rgba(30,122,99,0.1)] text-[var(--accent)]"
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={status === "uploading"}
              className="mt-6 w-full rounded-[22px] bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "uploading" ? "Uploading..." : "Upload and process"}
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-[var(--line)] bg-white/70 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            After upload
          </p>
          <div className="mt-5 space-y-4">
            {[
              "The document is stored and marked pending.",
              "Background processing extracts text and generates a summary.",
              "A quiz becomes available from the document detail page.",
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-[22px] bg-[var(--bg)] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white font-semibold text-[var(--accent)]">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-[var(--text)]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
