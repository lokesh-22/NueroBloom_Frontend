'use client';
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { getDocuments, type DocumentRecord } from "@/services/api";

function getStatusTone(status: string) {
  const normalized = status?.toLowerCase() || "pending";

  if (normalized === "completed") {
    return {
      badge: "bg-[rgba(47,143,98,0.12)] text-[var(--success)]",
      dot: "bg-[var(--success)]",
    };
  }

  if (normalized === "processing") {
    return {
      badge: "bg-[rgba(241,169,74,0.18)] text-[#9b6300]",
      dot: "bg-[#f1a94a]",
    };
  }

  return {
    badge: "bg-[rgba(17,33,31,0.08)] text-[var(--text-soft)]",
    dot: "bg-[var(--text-soft)]",
  };
}

export default function Documents() {
  const router = useRouter();
  const [userId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;

    const user = JSON.parse(localStorage.getItem("user") || "{}") as { id?: number };
    return user.id ?? null;
  });
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState(() =>
    userId === null ? "You need to log in to view your documents." : ""
  );
  const [loading, setLoading] = useState(() => userId !== null);

  useEffect(() => {
    if (userId === null) return;

    getDocuments(userId).then((res) => {
      if (Array.isArray(res)) {
        setDocs(res);
      } else if (res?.documents) {
        setDocs(res.documents);
      } else {
        setDocs([]);
      }
      setLoading(false);
    }).catch((err: Error) => {
      setError(err.message);
      setLoading(false);
    });
  }, [userId]);

  const completedDocs = docs.filter((doc) => doc.status?.toLowerCase() === "completed").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#163433] p-7 text-white">
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-xs uppercase tracking-[0.28em] text-white/62">
            Documents
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance">
            Your study library, summaries, and quiz-ready material.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/74">
            Open any document to review its extracted text, generated summary, and
            revision quiz once processing is complete.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card flex min-h-[170px] flex-col justify-between rounded-[28px] p-5">
            <p className="text-sm font-semibold text-[var(--text-soft)]">Total documents</p>
            <p className="mt-3 text-4xl font-semibold">{docs.length}</p>
          </div>
          <div className="glass-card flex min-h-[170px] flex-col justify-between rounded-[28px] p-5">
            <p className="text-sm font-semibold text-[var(--text-soft)]">Completed</p>
            <p className="mt-3 text-4xl font-semibold">{completedDocs}</p>
          </div>
        </div>
      </section>

      {loading && (
        <div className="glass-card rounded-[26px] px-5 py-4 text-sm text-[var(--text-soft)]">
          Loading documents...
        </div>
      )}

      {error && (
        <div className="rounded-[26px] bg-[rgba(178,75,75,0.08)] px-5 py-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {!loading && !error && docs.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] bg-white/60 px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold">No documents yet</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
            Upload your first study file to start generating summaries and quizzes.
          </p>
        </div>
      )}

      {!loading && !error && docs.length > 0 && (
        <section className="grid gap-4 2xl:grid-cols-2">
          {docs.map((doc) => {
            const tone = getStatusTone(doc.status);

            return (
              <article
                key={doc.id}
                className="glass-card group cursor-pointer rounded-[28px] p-6 transition hover:-translate-y-1 hover:bg-white/90"
                onClick={() => router.push(`/documents/${doc.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-[var(--text-soft)]">
                      Document #{doc.id}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">
                      {doc.title}
                    </h2>
                  </div>
                  <span className={`status-pill ${tone.badge}`}>
                    <span className={`status-dot ${tone.dot}`} />
                    {doc.status || "pending"}
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--text-soft)]">
                  {doc.summary || "Summary will appear here when processing completes."}
                </p>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-[var(--text-soft)]">
                    {doc.file_type ? `${doc.file_type.toUpperCase()} file` : "Study file"}
                  </span>
                  <span className="font-semibold text-[var(--accent)]">
                    Open document
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
