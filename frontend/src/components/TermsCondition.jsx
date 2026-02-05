import React, { useEffect } from "react"

const TermsConditions = () => {
  useEffect(() => {
    document.title = "Terms & Conditions | Taskey"
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
          Terms & Conditions
        </h1>
        <p className="text-sm opacity-70">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      {/* Content */}
      <div className="space-y-14 leading-relaxed">

        <section>
          <p>
            These Terms & Conditions govern your use of <strong>Taskey</strong>.
            By accessing or using our platform, you agree to comply with these
            terms. If you do not agree, please discontinue use of the service.
          </p>
        </section>

        <Section title="User Responsibilities">
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide accurate and up-to-date account information</li>
            <li>Use Taskey only for lawful purposes</li>
            <li>Do not attempt to misuse, disrupt, or reverse-engineer the platform</li>
            <li>Maintain the security of your account credentials</li>
          </ul>
        </Section>

        <Section title="Account Usage">
          <p>
            Your Taskey account is personal to you and may not be shared,
            transferred, or sold. You are responsible for all activity that
            occurs under your account.
          </p>
        </Section>

        <Section title="Data Ownership">
          <p>
            You retain full ownership of the content and data you create within
            Taskey, including tasks and behavior logs. By using the platform,
            you grant us permission to process this data solely to operate and
            improve our services.
          </p>
        </Section>

        <Section title="Acceptable Use">
          <p>
            You agree not to use Taskey in a way that violates applicable laws,
            infringes on intellectual property rights, or interferes with the
            platform’s integrity or availability.
          </p>
        </Section>

        <Section title="Termination">
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these Terms & Conditions or misuse the platform.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            We may update these Terms & Conditions from time to time. Continued
            use of Taskey after changes are posted constitutes acceptance of
            the revised terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            If you have questions about these Terms & Conditions, please contact
            us at <strong>support@taskey.app</strong>.
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

export default TermsConditions
