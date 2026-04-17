'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getQuiz,
  getQuizAttempts,
  submitQuiz,
  type QuizAttemptRecord,
  type QuizRecord,
  type QuizSubmissionResponse,
} from "@/services/api";

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<QuizRecord[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizSubmissionResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    Promise.all([getQuiz(id as string), getQuizAttempts(id as string)])
      .then(([quizData, attemptData]) => {
        setQuiz(quizData || []);
        setAttempts(attemptData || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const normalize = (value: string | undefined | null) =>
    (value ?? "").trim().toLowerCase();

  const extractLetter = (value: string | undefined | null) => {
    const cleaned = (value ?? "").trim().toUpperCase();
    const letterMatch = cleaned.match(/^([A-D])(?:[\s).:-]|$)/);
    return letterMatch?.[1] ?? null;
  };

  const resolveCorrectOption = (q: QuizRecord) => {
    const normalizedAnswer = normalize(q.correct_answer);
    const direct = q.options.find((opt) => normalize(opt) === normalizedAnswer);
    if (direct) return direct;

    const answerLetter = extractLetter(q.correct_answer);
    if (answerLetter) {
      const index = answerLetter.charCodeAt(0) - 65;
      if (index >= 0 && index < q.options.length) {
        return q.options[index];
      }

      const labeled = q.options.find((opt) => extractLetter(opt) === answerLetter);
      if (labeled) return labeled;
    }

    return q.correct_answer;
  };

  const handleSelect = (qId: number, option: string) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const loadAttempts = async () => {
    if (!id) return;
    const data = await getQuizAttempts(id as string);
    setAttempts(data || []);
  };

  const handleSubmit = async () => {
    if (!id || quiz.length === 0) return;

    try {
      setSubmitting(true);
      setError("");
      const response = await submitQuiz(id as string, answers);
      setResult(response);
      await loadAttempts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const retryQuiz = () => {
    setAnswers({});
    setResult(null);
  };

  const getOptionStyle = (q: QuizRecord, opt: string) => {
    const correctOption = resolveCorrectOption(q);

    if (!result) {
      return answers[q.id] === opt
        ? "border-[var(--accent)] bg-[rgba(30,122,99,0.12)] text-[var(--accent-strong)]"
        : "border-[var(--line)] bg-white/70";
    }

    if (normalize(opt) === normalize(correctOption)) {
      return "border-[var(--success)] bg-[rgba(47,143,98,0.12)] text-[var(--success)]";
    }

    if (normalize(answers[q.id]) === normalize(opt)) {
      return "border-[var(--danger)] bg-[rgba(178,75,75,0.1)] text-[var(--danger)]";
    }

    return "border-[var(--line)] bg-white/70 text-[var(--text-soft)]";
  };

  const progressCount = Object.keys(answers).length;
  const latestAttempt = attempts[attempts.length - 1];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#163433] p-7 text-white">
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-xs uppercase tracking-[0.28em] text-white/62">
            Adaptive quiz
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance">
            Learn, attempt, analyze, and improve with every retry.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/74">
            Your answers are now saved as attempts, scored against the generated
            quiz, and turned into clear next-step feedback.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="glass-card rounded-[30px] p-6">
            <p className="text-sm font-semibold text-[var(--text-soft)]">Progress</p>
            <p className="mt-3 text-4xl font-semibold text-[var(--text)]">
              {progressCount}/{quiz.length}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
              Answer every question for the clearest learning signal.
            </p>
          </div>
          <div className="glass-card rounded-[30px] p-6">
            <p className="text-sm font-semibold text-[var(--text-soft)]">Attempts</p>
            <p className="mt-3 text-4xl font-semibold text-[var(--text)]">
              {attempts.length}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
              Latest result: {latestAttempt ? `${latestAttempt.score}%` : "No submissions yet"}.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[26px] bg-[rgba(178,75,75,0.08)] px-5 py-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {loading && (
        <div className="glass-card rounded-[26px] px-5 py-4 text-sm text-[var(--text-soft)]">
          Loading quiz...
        </div>
      )}

      {!loading && quiz.length === 0 && !error && (
        <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] bg-white/60 px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold">No quiz available yet</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
            This document may still be processing, or the quiz has not been generated.
          </p>
        </div>
      )}

      {result && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
          <div className="gradient-border glass-card-strong rounded-[30px] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
              Result summary
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] bg-white/80 p-5">
                <p className="text-sm font-semibold text-[var(--text-soft)]">Score</p>
                <p className="mt-3 text-4xl font-semibold text-[var(--text)]">
                  {result.score}%
                </p>
                <p className="mt-2 text-sm text-[var(--text-soft)]">
                  {result.correct_count}/{result.total_questions} correct
                </p>
              </div>
              <div className="rounded-[22px] bg-white/80 p-5">
                <p className="text-sm font-semibold text-[var(--text-soft)]">Attempt</p>
                <p className="mt-3 text-4xl font-semibold text-[var(--text)]">
                  #{result.attempt_number}
                </p>
                <p className="mt-2 text-sm text-[var(--text-soft)]">
                  Improvement: {result.improvement > 0 ? "+" : ""}{result.improvement}%
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-white/70 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  Performance level
                </span>
                <span className="rounded-full bg-[rgba(30,122,99,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                  {result.performance_level}
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--text)]">
                {result.feedback}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {result.performance_level === "strong" ? (
                <Link
                  href="/documents"
                  className="rounded-[20px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  Next content
                </Link>
              ) : (
                <button
                  onClick={retryQuiz}
                  className="rounded-[20px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  Retry quiz
                </button>
              )}
              <Link
                href={`/documents/${id}`}
                className="rounded-[20px] border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Review summary
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-[var(--line)] bg-white/72 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
              Weak areas
            </p>
            {result.weak_areas.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
                No weak areas detected on this attempt. Your recall was strong across the quiz.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {result.weak_areas.map((item) => (
                  <article key={item.question_id} className="rounded-[22px] bg-[var(--bg)] p-4">
                    <p className="text-sm font-semibold text-[var(--text)]">{item.question}</p>
                    <p className="mt-2 text-sm text-[var(--text-soft)]">
                      Your answer: {item.selected_answer || "Not answered"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--success)]">
                      Correct answer: {item.correct_answer}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {attempts.length > 0 && (
        <section className="rounded-[30px] border border-[var(--line)] bg-white/72 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Attempt history
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {attempts.map((attempt) => (
              <article key={attempt.attempt_number} className="glass-card rounded-[24px] p-4">
                <p className="text-sm font-semibold text-[var(--text)]">
                  Attempt #{attempt.attempt_number}
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--text)]">
                  {attempt.score}%
                </p>
                <p className="mt-2 text-sm text-[var(--text-soft)]">
                  {attempt.correct_count}/{attempt.total_questions} correct
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">
                  {attempt.performance_level}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!loading && quiz.map((q, index) => (
        <article key={q.id} className="glass-card rounded-[28px] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-soft)]">
            Question {index + 1}
          </p>
          <p className="mt-3 text-xl font-semibold leading-8 text-[var(--text)]">
            {q.question}
          </p>

          <div className="mt-5 space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`w-full rounded-[20px] border px-4 py-4 text-left text-sm font-medium transition ${getOptionStyle(q, opt)}`}
                onClick={() => handleSelect(q.id, opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {result && (
            <p className="mt-4 text-sm text-[var(--text-soft)]">
              Correct answer:{" "}
              <span className="font-semibold text-[var(--success)]">
                {resolveCorrectOption(q)}
              </span>
            </p>
          )}
        </article>
      ))}

      {!loading && !result && quiz.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-[24px] bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Submitting quiz..." : "Submit quiz"}
        </button>
      )}
    </div>
  );
}
