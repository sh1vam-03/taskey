import React, { useEffect } from "react"
import { Link } from "react-router-dom"

const About = () => {

  useEffect(() => {
    document.title = "About Taskey | Simple Productivity Platform"
  }, [])

  return (
    <div className=" max-w-4xl mx-auto px-4 sm:px-6 text-gray-900" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>

      {/* HERO */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto animate-fadeIn" >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 fade-up">
          About Taskey
        </h1>
        <p className="text-lg text-gray-600">
          Taskey is a simple and focused productivity platform designed
          to help people manage tasks, build habits, and stay consistent.
        </p>
      </section>

      {/* WHY TASKEY */}
      <section className="py-20 px-6 bg-gray-50" style={{
    backgroundColor: "var(--card)",
    borderColor: "var(--border)"
  }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slideUp">
            <h2 className="text-3xl font-bold mb-4">
              Why Taskey Was Built
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Most productivity tools are overwhelming. People juggle
              multiple apps just to manage daily tasks and habits.
              Taskey was built to bring everything into one clean,
              easy-to-use system.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-slideUp delay-150">
            <p className="font-medium text-gray-800">
              “Productivity should feel calm, not complicated.”
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEM WE SOLVE */}
      <section className="py-20 px-6 ">
        <h2 className="text-3xl font-bold text-center mb-12 animate-fadeIn">
          The Problem We Solve
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-black animate-fadeIn" >
          <Card
            title="Too Many Tools"
            text="Tasks, habits, and schedules are scattered across different apps."
          />
          <Card
            title="Lack of Consistency"
            text="People struggle to stay consistent without a clear system."
          />
          <Card
            title="Mental Overload"
            text="Complex tools create stress instead of clarity."
          />
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="py-20 px-6 bg-gray-50 "  style={{
    backgroundColor: "var(--card)",
    borderColor: "var(--border)"
  }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="animate-slideUp">
            <h2 className="text-3xl font-bold mb-4">
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To help people live intentional lives by giving them
              clarity, focus, and control over their daily actions.
            </p>
          </div>

          <div className="animate-slideUp delay-150">
            <h2 className="text-3xl font-bold mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To build a minimal, reliable, and human-friendly
              productivity system that grows with you.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto animate-fadeIn">
        <h2 className="text-3xl font-bold mb-6">
          Start Organizing Your Life with Taskey
        </h2>
        <p className="text-gray-600 mb-10">
          Join Taskey and take control of your tasks and habits —
          without the clutter.
        </p>

        <Link
          to="/signup"
          className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition"
        >
          Get Started for Free
        </Link>
      </section>

    </div>
  )
}

/* Reusable Card */
const Card = ({ title, text }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-slideUp">
    <h3 className="text-xl font-semibold mb-2">
      {title}
    </h3>
    <p className="text-gray-600">
      {text}
    </p>
  </div>
)

export default About
