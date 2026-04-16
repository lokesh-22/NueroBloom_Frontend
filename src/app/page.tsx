import Link from "next/link";

const features = [
  {
    title: "Upload and organize materials",
    description:
      "Bring in PDFs or notes, then keep everything in one calm workspace built for revision.",
  },
  {
    title: "Turn dense text into clear summaries",
    description:
      "Get digestible takeaways so you can review concepts faster and stop rereading blindly.",
  },
  {
    title: "Practice with generated quizzes",
    description:
      "Move from passive reading to active recall with question sets tied to each document.",
  },
];

const steps = [
  "Create your account and start a study session.",
  "Upload lecture notes, handouts, or revision PDFs.",
  "Review summaries and challenge yourself with quizzes.",
];

export default function Home() {
  return (
    <main className="page-shell min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col rounded-[34px] border border-white/50 bg-[rgba(255,252,247,0.8)] px-6 py-6 shadow-[0_30px_100px_rgba(20,33,31,0.12)] backdrop-blur sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--accent)]">
              NeuroBloom
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--text)]">
              Study website for focused learners
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#163433] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c4745]"
            >
              Create account
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-[rgba(30,122,99,0.22)] bg-[rgba(30,122,99,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                Notes to mastery
              </span>
              <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.02] text-balance text-[#102724] sm:text-6xl lg:text-7xl">
                Build better study momentum with summaries, quizzes, and a cleaner routine.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text-soft)]">
                NeuroBloom is designed for students who want one place to upload
                material, revise key ideas quickly, and track real effort across
                sessions.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-full bg-[var(--accent)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Start studying smarter
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-[var(--line)] bg-white px-6 py-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Open dashboard
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="glass-card rounded-[24px] p-5"
                >
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="gradient-border glass-card-strong relative overflow-hidden rounded-[32px] p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[rgba(241,169,74,0.18)] blur-3xl" />
            <div className="relative space-y-6">
              <div className="rounded-[28px] bg-[#163433] p-6 text-white">
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">
                  Study loop
                </p>
                <h3 className="mt-3 text-3xl font-semibold">From upload to active recall</h3>
                <p className="mt-3 text-sm leading-7 text-white/74">
                  Every document becomes a study asset instead of another file
                  forgotten in downloads.
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-[24px] border border-[var(--line)] bg-white/72 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(30,122,99,0.12)] font-semibold text-[var(--accent)]">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-[var(--text)]">{step}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
                  <p className="text-3xl font-semibold">3x</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                    clearer review flow when notes, summaries, and questions live together
                  </p>
                </div>
                <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
                  <p className="text-3xl font-semibold">1 hub</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                    for revision sessions, document progress, and practice checks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
