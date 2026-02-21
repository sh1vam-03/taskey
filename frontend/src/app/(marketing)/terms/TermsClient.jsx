"use client";
import React, { useState, useEffect } from "react";
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

function InfoBlock({ children }) {
    return (
        <div className="bg-white/5 border-l-2 border-cyan-500 p-4 rounded-r-md my-4">
            <p className="text-sm text-cyan-200">{children}</p>
        </div>
    );
}

function WarningBlock({ children }) {
    return (
        <div className="bg-red-500/10 border-l-2 border-red-500 p-4 rounded-r-md my-4">
            <p className="text-sm text-red-200">{children}</p>
        </div>
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

export default function TermsClient() {
    const lastUpdated = "February 21, 2026";

    const [orbSize, setOrbSize] = useState(1000);

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            let newSize = Math.min(1000, Math.max(600, width * 0.6));
            if (height < 800) newSize = Math.min(newSize, 700);
            setOrbSize(newSize);
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return (
        <div className="min-h-[100dvh] bg-black text-gray-300 -mt-20 pt-[calc(var(--section-spacing)*1.5)] pb-[var(--section-spacing)] px-[var(--container-padding)] overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">

            {/* GLOBAL BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
                {/* RESPONSIVE AiEnergySphere */}
            </div>

            <div className="w-full max-w-3xl mx-auto relative z-10">

                {/* Header */}
                <div className="mb-16 border-b border-white/10 pb-8">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter">Terms of Service</h1>
                    <p className="text-sm font-mono text-gray-500">LAST UPDATED: {lastUpdated}</p>
                    <p className="text-sm font-mono text-gray-600 mt-1">TASKTIME · Maharashtra, India</p>
                </div>

                {/* Terms Card */}
                <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-sm relative overflow-hidden">

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
                                These Terms and Conditions (&quot;Terms&quot;, &quot;Agreement&quot;) constitute a legally binding contract between TASKTIME, a company incorporated and operating under the laws of Maharashtra, India (&quot;TASKTIME&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), and the individual user or entity accessing or using the TASKTIME platform (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;).
                            </p>
                            <p className="mb-3">
                                By creating an account, subscribing to any plan, or otherwise accessing or using the TASKTIME platform, its features, application programming interfaces, or related services (collectively, the &quot;Service&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference. If you do not agree to these Terms, you must immediately cease use of the Service.
                            </p>
                            <p>
                                These Terms apply to all users of the Service, including individuals, teams, and organizations, located anywhere in the world.
                            </p>
                        </section>

                        <Divider />

                        {/* 2. Eligibility */}
                        <section>
                            <SectionHeading number={2} title="Eligibility" />
                            <p className="mb-4">To access or use the Service, you must satisfy all of the following eligibility requirements:</p>
                            <BulletList items={[
                                "You must be at least eighteen (18) years of age. By using the Service, you represent and warrant that you are at least 18 years old.",
                                "If you are using the Service on behalf of an organization, company, or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms, in which case \"you\" and \"your\" shall refer to that entity.",
                                "You must not be barred from using the Service under the laws of any applicable jurisdiction, including the laws of India.",
                                "You must not be a person or entity subject to applicable international sanctions or export control restrictions.",
                            ]} />
                            <p className="mt-4">
                                TASKTIME reserves the right to verify eligibility and to refuse access to the Service to any person or entity at its sole discretion.
                            </p>
                            <SubHeading title="2.2 Export Controls & Sanctions Compliance" />
                            <p>
                                You may not access or use the Service in violation of any applicable export control laws, trade sanctions, or trade embargoes, including those administered or enforced by the Government of India, the United States Office of Foreign Assets Control (OFAC), the European Union, or any other applicable governmental authority. By using the Service, you represent and warrant that (a) you are not located in a country or territory subject to a comprehensive trade embargo; (b) you are not listed on any applicable list of prohibited or restricted parties; and (c) your use of the Service will not result in a violation of any applicable export control or sanctions law. TASKTIME reserves the right to restrict or terminate access for any User or region to comply with such obligations.
                            </p>
                        </section>

                        <Divider />

                        {/* 3. Account Registration */}
                        <section>
                            <SectionHeading number={3} title="Account Registration" />
                            <p className="mb-4">Access to certain features of the Service requires the creation of an account. By registering, you agree to the following:</p>
                            <BulletList items={[
                                "You will provide accurate, current, and complete information during the registration process and keep such information updated at all times.",
                                "You are solely responsible for maintaining the confidentiality of your account credentials, including your password.",
                                "You are solely responsible for all activities that occur under your account, whether or not authorized by you.",
                                "You will promptly notify TASKTIME of any unauthorized access to or use of your account by contacting us at legal@tasktime.in.",
                                "You may not create an account using another person's identity, use automated systems to create accounts in bulk, or use the account for any purpose other than that permitted under these Terms.",
                            ]} />
                            <p className="mt-4">
                                TASKTIME is not liable for any loss or damage arising from your failure to maintain the security of your account credentials. We reserve the right to suspend or terminate accounts that contain inaccurate information or that have been created through fraudulent means.
                            </p>
                        </section>

                        <Divider />

                        {/* 4. Subscription Plans & Billing */}
                        <section>
                            <SectionHeading number={4} title="Subscription Plans & Billing" />

                            <SubHeading title="4.1 Subscription Plans" />
                            <p>
                                TASKTIME offers various subscription plans, the details of which are available at tasktime.in/pricing. Plans may vary in features, usage limits, AI credit allocations, and pricing. TASKTIME reserves the right to modify, introduce, or discontinue subscription plans at any time, subject to notice to existing subscribers.
                            </p>

                            <SubHeading title="4.2 Fees & Payment" />
                            <p className="mb-3">
                                All subscription fees are payable in advance. Monthly plans are billed once per calendar month. Annual plans are billed upfront as a lump sum covering the full twelve (12)-month subscription period; by selecting an annual plan, you acknowledge that the entire annual fee is due immediately and is non-refundable in accordance with Section 13 (Refund Policy). You authorize TASKTIME or its authorized payment processors to charge your designated payment method for all applicable fees. All charges are in the currency specified at checkout and are inclusive of applicable taxes unless stated otherwise.
                            </p>
                            <p>
                                You represent that you are authorized to use the payment method you provide. TASKTIME is not responsible for charges imposed by your financial institution, including overdraft or currency conversion fees.
                            </p>

                            <SubHeading title="4.3 Auto-Renewal" />
                            <p>
                                All subscriptions automatically renew at the end of each billing cycle at the then-current rate, unless cancelled prior to the renewal date. By subscribing, you expressly authorize TASKTIME to charge your payment method for each renewal period without further action on your part. Cancellation after a renewal charge has been processed will not entitle you to a refund for that billing period.
                            </p>

                            <SubHeading title="4.4 Cancellation" />
                            <p>
                                You may cancel your subscription at any time through your account settings or by contacting support@tasktime.in. Cancellation takes effect at the end of the current billing cycle. Upon cancellation, you retain access until the end of the paid period, after which your subscription and associated features will be deactivated. Cancellation does not entitle you to any refund of fees already paid for the current billing cycle.
                            </p>

                            <SubHeading title="4.5 Price Changes" />
                            <p>
                                TASKTIME reserves the right to modify subscription pricing at any time. We will provide at least thirty (30) days&apos; advance notice of any price changes to existing subscribers via email or through the platform. Continued use of the Service following the effective date of a price change constitutes your acceptance of the new pricing.
                            </p>
                        </section>

                        <Divider />

                        {/* 5. AI Credits & Usage */}
                        <section>
                            <SectionHeading number={5} title="AI Credits & Usage" />

                            <SubHeading title="5.1 Nature of Credits" />
                            <p>
                                Certain features of the Service are powered by artificial intelligence and are accessible through an AI credit system. Credits are a unit of account used solely to access AI-powered features within the Service. Credits have no monetary value, are not redeemable for cash or any other consideration, and do not constitute property of any kind.
                            </p>

                            <SubHeading title="5.2 Subscription Credits" />
                            <p>
                                Subscription credits are allocated to your account at the commencement of each billing cycle in accordance with your subscription plan. Subscription credits expire at the end of each billing cycle and do not roll over. Unused subscription credits at the time of expiry are forfeited without compensation.
                            </p>

                            <SubHeading title="5.3 Top-Up Credits" />
                            <p>
                                Users may purchase additional credits (&quot;Top-Up Credits&quot;) outside of their subscription allocation. Top-Up Credits expire between six (6) and twelve (12) months from the date of purchase, as specified at the time of purchase. Unused Top-Up Credits that expire are forfeited without compensation.
                            </p>

                            <SubHeading title="5.4 Non-Transferability" />
                            <p>
                                Credits are personal to the account to which they are allocated. Credits may not be transferred, sold, gifted, or otherwise assigned to any other user or account. Any attempt to transfer credits is void and may result in account suspension.
                            </p>

                            <SubHeading title="5.5 Non-Refundability" />
                            <p>
                                All credits are non-refundable once allocated or purchased, regardless of whether they have been used, partially used, or remain unused at the time of cancellation or account termination. Please refer to Section 13 (Refund Policy) for further details.
                            </p>

                            <SubHeading title="5.6 Usage Limits & Fair Use" />
                            <p>
                                TASKTIME may impose usage limits on AI credit consumption to ensure service quality and platform integrity. Users who attempt to circumvent usage limits, engage in excessive automated usage, or otherwise abuse the credit system may have their accounts suspended or terminated without refund.
                            </p>
                        </section>

                        <Divider />

                        {/* 6. Acceptable Use Policy */}
                        <section>
                            <SectionHeading number={6} title="Acceptable Use Policy" />
                            <p className="mb-4">
                                By accessing or using the Service, you agree to use it only for lawful purposes and in a manner consistent with these Terms. The following conduct is strictly prohibited:
                            </p>

                            <SubHeading title="6.1 Prohibited Activities" />
                            <BulletList items={[
                                "Resale or Unauthorized Distribution: You may not resell, sublicense, distribute, or otherwise make the Service available to any third party for commercial gain without TASKTIME's prior written consent.",
                                "Automated Access & Scraping: You may not use automated tools, bots, crawlers, scrapers, or similar mechanisms to access, index, or extract data from the Service, except where expressly permitted through TASKTIME's API.",
                                "System Abuse: You may not engage in any activity that imposes an unreasonable or disproportionate load on TASKTIME's infrastructure, or that interferes with the proper functioning of the Service or any systems connected to it.",
                                "Reverse Engineering: You may not attempt to reverse engineer, decompile, disassemble, or otherwise derive the source code, underlying algorithms, or structure of any part of the Service or platform.",
                                "Malicious Use: You may not use the Service to transmit malware, viruses, or other harmful code, or to conduct phishing, fraud, or any other unlawful or deceptive activity.",
                                "Unlawful Use: You may not use the Service to violate any applicable local, national, or international law or regulation, including data protection laws, intellectual property laws, consumer protection laws, or anti-spam legislation.",
                                "Harassment & Abuse: You may not use the Service to harass, defame, threaten, or harm any individual or group.",
                                "Unauthorized Access: You may not attempt to gain unauthorized access to any account, server, system, or network connected to the Service.",
                            ]} />

                            <SubHeading title="6.2 Monitoring & Enforcement" />
                            <p>
                                TASKTIME reserves the right to monitor usage patterns, implement rate limiting, and take any technical or administrative measures necessary to prevent abuse of the Service. This includes the right to suspend or permanently terminate access to any account that, in TASKTIME&apos;s reasonable judgment, violates this Acceptable Use Policy or any other provision of these Terms. TASKTIME&apos;s exercise or non-exercise of monitoring rights shall not constitute a waiver of any right or create any obligation to monitor or take any particular enforcement action.
                            </p>
                        </section>

                        <Divider />

                        {/* 7. AI Output Disclaimer */}
                        <section>
                            <SectionHeading number={7} title="AI Output Disclaimer" />
                            <WarningBlock>
                                <strong>Critical Warning:</strong> TASKTIME is a probabilistic system, not a deterministic one. AI Outputs are generated algorithmically and may be inaccurate, incomplete, or misleading. Never rely solely on AI Outputs for professional, legal, medical, or financial decisions.
                            </WarningBlock>

                            <SubHeading title="7.1 Nature of AI Outputs" />
                            <p className="mb-3">
                                The Service incorporates artificial intelligence and machine learning technologies that generate text, recommendations, analysis, summaries, and other content (&quot;AI Outputs&quot;). AI Outputs are produced algorithmically based on the inputs you provide and other available data. The generation of AI Outputs does not involve human review or verification by TASKTIME unless expressly stated.
                            </p>

                            <SubHeading title="7.2 No Guarantee of Accuracy" />
                            <p className="mb-3">
                                TASKTIME makes no representation or warranty, express or implied, as to the accuracy, completeness, reliability, timeliness, fitness for purpose, or truthfulness of any AI Output. AI Outputs may be inaccurate, incomplete, misleading, outdated, or otherwise unsuitable for your purposes. Users acknowledge that AI technology has inherent limitations and may produce incorrect or unexpected results.
                            </p>

                            <SubHeading title="7.3 Not Professional Advice" />
                            <p className="mb-3">
                                AI Outputs generated by the Service do not constitute, and must not be construed as, legal advice, medical advice, financial advice, accounting advice, investment advice, psychological counselling, or any other form of professional advice. TASKTIME is not a licensed legal, medical, financial, or professional services provider. Users should not act or refrain from acting solely on the basis of AI Outputs without independently verifying the information and, where appropriate, consulting a qualified professional in the relevant field.
                            </p>

                            <SubHeading title="7.4 User Responsibility" />
                            <p className="mb-3">
                                You are solely and exclusively responsible for all decisions you make and actions you take based on or in reliance upon AI Outputs. TASKTIME shall not be liable for any loss, damage, harm, or consequence arising directly or indirectly from your reliance on AI Outputs.
                            </p>

                            <SubHeading title="7.5 Independent Verification" />
                            <p className="mb-3">
                                TASKTIME strongly recommends that all AI Outputs be independently verified by the User prior to use in any decision-making context, particularly in professional, commercial, legal, medical, or financial matters.
                            </p>

                            <SubHeading title="7.6 No Automated Decision-Making with Legal Effect" />
                            <p>
                                The TASKTIME platform does not make automated decisions that produce legal or similarly significant effects on users without meaningful human involvement. All substantive decisions affecting Users&apos; rights or obligations are subject to human review or user confirmation.
                            </p>
                        </section>

                        <Divider />

                        {/* 8. Beta Features */}
                        <section>
                            <SectionHeading number={8} title="Beta Features & Experimental Functionality" />
                            <div className="inline-flex items-center gap-2 border border-amber-400/30 bg-amber-400/10 px-3 py-1 rounded-full mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-amber-400 text-xs font-mono font-bold tracking-widest">EXPERIMENTAL</span>
                            </div>

                            <SubHeading title="8.1 Designation of Beta Features" />
                            <p className="mb-3">
                                TASKTIME may, from time to time, make available certain features, tools, or functionalities designated as &quot;beta&quot;, &quot;preview&quot;, &quot;experimental&quot;, &quot;early access&quot;, or by similar terminology (collectively, &quot;Beta Features&quot;). Beta Features are offered at TASKTIME&apos;s sole discretion for evaluation and testing purposes only.
                            </p>

                            <SubHeading title="8.2 No Warranties for Beta Features" />
                            <p className="mb-3">
                                Beta Features are provided strictly on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranty of any kind, express or implied. TASKTIME makes no representation that Beta Features will function without interruption or error, meet any performance standard, produce accurate outputs, or be fit for any particular purpose. Users who access Beta Features do so entirely at their own risk.
                            </p>

                            <SubHeading title="8.3 Modification and Discontinuation" />
                            <p className="mb-3">
                                TASKTIME reserves the right, at its absolute discretion and without prior notice or liability, to modify, suspend, limit, or permanently discontinue any Beta Feature at any time. Beta Features may be altered in material ways or removed entirely, including the deletion of any associated data, without compensation or recourse to the User.
                            </p>

                            <SubHeading title="8.4 No Reliance" />
                            <p className="mb-3">
                                Users must not rely on Beta Features for production, mission-critical, or legally consequential purposes. TASKTIME strongly recommends that Beta Features be used only in non-critical environments and that User Content processed through Beta Features be independently backed up. Inclusion of a feature as a Beta Feature does not constitute a commitment by TASKTIME to develop, stabilize, or release that feature in any final or permanent form.
                            </p>

                            <SubHeading title="8.5 Feedback on Beta Features" />
                            <p>
                                TASKTIME may invite Users to provide feedback on Beta Features. Any such feedback shall be governed by Section 10.4 (Feedback) of these Terms. Participation in beta testing does not entitle Users to any compensation, additional credits, or continued access to the relevant Beta Feature.
                            </p>
                        </section>

                        <Divider />

                        {/* 9. Third-Party Services */}
                        <section>
                            <SectionHeading number={9} title="Third-Party Services" />
                            <p className="mb-3">
                                The Service may integrate with, link to, or depend upon third-party services, platforms, APIs, or data sources (&quot;Third-Party Services&quot;). TASKTIME does not own, control, or endorse any Third-Party Services and is not responsible or liable for their content, availability, functionality, terms of use, privacy practices, or any loss or damage arising from your use of or reliance upon them.
                            </p>
                            <p className="mb-3">
                                Your use of any Third-Party Services is governed solely by the terms and conditions and privacy policies of those third parties. You are encouraged to review such policies before engaging with Third-Party Services.
                            </p>
                            <p>
                                TASKTIME may modify, suspend, or discontinue integrations with any Third-Party Service at any time without notice or liability. Where Third-Party Service limitations or outages affect the Service, TASKTIME shall not be held liable for any resulting disruption to your use of the Service.
                            </p>
                        </section>

                        <Divider />

                        {/* 10. Intellectual Property */}
                        <section>
                            <SectionHeading number={10} title="Intellectual Property" />

                            <SubHeading title="10.1 TASKTIME Ownership" />
                            <p className="mb-3">
                                The Service, including all software, technology, algorithms, platform architecture, interfaces, designs, trademarks, logos, trade names, documentation, AI models, and all other proprietary materials embodied therein (collectively, &quot;Platform IP&quot;), are and shall remain the exclusive intellectual property of TASKTIME or its licensors. All rights not expressly granted herein are reserved.
                            </p>

                            <SubHeading title="10.2 Restrictions" />
                            <p className="mb-3">
                                You may not copy, reproduce, distribute, transmit, publicly display, create derivative works of, modify, adapt, translate, reverse engineer, decompile, disassemble, or otherwise exploit any part of the Platform IP without TASKTIME&apos;s prior written consent. Any unauthorized use of the Platform IP constitutes a material breach of these Terms and may give rise to claims for intellectual property infringement.
                            </p>

                            <SubHeading title="10.3 Limited License to User" />
                            <p className="mb-3">
                                Subject to your compliance with these Terms and payment of applicable fees, TASKTIME grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service solely for your internal business or personal purposes as contemplated by your subscription plan. This license does not include any right to resell, sublicense, or commercialize the Service or any AI Output derived from it.
                            </p>

                            <SubHeading title="10.4 Feedback" />
                            <p>
                                If you submit any suggestions, ideas, feature requests, or other feedback regarding the Service (&quot;Feedback&quot;), you hereby grant TASKTIME a royalty-free, perpetual, irrevocable, worldwide license to use, incorporate, and exploit such Feedback without restriction and without obligation of compensation or attribution to you.
                            </p>
                        </section>

                        <Divider />

                        {/* 11. User Content */}
                        <section>
                            <SectionHeading number={11} title="User Content" />

                            <SubHeading title="11.1 Ownership" />
                            <p className="mb-3">
                                You retain full ownership of all data, text, files, documents, and other materials that you upload, submit, or transmit through the Service (&quot;User Content&quot;). These Terms do not transfer any ownership of User Content to TASKTIME.
                            </p>

                            <SubHeading title="11.2 License Grant" />
                            <p className="mb-3">
                                By submitting User Content to the Service, you grant TASKTIME a limited, non-exclusive, worldwide, royalty-free license to access, process, store, display, and use your User Content solely to the extent necessary to provide the Service to you. This license terminates when your account is deleted, subject to reasonable data retention periods required by law or technical operations.
                            </p>

                            <SubHeading title="11.3 User Representations" />
                            <p className="mb-3">
                                You represent and warrant that: (a) you own or have the necessary rights and licenses to submit the User Content; (b) your User Content does not infringe any intellectual property rights, privacy rights, or other rights of any third party; and (c) your User Content does not contain any unlawful, defamatory, obscene, or harmful material.
                            </p>

                            <SubHeading title="11.4 No Obligation to Monitor" />
                            <p>
                                TASKTIME has no obligation to monitor, review, or moderate User Content. However, TASKTIME reserves the right, at its sole discretion, to remove or disable access to any User Content that violates these Terms or applicable law, or that TASKTIME otherwise deems objectionable.
                            </p>
                        </section>

                        <Divider />

                        {/* 12. Termination */}
                        <section>
                            <SectionHeading number={12} title="Termination" />

                            <SubHeading title="12.1 Termination by User" />
                            <p className="mb-3">
                                You may terminate your account at any time by cancelling your subscription through your account settings or by contacting support@tasktime.in. Termination is subject to the provisions of Section 4 (Subscription Plans &amp; Billing) and Section 13 (Refund Policy).
                            </p>

                            <SubHeading title="12.2 Termination or Suspension by TASKTIME" />
                            <p className="mb-4">TASKTIME reserves the right to suspend, restrict, or permanently terminate your account and access to the Service at any time, with or without prior notice, for any of the following reasons:</p>
                            <BulletList items={[
                                "Material breach of any provision of these Terms, including the Acceptable Use Policy;",
                                "Non-payment of subscription fees or chargebacks;",
                                "Conduct that TASKTIME determines, in its sole judgment, is harmful to other users, third parties, or the integrity of the Service;",
                                "Fraudulent, abusive, or illegal activity; or",
                                "Any other reason at TASKTIME's reasonable discretion.",
                            ]} />
                            <p className="mt-4">Suspension or termination by TASKTIME for cause does not entitle you to any refund of fees paid.</p>

                            <SubHeading title="12.3 Effect of Termination" />
                            <p className="mb-3">
                                Upon termination of your account for any reason: (a) all licenses granted to you under these Terms will immediately cease; (b) your access to the Service and all associated User Content will be disabled; and (c) any accrued rights and obligations of either party shall survive termination. TASKTIME will permanently delete User Content within thirty (30) days following the effective date of account termination, except where retention for a longer period is required by applicable law, regulation, or legitimate legal hold. TASKTIME has no obligation to retain or export User Content after termination, and Users are advised to export all necessary data prior to terminating their account.
                            </p>

                            <SubHeading title="12.4 Survival" />
                            <p>
                                The following provisions shall survive termination or expiration of these Terms: Sections 7 (AI Output Disclaimer), 10 (Intellectual Property), 13 (Refund Policy), 14 (Limitation of Liability), 15 (Indemnification), and 16 (Governing Law &amp; Arbitration).
                            </p>
                        </section>

                        <Divider />

                        {/* 13. Refund Policy */}
                        <section>
                            <SectionHeading number={13} title="Refund Policy" />
                            <WarningBlock>
                                <strong>No Refunds:</strong> All fees paid to TASKTIME are strictly non-refundable. No refunds will be issued for used or unused subscription periods or AI credits, except where explicitly required by applicable law.
                            </WarningBlock>

                            <SubHeading title="13.1 General Non-Refundability" />
                            <p className="mb-3">
                                All payments made to TASKTIME, including subscription fees, Top-Up Credit purchases, and any other charges, are non-refundable. By completing a purchase or initiating a subscription, you expressly acknowledge and agree that you are not entitled to any refund of fees paid, whether the credits or subscription period have been used in full, in part, or not at all.
                            </p>

                            <SubHeading title="13.2 No Refunds on AI Credits" />
                            <p className="mb-3">
                                AI credits, whether subscription credits or Top-Up Credits, are non-refundable in all circumstances. This policy applies regardless of whether the credits have been consumed, are partially unused, or are wholly unused at the time of any cancellation, suspension, or termination.
                            </p>

                            <SubHeading title="13.3 Non-Refundability of Current Billing Period" />
                            <p className="mb-3">
                                If you cancel a subscription during an active billing cycle, you will not receive a refund for the remaining unused portion of that billing cycle. Your subscription and associated access will remain active until the end of the paid billing period.
                            </p>

                            <SubHeading title="13.4 Statutory Exceptions" />
                            <p className="mb-3">
                                Nothing in this Refund Policy shall limit or exclude any rights you may have under applicable consumer protection legislation that cannot be waived by contract. Where applicable law mandates a right of refund or cancellation that cannot be contractually excluded, TASKTIME will comply with such obligations to the minimum extent required by law.
                            </p>

                            <SubHeading title="13.5 Chargebacks" />
                            <p>
                                Initiating an unjustified chargeback or payment dispute with your financial institution constitutes a breach of these Terms. TASKTIME reserves the right to suspend your account pending resolution of any disputed charge and to pursue recovery of amounts owed, including associated fees and costs.
                            </p>
                        </section>

                        <Divider />

                        {/* 14. Limitation of Liability */}
                        <section>
                            <SectionHeading number={14} title="Limitation of Liability" />

                            <SubHeading title={`14.1 Service Provided "As Is" and "As Available"`} />
                            <p className="mb-3">
                                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TASKTIME EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, TITLE, ACCURACY, AND RELIABILITY. TASKTIME does not warrant that the Service will be uninterrupted, error-free, secure, or free from viruses or other harmful components, or that any defect will be corrected.
                            </p>

                            <SubHeading title="14.2 Service Availability" />
                            <p className="mb-3">
                                TASKTIME does not guarantee any specific level of service availability, uptime, or response time unless such guarantees are expressly stated in a separate, written Service Level Agreement (SLA) executed between TASKTIME and the User. In the absence of an executed SLA, the Service is provided on a commercially reasonable efforts basis. Scheduled and unscheduled maintenance, third-party infrastructure outages, force majeure events, or other technical failures may result in periods of unavailability for which TASKTIME shall have no liability. Users are advised not to use the Service as the sole or primary system of record for critical data without maintaining independent backups.
                            </p>

                            <SubHeading title="14.3 Exclusion of Consequential Damages" />
                            <p className="mb-3">
                                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TASKTIME SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF DATA, LOSS OF BUSINESS OPPORTUNITY, LOSS OF GOODWILL, OR COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE SERVICE, EVEN IF TASKTIME HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                            </p>

                            <SubHeading title="14.4 Aggregate Liability Cap" />
                            <p className="mb-3">
                                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TASKTIME&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE, WHETHER IN CONTRACT, TORT, STATUTE, OR OTHERWISE, SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO TASKTIME IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
                            </p>

                            <SubHeading title="14.5 Essential Basis" />
                            <p>
                                The parties acknowledge that the limitations of liability set forth in this Section reflect a reasonable allocation of risk and form an essential basis of the bargain between TASKTIME and the User. In the absence of such limitations, TASKTIME would not provide the Service on the terms set out herein.
                            </p>
                        </section>

                        <Divider />

                        {/* 15. Indemnification */}
                        <section>
                            <SectionHeading number={15} title="Indemnification" />
                            <p className="mb-4">
                                You agree to defend, indemnify, and hold harmless TASKTIME, its directors, officers, employees, agents, contractors, successors, and assigns from and against any and all claims, damages, liabilities, losses, costs, and expenses (including reasonable legal fees and court costs) arising out of or in connection with:
                            </p>
                            <BulletList items={[
                                "Your access to or use of the Service in violation of these Terms;",
                                "Your User Content, including any claim that your User Content infringes the intellectual property rights, privacy rights, or other rights of any third party;",
                                "Your violation of any applicable law or regulation;",
                                "Your breach of any representation, warranty, or obligation set out in these Terms; or",
                                "Any claim by a third party arising from your use of AI Outputs.",
                            ]} />
                            <p className="mt-4">
                                TASKTIME reserves the right to assume exclusive control of the defense of any matter subject to indemnification, at your expense. You shall not settle any claim without TASKTIME&apos;s prior written consent.
                            </p>
                        </section>

                        <Divider />

                        {/* 16. Governing Law & Arbitration */}
                        <section>
                            <SectionHeading number={16} title="Governing Law & Arbitration" />

                            <SubHeading title="16.1 Governing Law" />
                            <p className="mb-3">
                                These Terms and any dispute or claim arising out of or in connection with them or their subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
                            </p>

                            <SubHeading title="16.2 Mandatory Arbitration" />
                            <p className="mb-3">
                                Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or invalidity thereof, shall be resolved by binding arbitration conducted in accordance with the Arbitration and Conciliation Act, 1996 (as amended), or its successor legislation. The seat and venue of arbitration shall be Mumbai, Maharashtra, India. Proceedings shall be conducted in the English language. The arbitral tribunal shall consist of a sole arbitrator mutually agreed upon by the parties. In the absence of agreement, the arbitrator shall be appointed in accordance with the applicable rules under the Arbitration and Conciliation Act, 1996.
                            </p>

                            <SubHeading title="16.3 Jurisdiction for Interim Relief" />
                            <p className="mb-3">
                                Notwithstanding the agreement to arbitrate, the courts of competent jurisdiction in Maharashtra, India, shall have exclusive jurisdiction to grant interim or interlocutory relief, including injunctions, in connection with any dispute arising under or in relation to these Terms.
                            </p>

                            <SubHeading title="16.4 Class Action Waiver" />
                            <p className="mb-3">
                                You agree that any dispute resolution proceedings shall be conducted on an individual basis only. You hereby waive any right to bring or participate in any class action, collective action, or representative proceeding in connection with these Terms or the Service.
                            </p>

                            <SubHeading title="16.5 Limitation on Claims" />
                            <p>
                                Any claim or action arising out of or relating to the Service or these Terms must be commenced within one (1) year after the cause of action accrues. Claims not brought within this period are permanently barred.
                            </p>

                            <InfoBlock>
                                Governing law: India. Arbitration seat: Mumbai, Maharashtra. Conducted under the Arbitration and Conciliation Act, 1996.
                            </InfoBlock>
                        </section>

                        <Divider />

                        {/* 17. Changes to Terms */}
                        <section>
                            <SectionHeading number={17} title="Changes to Terms" />
                            <p className="mb-3">
                                TASKTIME reserves the right to amend, modify, or update these Terms at any time at its sole discretion. In the event of material changes, TASKTIME will provide reasonable prior notice to registered users via email or through a notice posted on the platform. The updated Terms will be effective as of the date specified in the notice.
                            </p>
                            <p className="mb-3">
                                Your continued access to or use of the Service after the effective date of the amended Terms constitutes your acceptance of such changes. If you do not agree to the modified Terms, you must cease using the Service and, if applicable, cancel your subscription before the effective date.
                            </p>
                            <p>
                                TASKTIME encourages you to review these Terms periodically. The &quot;Effective Date&quot; at the top of this document reflects the date of the most recent revision.
                            </p>
                        </section>

                        <Divider />

                        {/* 18. Miscellaneous */}
                        <section>
                            <SectionHeading number={18} title="Miscellaneous" />

                            <SubHeading title="18.1 Entire Agreement" />
                            <p className="mb-3">
                                These Terms, together with TASKTIME&apos;s Privacy Policy and any other policies incorporated by reference, constitute the entire agreement between you and TASKTIME with respect to the subject matter hereof and supersede all prior or contemporaneous understandings, negotiations, and agreements, whether oral or written.
                            </p>

                            <SubHeading title="18.2 Severability" />
                            <p className="mb-3">
                                If any provision of these Terms is held to be invalid, void, or unenforceable by a court or arbitral tribunal of competent jurisdiction, such provision shall be deemed severed from these Terms, and the remaining provisions shall continue in full force and effect.
                            </p>

                            <SubHeading title="18.3 Waiver" />
                            <p className="mb-3">
                                TASKTIME&apos;s failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver must be in writing and signed by an authorized representative of TASKTIME to be effective.
                            </p>

                            <SubHeading title="18.4 Assignment" />
                            <p className="mb-3">
                                You may not assign or transfer any of your rights or obligations under these Terms without TASKTIME&apos;s prior written consent. TASKTIME may freely assign its rights and obligations under these Terms, including in connection with a merger, acquisition, or sale of assets.
                            </p>

                            <SubHeading title="18.5 Force Majeure" />
                            <p className="mb-3">
                                TASKTIME shall not be liable for any failure or delay in performance of its obligations under these Terms to the extent caused by events beyond its reasonable control, including but not limited to acts of God, natural disasters, governmental actions, war, civil unrest, power outages, or failures of third-party infrastructure.
                            </p>

                            <SubHeading title="18.6 Notices" />
                            <p className="mb-3">
                                All legal notices to TASKTIME must be sent in writing to the contact details set out in Section 19. TASKTIME may provide notices to you via the email address associated with your account or through announcements on the platform.
                            </p>

                            <SubHeading title="18.7 Language" />
                            <p>
                                These Terms are drafted in the English language. In the event of any conflict or inconsistency between an English version and any translated version of these Terms, the English version shall prevail.
                            </p>
                        </section>

                        <Divider />

                        {/* 19. Contact Information */}
                        <section>
                            <SectionHeading number={19} title="Contact Information" />
                            <p className="mb-4">
                                If you have any questions, concerns, or formal notices relating to these Terms and Conditions, please contact us at:
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-sm p-6 space-y-2 font-mono text-sm">
                                <p><span className="text-gray-500">Entity:</span> <span className="text-cyan-400">TASKTIME</span></p>
                                <p><span className="text-gray-500">Department:</span> <span className="text-gray-300">Legal &amp; Compliance</span></p>
                                <p><span className="text-gray-500">Jurisdiction:</span> <span className="text-gray-300">Maharashtra, India</span></p>
                                <p><span className="text-gray-500">Legal:</span> <span className="text-cyan-400">legal@tasktime.in</span></p>
                                <p><span className="text-gray-500">Support:</span> <span className="text-cyan-400">support@tasktime.in</span></p>
                                <p><span className="text-gray-500">Website:</span> <span className="text-cyan-400">https://tasktime.in</span></p>
                            </div>
                        </section>

                        <Divider />

                        {/* Contact CTA */}
                        <section>
                            <p className="text-sm text-gray-500 mb-4 font-mono">
                                For legal enquiries, please contact:
                            </p>
                            <a href="mailto:legal@tasktime.in">
                                <Button variant="scanline" size="md">
                                    legal@tasktime.in
                                </Button>
                            </a>
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