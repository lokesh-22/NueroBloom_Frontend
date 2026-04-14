'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getQuiz } from "@/services/api";

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    getQuiz(id as string)
      .then(data => setQuiz(data || []))
      .catch(err => console.error(err));
  }, [id]);

  const handleSelect = (qId: number, option: string) => {
    if (submitted) return; // 🔥 lock after submit
    setAnswers({ ...answers, [qId]: option });
  };

  const checkAnswers = () => {
    let correct = 0;

    quiz.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);
  };

  const getOptionStyle = (q: any, opt: string) => {
    if (!submitted) {
      return answers[q.id] === opt
        ? "bg-blue-100 border-blue-400"
        : "bg-white";
    }

    if (opt === q.correct_answer) {
      return "bg-green-100 border-green-500"; // correct
    }

    if (answers[q.id] === opt) {
      return "bg-red-100 border-red-500"; // wrong selected
    }

    return "bg-white";
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Quiz</h1>

      {quiz.length === 0 && <p>No quiz available</p>}

      {/* SCORE CARD */}
      {submitted && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
          <h2 className="text-xl font-semibold">
            Score: {score} / {quiz.length}
          </h2>
        </div>
      )}

      {quiz.map((q, index) => (
        <div key={q.id} className="mb-6 border p-4 rounded-lg shadow-sm">
          <p className="font-semibold mb-3">
            Q{index + 1}. {q.question}
          </p>

          {q.options.map((opt: string) => (
            <div
              key={opt}
              className={`border p-2 rounded mb-2 cursor-pointer ${getOptionStyle(
                q,
                opt
              )}`}
              onClick={() => handleSelect(q.id, opt)}
            >
              {opt}
            </div>
          ))}

          {/* SHOW CORRECT ANSWER */}
          {submitted && (
            <p className="text-sm mt-2">
              Correct Answer:{" "}
              <span className="font-medium text-green-600">
                {q.correct_answer}
              </span>
            </p>
          )}
        </div>
      ))}

      {!submitted && quiz.length > 0 && (
        <button
          onClick={checkAnswers}
          className="w-full bg-blue-500 text-white py-3 rounded-lg mt-5 hover:bg-blue-600"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
}