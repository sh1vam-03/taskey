import React, { useEffect } from "react"

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | Taskey"
  }, [])

  return (
    <main
      className=" max-w-4xl mx-auto px-4 sm:px-6 py-20"
      style={{ color: "var(--text)" }}
    >
      {/* Title */}
      <header className="mb-14 fade-up">
        <h1
          className="text-4xl font-semibold mb-3"
          style={{ color: "var(--heading)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm opacity-70">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      {/* Content */}
      <div className="space-y-14 leading-relaxed">

        <section>
          <p>
            At <strong>Taskey</strong>, your privacy matters to us.
            This policy explains what information we collect, how we use it,
            and how we protect your data when you use our platform.
          </p>
        </section>

        <Section title="Information We Collect">
          <ul className="list-disc pl-5 space-y-2">
            <li>Email address and basic account details</li>
            <li>Tasks, schedules, and habit-related data</li>
            <li>Behavior and usage logs for product improvement</li>
            <li>Device and browser information for security purposes</li>
          </ul>
        </Section>

        <Section title="How We Use Your Data">
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide and maintain core platform features</li>
            <li>Personalize your experience</li>
            <li>Improve usability and performance</li>
            <li>Send important service or security updates</li>
          </ul>
        </Section>

        <Section title="Security Practices">
          <p>
            We use industry-standard security measures including encryption,
            secure authentication, and restricted access controls to protect
            your information from unauthorized access or misuse.
          </p>
        </Section>

        <Section title="Data Sharing">
          <p>
            We do not sell your personal data. Information is shared only when
            required by law or to operate essential services that support
            Taskey.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>
            You may access, update, or delete your personal information at any
            time. For questions or requests regarding your data, please reach
            out to us.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <strong>support@taskey.app</strong>.
          </p>
        </Section>

      </div>
    </main>
  )
}

/* Reusable minimal section */
const Section = ({ title, children }) => (
  <section>
    <h2
      className="text-lg font-medium mb-3"
      style={{ color: "var(--heading)" }}
    >
      {title}
    </h2>
    <div className="opacity-90">
      {children}
    </div>
  </section>
)

export default PrivacyPolicy
