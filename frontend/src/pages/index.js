import Link from "next/link"
import Navbar from "../components/common/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen" style={{ color: "var(--text)" }}>
      <Navbar />

      <section className="bg min-h-screen flex flex-col justify-center items-center text-center px-6 fade-up">
        <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: "var(--heading)" }}>
          Organize Your Life with <span className="text-gray-500">Taskey</span>
        </h1>

        <p className="max-w-2xl text-lg text-gray-600 mb-8">
          Taskey helps you manage tasks, plan schedules, and track habits —
          all in one simple and powerful platform.
        </p>

        <div className="flex gap-4">
          <Link
            href="/signup"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Get Started
          </Link>
        </div>
      </section>


      <section
        className="rounded-xl border p-6"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)"
        }}
      >
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--heading)" }}>
          Key Features
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <Feature
            title="Task Management"
            description="Create, organize, and prioritize tasks to stay productive every day."
          />
          <Feature
            title="Smart Scheduling"
            description="Plan your day, week, and month with an intuitive scheduling system."
          />
          <Feature
            title="Behavior Tracking"
            description="Build habits and track your behavior to improve consistency and focus."
          />
        </div>
      </section>


      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--heading)" }}>
          How Taskey Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          <Step number="1" title="Sign Up" description="Create your free Taskey account in seconds." />
          <Step number="2" title="Add Tasks" description="Set tasks, schedules, and habits easily." />
          <Step number="3" title="Track Progress" description="Stay consistent and achieve your goals." />
        </div>
      </section>

      {/* SCREENSHOTS PLACEHOLDER */}
      <section
        className="rounded-xl border p-6"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)"
        }}
      >
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--heading)" }}>
          See Taskey in Action
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {["Dashboard", "Task View", "Habit Tracker"].map((text) => (
            <div
              key={text}
              className="h-56 rounded-xl border shadow flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900"
            >
              {text} Screenshot
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6" style={{ color: "var(--heading)" }}>
          Start Managing Your Life Better
        </h2>

        <p className="text-gray-600 mb-8">
          Join Taskey today and take control of your tasks and habits.
        </p>

        <Link
          href="/signup"
          className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  )
}

/* Feature Component */
const Feature = ({ title, description }) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition card">
    <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--heading)" }}>{title}</h3>
    <p className="opacity-80">{description}</p>
  </div>
)

/* Step Component */
const Step = ({ number, title, description }) => (
  <div>
    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-black text-white font-bold">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--heading)" }}>{title}</h3>
    <p className="opacity-80">{description}</p>
  </div>
)
