'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getQuiz, type QuizRecord } from "@/services/api";

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<QuizRecord[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getQuiz(id as string)
      .then(data => setQuiz(data || []))
      .catch((err: Error) => setError(err.message));
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

    // 1) Exact normalized text match against options.
    const direct = q.options.find((opt) => normalize(opt) === normalizedAnswer);
    if (direct) return direct;

    // 2) Map letter answers (A/B/C/D) to option index.
    const answerLetter = extractLetter(q.correct_answer);
    if (answerLetter) {
      const index = answerLetter.charCodeAt(0) - 65;
      if (index >= 0 && index < q.options.length) {
        return q.options[index];
      }

      // 3) Match options that are prefixed with labels like "A)" or "B.".
      const labeled = q.options.find((opt) => extractLetter(opt) === answerLetter);
      if (labeled) return labeled;
    }

    return q.correct_answer;
  };

  const handleSelect = (qId: number, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const checkAnswers = () => {
    let correct = 0;

    quiz.forEach((q) => {
      const correctOption = resolveCorrectOption(q);
      if (normalize(answers[q.id]) === normalize(correctOption)) correct++;
    });

    setScore(correct);
    setSubmitted(true);
  };

  const getOptionStyle = (q: QuizRecord, opt: string) => {
    const correctOption = resolveCorrectOption(q);

    if (!submitted) {
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

  const retryQuiz = () => {
    setAnswers({});
    setScore(0);
    setSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#163433] p-7 text-white">
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-xs uppercase tracking-[0.28em] text-white/62">
            Quiz mode
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance">
            Test your recall before the material fades.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/74">
            Select one answer for each question, then submit to reveal the score
            and correct responses.
          </p>
        </div>
        <div className="glass-card rounded-[30px] p-6">
          <p className="text-sm font-semibold text-[var(--text-soft)]">Progress</p>
          <p className="mt-3 text-4xl font-semibold text-[var(--text)]">
            {Object.keys(answers).length}/{quiz.length}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
            Answer every question for the strongest recall check.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-[26px] bg-[rgba(178,75,75,0.08)] px-5 py-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {quiz.length === 0 && !error && (
        <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] bg-white/60 px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold">No quiz available yet</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
            This document may still be processing, or the quiz has not been generated.
          </p>
        </div>
      )}

      {submitted && (
        <div className="gradient-border glass-card-strong rounded-[30px] p-6 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Score
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-[var(--text)]">
            {score} / {quiz.length}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
            {score === quiz.length
              ? "Excellent recall. You’re ready to move on or review a harder topic."
              : "Review the correct answers below, then try again to lock the ideas in."}
          </p>
          <button
            onClick={retryQuiz}
            className="mt-5 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Retry quiz
          </button>
        </div>
      )}

      {quiz.map((q, index) => (
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

          {submitted && (
            <p className="mt-4 text-sm text-[var(--text-soft)]">
              Correct answer:{" "}
              <span className="font-semibold text-[var(--success)]">
                {resolveCorrectOption(q)}
              </span>
            </p>
          )}
        </article>
      ))}

      {!submitted && quiz.length > 0 && (
        <button
          onClick={checkAnswers}
          className="w-full rounded-[24px] bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        >
          Submit quiz
        </button>
      )}
    </div>
  );
}
