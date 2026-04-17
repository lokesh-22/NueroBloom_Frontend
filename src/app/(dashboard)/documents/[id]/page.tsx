'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDocumentById, type DocumentRecord } from "@/services/api";

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    getDocumentById(id as string)
      .then(setDoc)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (!doc && !error) {
    return (
      <div className="glass-card rounded-[26px] px-5 py-4 text-sm text-[var(--text-soft)]">
        Loading document...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[26px] bg-[rgba(178,75,75,0.08)] px-5 py-4 text-sm text-[var(--danger)]">
        {error}
      </div>
    );
  }

  if (!doc) return null;

  const canTakeQuiz = doc.status?.toLowerCase() === "completed";

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#163433] p-7 text-white">
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-xs uppercase tracking-[0.28em] text-white/62">
            Document detail
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance">{doc.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/74">
            Review the generated summary, skim the extracted text, and jump to the
            quiz when the document has finished processing.
          </p>
        </div>
        <div className="glass-card rounded-[30px] p-6">
          <p className="text-sm font-semibold text-[var(--text-soft)]">Current status</p>
          <p className="mt-3 text-3xl font-semibold capitalize text-[var(--text)]">
            {doc.status || "pending"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
            {canTakeQuiz
              ? "Summary and quiz content should now be available for revision."
              : "Processing is still underway. Revisit this page shortly for generated content."}
          </p>
          <Link
            href={`/quiz/${doc.id}`}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-4 text-sm font-semibold transition ${
              canTakeQuiz
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]"
                : "pointer-events-none bg-[rgba(17,33,31,0.08)] text-[var(--text-soft)]"
            }`}
          >
            {canTakeQuiz ? "Take quiz" : "Quiz available after processing"}
          </Link>
          <Link
            href={`/chat/${doc.id}`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-[22px] border border-[var(--line)] bg-white px-4 py-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Ask questions about this document
          </Link>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.05fr)]">
        <article className="glass-card rounded-[30px] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Summary
          </p>
          <div className="prose-summary mt-4 text-sm leading-8 text-[var(--text)]">
            {doc.summary || "Summary is not ready yet. Once processing completes, the key ideas will appear here."}
          </div>
        </article>

        <article className="rounded-[30px] border border-[var(--line)] bg-white/72 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Extracted text
          </p>
          <div className="mt-4 max-h-[34rem] overflow-auto rounded-[24px] bg-[var(--bg)] p-5 text-sm leading-8 text-[var(--text)]">
            {doc.extracted_text?.slice(0, 3000) || "Extracted text will appear here after processing."}
          </div>
        </article>
      </section>
    </div>
  );
}
