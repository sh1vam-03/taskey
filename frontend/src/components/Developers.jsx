import React, { useEffect } from "react"

const Developers = () => {
  useEffect(() => {
    document.title = "Developers & Contributors | Taskey"
  }, [])

  return (
    <main
      className="max-w-5xl mx-auto px-6 py-20"
      style={{ color: "var(--text)" }}
    >
      {/* Header */}
      <header className="mb-16 text-center fade-up">
        <h1
          className="text-4xl font-semibold mb-3"
          style={{ color: "var(--heading)" }}
        >
          Developers & Contributors
        </h1>
        <p className="opacity-80 max-w-2xl mx-auto">
          Taskey is built by passionate developers who believe in simplicity,
          transparency, and open collaboration.
        </p>
      </header>

      {/* Team Grid */}
      <div className="grid md:grid-cols-3 gap-10 staggered">

        <Member
          name="Atharv Kundalkar"
          role="Frontend Developer"
          github="https://github.com/atharvkundalkar"
          linkedin="https://www.linkedin.com/in/atharv-kundalkar-52467028b/"
        />

        <Member
          name="Balaji Bokare"
          role="Backend Developer"
          github="https://github.com/sh1vam-03"
          linkedin="https://www.linkedin.com/in/sh1vam-03-/"
        />

        <Member
          name="Hanumant Surve"
          role="Contributors"
          github="https://github.com/your-repo"
        />

      </div>

      
      <section className="mt-20 text-center">
        <p className="opacity-80">
          Want to contribute? Visit our GitHub repository and help improve
          Taskey for everyone.
        </p>
        <a
          href="https://github.com/your-repo"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-6 px-6 py-3 rounded-lg border transition hover:opacity-80"
          style={{ borderColor: "var(--border)" }}
        >
          View on GitHub
        </a>
      </section>
    </main>
  )
}

/* Member Card */
const Member = ({ name, role, github, linkedin }) => (
  <div
    className="p-6 rounded-xl border text-center"
    style={{
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
    }}
  >
    <h3
      className="text-lg font-medium mb-1"
      style={{ color: "var(--heading)" }}
    >
      {name}
    </h3>
    <p className="text-sm opacity-80 mb-4">{role}</p>

    <div className="flex justify-center gap-4 text-sm">
      {github && (
        <a href={github} target="_blank" rel="noreferrer" className="hover:underline">
          GitHub
        </a>
      )}
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noreferrer" className="hover:underline">
          LinkedIn
        </a>
      )}
    </div>
  </div>
)

export default Developers
