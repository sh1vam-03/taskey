"use client";
import React from "react";
import Button from "@/components/ui/Button";

// ─── Section Components ───────────────────────────────────────────────────────

function SectionHeading({ number, title }) {
    return (
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-start gap-3">
            <span className="text-cyan-500 font-mono text-sm mt-1 shrink-0">{String(number).padStart(2, "0")}.</span>
            <span>{title}</span>
        </h2>
    );
}

function SubHeading({ title }) {
    return (
        <h3 className="text-base font-semibold text-cyan-300 mb-2 mt-6 uppercase tracking-wider font-mono">
            {title}
        </h3>
    );
}

function BulletList({ items }) {
    return (
        <ul className="list-none pl-0 space-y-2 text-gray-400">
            {items.map((item, i) => (
                <li key={i} className="flex gap-2">
                    <span className="text-cyan-500 mt-1 shrink-0">›</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

function Divider() {
    return <div className="border-t border-white/5 my-2" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PrivacyClient() {
    const lastUpdated = "February 22, 2026";

    return (
        <div className="min-h-[100dvh] bg-black text-gray-300 -mt-20 pt-[calc(var(--section-spacing)*1.5)] pb-[var(--section-spacing)] px-[var(--container-padding)] overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">

            {/* GLOBAL BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
                {/* RESPONSIVE AiEnergySphere */}
            </div>

            <div className="w-full max-w-3xl mx-auto relative z-10">

                {/* Header */}
                <div className="mb-8 md:mb-16 border-b border-white/10 pb-8">
                    <p className="text-sm font-mono text-cyan-500 mb-2 tracking-widest">TASKTIME · Maharashtra, India</p>
                    <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 tracking-tighter">Privacy Policy</h1>
                    <p className="text-sm font-mono text-gray-500">Last updated: {lastUpdated}</p>
                </div>

                {/* Policy Card */}
                <div className="bg-white/5 border border-white/10 p-4 sm:p-6 md:p-12 rounded-sm relative overflow-hidden">

                    {/* Corner decorators */}
                    <div className="absolute top-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute top-2 right-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute bottom-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute bottom-2 right-2 text-[8px] text-white/20 font-mono">+</div>

                    <div className="space-y-12 text-base leading-relaxed">

                        {/* 1. Introduction */}
                        <section>
                            <SectionHeading number={1} title="Introduction" />
                            <p className="mb-3">
                                TASKTIME (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;), a company based in Maharashtra, India, provides an AI-based task and schedule management software-as-a-service platform (&quot;Service&quot;) through our website and related applications.
                            </p>
                            <p>
                                By creating an Account or using the Service, you acknowledge that we will process your Personal Data in accordance with this Privacy Policy and applicable law, including the Digital Personal Data Protection Act, 2023 of India (&quot;DPDP Act&quot;) and, where applicable, the EU General Data Protection Regulation (&quot;GDPR&quot;).
                            </p>
                        </section>

                        <Divider />

                        {/* 2. Definitions */}
                        <section>
                            <SectionHeading number={2} title="Definitions" />
                            <p className="mb-4">For the purposes of this Privacy Policy:</p>
                            <BulletList items={[
                                "Personal Data means any data about an individual who is identifiable by or in relation to such data, as defined under the DPDP Act and comparable data protection laws.",
                                "Service means the TASKTIME web application, APIs, and any related services that we operate.",
                                "Account means a unique account created for you to access and use the Service.",
                                "User means any individual or organization using the Service.",
                                "Processing means any operation or set of operations performed on Personal Data, such as collection, recording, storage, use, disclosure, or deletion.",
                                "Service Provider means a third-party company or individual that processes Personal Data on our behalf for the purposes of providing the Service.",
                                "Data Fiduciary / Controller means the entity that determines the purposes and means of Processing Personal Data (TASKTIME for data of its direct users).",
                                "Data Processor means an entity that processes Personal Data on behalf of the Data Fiduciary / Controller (for example, our hosting, database, analytics, and AI providers).",
                            ]} />
                        </section>

                        <Divider />

                        {/* 3. Information We Collect */}
                        <section>
                            <SectionHeading number={3} title="Information We Collect" />

                            <SubHeading title="3.1 Personal Information" />
                            <p className="mb-4">We may collect and process the following Personal Data when you create or use an Account:</p>
                            <BulletList items={[
                                "Name (first and last name, if provided by you).",
                                "Email address (required to register and authenticate your Account).",
                                "Hashed password or authentication credentials (we store passwords only in hashed form using industry-standard methods and never in plain text).",
                                "Profile and workspace information you choose to provide (such as time zone and preferences).",
                            ]} />

                            <SubHeading title="3.2 User Content" />
                            <p className="mb-4">In the normal course of using the Service, we process the content you submit:</p>
                            <BulletList items={[
                                "Tasks, to-do items, notes, and descriptions.",
                                "Schedules, events, reminders, deadlines, and related metadata (such as due dates and labels).",
                                "AI prompts and instructions you provide to generate suggestions, schedules, or other AI-powered outputs.",
                                "Feedback you provide inside the product (for example, ratings, comments, or bug reports).",
                                "Uploaded content, if you choose to upload attachments or documents as part of your tasks or schedules.",
                            ]} />

                            <SubHeading title="3.3 Usage Data" />
                            <p className="mb-4">When you access or use the Service, we automatically collect certain technical information (&quot;Usage Data&quot;) such as:</p>
                            <BulletList items={[
                                "IP address.",
                                "Browser type and version.",
                                "Device identifiers, device type, operating system, and language settings.",
                                "Pages or screens viewed, the time and date of your visits, time spent on pages, and navigation paths.",
                                "Log files, error logs, and performance diagnostics.",
                                "Interaction events (such as button clicks, features used, and configuration changes) for analytics and product improvement.",
                            ]} />

                            <SubHeading title="3.4 Cookies and Similar Technologies" />
                            <p className="mb-3">
                                We use cookies and similar technologies to operate and improve the Service. A cookie is a small text file stored on your device. You can control cookies through your browser settings; however, disabling certain cookies may limit the functionality of the Service.
                            </p>
                            <p className="mb-4">We use the following categories of cookies:</p>
                            <BulletList items={[
                                "Essential cookies: Required for the Service to function (for example, to keep you signed in and secure your session). These cookies are necessary and cannot be disabled through our interface.",
                                "Functional cookies: Help us remember your choices (such as language or time zone) to provide a more convenient experience.",
                                "Analytics cookies: Help us understand how the Service is used, measure performance, and improve features. We use such cookies only where permitted by applicable law, and where required we rely on your consent for non-essential cookies.",
                            ]} />
                        </section>

                        <Divider />

                        {/* 4. How We Use Information */}
                        <section>
                            <SectionHeading number={4} title="How We Use Information" />
                            <p className="mb-4">We process Personal Data for the following purposes:</p>
                            <BulletList items={[
                                "To provide, operate, and maintain the Service, including core features such as task management, scheduling, and AI-powered suggestions.",
                                "To create and manage your Account, authenticate you, and maintain your user preferences.",
                                "To process and display your tasks, schedules, user content, and AI-generated outputs within the Service.",
                                "To provide customer support, respond to inquiries, and resolve technical issues.",
                                "To manage billing and payments (for example, via third-party payment processors), issue invoices, and handle subscription status.",
                                "To monitor and protect the security, integrity, and availability of the Service, including fraud detection, abuse prevention, and incident response.",
                                "To analyze Usage Data and improve the performance, usability, and quality of the Service, including the reliability, safety, and performance of our AI features.",
                                "To comply with applicable legal obligations and to establish, exercise, or defend legal claims.",
                            ]} />
                        </section>

                        <Divider />

                        {/* 5. AI Processing */}
                        <section>
                            <SectionHeading number={5} title="AI Processing" />
                            <p className="mb-4">
                                The Service offers AI-based functionality to assist with tasks, schedules, and related recommendations. When you use these features, we process your prompts, tasks, schedules, and related context (&quot;AI Inputs&quot;) and AI-generated responses (&quot;AI Outputs&quot;) to deliver the requested functionality.
                            </p>
                            <BulletList items={[
                                "AI features may be powered by third-party AI Service Providers (such as OpenAI or similar providers) acting as Data Processors on our behalf.",
                                "AI Inputs and Outputs may be transmitted to those providers solely for the purpose of providing the Service and improving the reliability, safety, and performance of our AI features.",
                                "We do not use your AI Inputs or Outputs to train publicly available AI models. Where we rely on a third-party AI provider, we configure the service so that your data is not used to train or improve their general models, to the extent the provider offers such controls.",
                                "AI logs (including prompts and outputs) may be stored for a limited period to enable you to view past interactions, troubleshoot issues, and improve the reliability and safety of our AI features. We implement access controls to ensure that only authorized personnel can access AI logs for troubleshooting and security purposes.",
                                "AI Outputs are generated algorithmically and may contain inaccuracies. Users are responsible for reviewing AI-generated recommendations before relying on them.",
                                "We do not use AI features to make automated decisions that produce legal or similarly significant effects without human involvement. Our AI features are designed to assist and augment user decision-making, not replace it. This approach is consistent with our obligations under GDPR Article 22 and applicable law.",
                                "AI processing may occur on servers located outside your country, subject to appropriate safeguards described in the \"International Transfers\" section.",
                            ]} />
                        </section>

                        <Divider />

                        {/* 6. Legal Basis for Processing */}
                        <section>
                            <SectionHeading number={6} title="Legal Basis for Processing" />

                            <SubHeading title="6.1 GDPR (Where Applicable)" />
                            <p className="mb-4">Where the GDPR applies, we process Personal Data under the following legal bases:</p>
                            <BulletList items={[
                                "Performance of a contract: To provide and operate the Service, manage your Account, and fulfill our contractual obligations to you.",
                                "Legitimate interests: To secure and improve the Service, prevent fraud and misuse, understand how the Service is used, and develop new features, provided that these interests are not overridden by your rights and interests.",
                                "Consent: For certain activities such as non-essential cookies, optional communications, or specific AI/analytics features where consent is required by law. You may withdraw consent at any time without affecting the lawfulness of processing prior to withdrawal.",
                                "Legal obligation: To comply with applicable laws, regulations, and legal processes, including bookkeeping, tax, and regulatory requirements.",
                            ]} />

                            <SubHeading title="6.2 DPDP Act (India)" />
                            <p>
                                Under the Digital Personal Data Protection Act, 2023, we process Personal Data based on your consent, for legitimate uses permitted by law, and to fulfill contractual and legal obligations. By using the Service, you provide your consent to such processing as described in this Privacy Policy. You may withdraw consent at any time, subject to legal and contractual limitations.
                            </p>
                        </section>

                        <Divider />

                        {/* 7. Sharing of Information */}
                        <section>
                            <SectionHeading number={7} title="Sharing of Information" />
                            <p className="mb-4">
                                We do not sell, rent, or trade Personal Data to third parties for monetary consideration. We may share Personal Data with the following categories of recipients, strictly for the purposes described in this Privacy Policy:
                            </p>
                            <BulletList items={[
                                "Cloud hosting providers: To host our infrastructure and store data securely (for example, reputable cloud platforms such as Vercel, AWS, or similar providers).",
                                "Database and storage providers: To store and back up application and user data in managed databases and secure storage services.",
                                "AI providers: To deliver AI-powered features using third-party APIs that process AI Inputs and Outputs as our Data Processors.",
                                "Payment processors: To process subscription payments and handle related billing operations (for example, providers such as Razorpay, Stripe, or equivalent services). Payment card details are processed directly by the payment processor and are not stored by us.",
                                "Analytics providers: To collect Usage Data and measure how the Service is used, enabling us to improve performance and features using privacy-conscious analytics tools where possible.",
                                "Email and communication providers: To send account-related emails, security alerts, and customer support communications.",
                                "Professional advisors: Such as lawyers, accountants, and auditors, when necessary to obtain professional services and comply with legal obligations.",
                                "Legal authorities and regulators: Where required by law or to protect our rights, users, or the public, we may disclose information to courts, law enforcement, or government authorities.",
                                "Business transfers: In connection with any merger, acquisition, reorganization, or sale of assets, Personal Data may be transferred to a successor entity, subject to appropriate safeguards and continuity of privacy protections.",
                            ]} />
                            <p className="mt-4">
                                We use written agreements with our Service Providers that require them to process Personal Data only according to our instructions, implement appropriate security measures, and not use the data for their own purposes. A list of our current subprocessors may be made available upon reasonable request.
                            </p>
                            <p className="mt-3">
                                We do not use Personal Data for profiling or targeted advertising purposes unrelated to the core functionality of the Service.
                            </p>
                        </section>

                        <Divider />

                        {/* 8. Data Retention */}
                        <section>
                            <SectionHeading number={8} title="Data Retention" />
                            <p className="mb-4">
                                We retain Personal Data only for as long as necessary for the purposes described in this Privacy Policy, to comply with legal obligations, and to resolve disputes. Where feasible, we apply shorter retention periods and use aggregation or anonymization when detailed data is no longer needed.
                            </p>
                            <BulletList items={[
                                "Account data (such as name, email, and account configuration) is retained for the duration of your Account and for up to 24 months after account closure to handle support requests, billing questions, or disputes, unless a longer period is required by law.",
                                "User content (tasks, schedules, and AI interaction history) is retained while your Account is active and may be deleted or anonymized within up to 12 months after account closure, subject to backup retention.",
                                "AI logs (prompts and outputs) used for reliability, abuse monitoring, and troubleshooting are typically retained for up to 12 months, after which they are deleted or anonymized unless needed for security or legal reasons.",
                                "Customer support data (support tickets, emails, and related records) is retained for up to 24 months from the date of the last interaction, unless required longer for legal or compliance purposes.",
                                "Usage and analytics data is retained for up to 24 months from collection in identifiable form, and may thereafter be kept only in aggregated or anonymized form.",
                                "Backup copies containing Personal Data may be retained in encrypted form for a limited period consistent with our backup and disaster recovery policies and are accessed only when strictly necessary.",
                            ]} />
                            <p className="mt-4">Once retention periods expire, we delete or irreversibly anonymize Personal Data using commercially reasonable measures, subject to technical limitations and legal requirements.</p>

                            <SubHeading title="8.1 Data Retention After Subscription Expiry" />
                            <p>
                                If your subscription expires or is cancelled, your access to certain features of the Service may be restricted. We may retain your data for a limited grace period following expiry to allow for reactivation of your Account. After the grace period, data may be deleted or anonymized in accordance with the retention periods described above. We recommend that you export any data you wish to retain before cancelling your subscription or allowing it to expire.
                            </p>
                        </section>

                        <Divider />

                        {/* 9. International Transfers */}
                        <section>
                            <SectionHeading number={9} title="International Transfers" />
                            <p className="mb-3">
                                We are based in India and may process Personal Data on servers located in India or other countries. This means your information may be transferred to and stored in jurisdictions with data protection laws that differ from those in your home jurisdiction.
                            </p>
                            <p>
                                Where required by applicable law, we implement appropriate safeguards for international data transfers, such as Standard Contractual Clauses (SCCs) or other legally recognized transfer mechanisms, contractual protections, and technical measures, to ensure that Personal Data receives a level of protection that is comparable to that required under the DPDP Act and, where applicable, the GDPR.
                            </p>
                        </section>

                        <Divider />

                        {/* 10. Your Rights */}
                        <section>
                            <SectionHeading number={10} title="Your Rights" />
                            <p className="mb-4">Subject to applicable law, you may have the following rights with respect to your Personal Data:</p>
                            <BulletList items={[
                                "Right of access: To obtain confirmation of whether we process your Personal Data and to request a copy of such data.",
                                "Right to correction: To request that inaccurate or incomplete Personal Data be corrected or updated.",
                                "Right to deletion: To request deletion of your Personal Data in certain circumstances, for example where it is no longer necessary for the purposes for which it was collected.",
                                "Right to data portability: Where technically feasible and required by law, to receive certain Personal Data in a structured, commonly used, and machine-readable format and to transmit it to another service.",
                                "Right to withdraw consent: Where we rely on consent, you may withdraw it at any time without affecting the lawfulness of processing before withdrawal.",
                                "Right to object or restrict: To object to or request restriction of certain processing activities, especially where processing is based on legitimate interests, subject to applicable legal requirements.",
                            ]} />
                            <p className="mt-4">
                                To exercise your rights or make a data protection request, you may contact us at privacy@tasktime.in. We may need to verify your identity before acting on your request and may decline requests where permitted or required by law. If you are located in the European Union, you also have the right to lodge a complaint with your local supervisory authority at any time.
                            </p>
                        </section>

                        <Divider />

                        {/* 11. Data Security */}
                        <section>
                            <SectionHeading number={11} title="Data Security" />
                            <p className="mb-3">
                                We use commercially reasonable technical and organizational safeguards to protect Personal Data, including the use of HTTPS to encrypt data in transit, encryption of data at rest where appropriate, access controls based on least privilege, monitoring of our systems for security incidents, and secure authentication mechanisms for Account access.
                            </p>
                            <p>
                                Despite our efforts, no method of transmission over the internet or method of electronic storage is entirely risk-free. While we strive to protect Personal Data, we cannot guarantee absolute security. Where required by applicable law, we will notify relevant supervisory authorities and affected individuals as described in Section 19.
                            </p>
                        </section>

                        <Divider />

                        {/* 12. Children's Privacy */}
                        <section>
                            <SectionHeading number={12} title="Children's Privacy" />
                            <p>
                                The Service is not intended for and should not be used by individuals under the age of 18. We do not knowingly collect Personal Data from persons under 18. If you are a parent or guardian and believe that a child has provided Personal Data to us, please contact us so that we can take appropriate steps to delete such information as required by law.
                            </p>
                        </section>

                        <Divider />

                        {/* 13. Changes to This Privacy Policy */}
                        <section>
                            <SectionHeading number={13} title="Changes to This Privacy Policy" />
                            <p className="mb-3">
                                We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make changes, we will revise the &quot;Last updated&quot; date at the top of this page and, where required by law, we will notify you by appropriate means (for example, via email or an in-service notice) before the changes become effective.
                            </p>
                            <p>
                                Your continued use of the Service after the effective date of the updated Privacy Policy will constitute your acknowledgment of the changes and your agreement to the updated Policy.
                            </p>
                        </section>

                        <Divider />

                        {/* 14. Contact Information */}
                        <section>
                            <SectionHeading number={14} title="Contact Information" />
                            <p className="mb-4">
                                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-sm p-6 space-y-2 font-mono text-sm">
                                <p><span className="text-gray-500">General inquiries:</span> <span className="text-cyan-400">contact@tasktime.in</span></p>
                                <p><span className="text-gray-500">Data Protection Officer:</span> <span className="text-cyan-400">privacy@tasktime.in</span></p>
                                <p><span className="text-gray-500">Website:</span> <span className="text-cyan-400">https://tasktime.in</span></p>
                            </div>
                            <p className="mt-4">For all privacy-related enquiries, please contact our Data Protection Officer at privacy@tasktime.in.</p>

                            <SubHeading title="14.1 Grievance Officer (India)" />
                            <p className="mb-3">
                                In accordance with the Digital Personal Data Protection Act, 2023, users in India may contact our Grievance Officer for any complaints or concerns regarding the processing of Personal Data:
                            </p>
                            <BulletList items={[
                                "Name: Grievance Officer – TASKTIME",
                                "Email: grievance@tasktime.in",
                            ]} />
                            <p className="mt-3">
                                We aim to acknowledge and respond to grievances within 30 days of receipt. If you are not satisfied with our response, you may have the right to lodge a complaint with the relevant data protection authority under the DPDP Act.
                            </p>
                            <p className="mt-3">
                                If you are located in a jurisdiction that provides you with the right to lodge a complaint with a data protection authority or the equivalent regulator, you may also have the right to do so if you are dissatisfied with our response.
                            </p>
                        </section>

                        <Divider />

                        {/* 15. Additional Rights for US Residents (CCPA and State Privacy Laws) */}
                        <section>
                            <SectionHeading number={15} title="Additional Rights for US Residents (CCPA and State Privacy Laws)" />
                            <p className="mb-4">
                                If you are a resident of certain U.S. states (including California), you may have additional rights under applicable privacy laws, such as the California Consumer Privacy Act (&quot;CCPA&quot;) and other state privacy statutes. These rights may include:
                            </p>
                            <BulletList items={[
                                "The right to know what personal information we collect, use, disclose, and share.",
                                "The right to request deletion of your personal information, subject to certain exceptions.",
                                "The right to opt-out of certain data sharing practices.",
                                "The right to correct inaccurate personal information we hold about you.",
                                "The right to data portability, where applicable.",
                            ]} />
                            <p className="mt-4">
                                TASKTIME does not sell personal information for monetary consideration. We do not sell or share personal information for cross-context behavioral advertising as defined under applicable U.S. state privacy laws. We will not discriminate against you for exercising any of your privacy rights. To submit a request or enquiry regarding your US state privacy rights, please contact us at privacy@tasktime.in.
                            </p>
                        </section>

                        <Divider />

                        {/* 16. EU Representative (GDPR Article 27) */}
                        <section>
                            <SectionHeading number={16} title="EU Representative (GDPR Article 27)" />
                            <p className="mb-3">
                                TASKTIME is based in India. Where required under Article 27 of the GDPR — that is, where we offer services to individuals in the European Union on a non-occasional basis — we will designate a representative in the European Union to act on our behalf in relation to our obligations under the GDPR.
                            </p>
                            <p>
                                If an EU Representative has been designated, their contact details will be made available upon request and published in an updated version of this Privacy Policy. In the meantime, EU residents may direct GDPR-related enquiries to our Data Protection Officer at privacy@tasktime.in.
                            </p>
                        </section>

                        <Divider />

                        {/* 17. Business and Organization Accounts */}
                        <section>
                            <SectionHeading number={17} title="Business and Organization Accounts" />
                            <p className="mb-3">
                                If you access or use the Service through an organization, such as your employer, educational institution, or another business entity, that organization may act as the Data Controller (or Data Fiduciary under the DPDP Act) for certain Personal Data processed in connection with your use of the Service. In such cases, TASKTIME may act as a Data Processor on behalf of that organization, processing Personal Data only according to its instructions and applicable agreements.
                            </p>
                            <p>
                                If you have questions about how your organization uses your data within the Service, please contact your organization&apos;s administrator. TASKTIME&apos; obligations as a Data Processor in such arrangements are governed by a Data Processing Addendum or equivalent agreement with the relevant organization.
                            </p>
                        </section>

                        <Divider />

                        {/* 18. Law Enforcement and Government Requests */}
                        <section>
                            <SectionHeading number={18} title="Law Enforcement and Government Requests" />
                            <p>
                                We carefully review all government and law enforcement requests for Personal Data. We only disclose Personal Data in response to such requests where we are legally required to do so and where the request is proportionate to the legitimate aim pursued. Where permitted by law, we will notify affected users of such requests before complying. We do not provide bulk or indiscriminate access to Personal Data to any government or law enforcement agency.
                            </p>
                        </section>

                        <Divider />

                        {/* 19. Data Breach Notification */}
                        <section>
                            <SectionHeading number={19} title="Data Breach Notification" />
                            <p className="mb-3">
                                In the event that we become aware of a personal data breach that is likely to result in a risk to the rights and freedoms of individuals, we will take prompt remediation steps. Where required by applicable law — including the GDPR — we will notify the relevant supervisory authority within the legally required timeframe (such as 72 hours) after becoming aware of a qualifying breach. Where the breach is likely to result in a high risk to affected individuals, we will also notify those individuals without undue delay, in accordance with applicable law.
                            </p>
                            <p>
                                Notifications will include, to the extent practicable: a description of the nature of the breach, the categories and approximate number of individuals and records affected, the likely consequences of the breach, and the measures taken or proposed to address the breach.
                            </p>
                        </section>

                        <Divider />

                        {/* Contact CTA */}
                        <section>
                            <p className="text-sm text-gray-500 mb-4 font-mono">
                                For all privacy-related enquiries, please contact:
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a href="mailto:privacy@tasktime.in">
                                    <Button variant="scanline" size="md">
                                        privacy@tasktime.in
                                    </Button>
                                </a>
                                <a href="mailto:grievance@tasktime.in">
                                    <Button variant="scanline" size="md">
                                        grievance@tasktime.in
                                    </Button>
                                </a>
                                <a href="mailto:contact@tasktime.in">
                                    <Button variant="scanline" size="md">
                                        contact@tasktime.in
                                    </Button>
                                </a>
                            </div>
                        </section>

                    </div>
                </div>

                {/* Footer note */}
                <p className="text-xs text-gray-600 font-mono mt-8 text-center">
                    TASKTIME · Maharashtra, India · tasktime.in
                </p>

            </div>
        </div>
    );
}