'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  getChatMessages,
  getDocumentById,
  sendChatMessage,
  type ChatMessageRecord,
  type DocumentRecord,
} from "@/services/api";

export default function DocumentChatPage() {
  const { document_id } = useParams();
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!document_id) return;

    setLoading(true);
    setError("");

    Promise.all([
      getDocumentById(document_id as string),
      getChatMessages(document_id as string),
    ])
      .then(([doc, history]) => {
        setDocument(doc);
        setMessages(history || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [document_id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const quickPrompts = useMemo(() => ([
    "Summarize the most important ideas from this document.",
    "Explain the hardest concept in simpler words.",
    "What should I revise before taking the quiz again?",
  ]), []);

  const handleSend = async (message: string) => {
    if (!document_id || !message.trim()) return;

    const userMessage: ChatMessageRecord = {
      role: "user",
      content: message.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await sendChatMessage(document_id as string, message.trim());
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message");
      setMessages((prev) => prev.filter((item, index) => !(index === prev.length - 1 && item === userMessage)));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#163433] p-7 text-white">
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-xs uppercase tracking-[0.28em] text-white/62">
            Document tutor
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance">
            Ask grounded questions and keep learning from the same material.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/74">
            The assistant answers only from your uploaded document and remembers the recent conversation.
          </p>
        </div>

        <div className="glass-card rounded-[30px] p-6">
          <p className="text-sm font-semibold text-[var(--text-soft)]">Active document</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">
            {document?.title || "Loading document..."}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
            Ask follow-up questions, request simpler explanations, or revisit quiz topics using the document as context.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-[26px] bg-[rgba(178,75,75,0.08)] px-5 py-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="glass-card-strong rounded-[30px] p-4 sm:p-6">
          <div className="h-[58vh] overflow-y-auto rounded-[24px] bg-white/55 p-4 sm:p-5">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-[var(--text-soft)]">
                Loading chat...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm leading-7 text-[var(--text-soft)]">
                Start a conversation about this document. The tutor will answer using the indexed document content.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}-${message.content.slice(0, 18)}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-7 ${
                        message.role === "user"
                          ? "bg-[#163433] text-white"
                          : "border border-[var(--line)] bg-white text-[var(--text)]"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-[24px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--text-soft)]">
                      Thinking through the document...
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[24px] border border-[var(--line)] bg-white/70 p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything grounded in this document..."
              className="min-h-28 w-full resize-none bg-transparent text-sm leading-7 text-[var(--text)] outline-none"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">
                Memory-aware chat
              </p>
              <button
                onClick={() => handleSend(input)}
                disabled={sending || !input.trim()}
                className="rounded-[18px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[var(--line)] bg-white/72 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Quick prompts
          </p>
          <div className="mt-4 space-y-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={sending}
                className="w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-4 text-left text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
