/**
 * 09_references.js
 * ─────────────────────────────────────────
 * References and Bibliography
 * ─────────────────────────────────────────
 */

const { h1, h2, h3, jpp, sp, pb, num, bul } = require('./helpers');

const content = [

    h1('REFERENCES AND BIBLIOGRAPHY'),

    jpp('The following references have been cited or consulted during the research, design, and development of the TASKTIME project. They are organised into three categories: academic papers and books, official technical documentation, and industry reports.'),
    sp(),

    h2('A. Academic Papers and Books'),
    sp(),
    num('Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., ... & Amodei, D. (2020). Language Models are Few-Shot Learners. Advances in Neural Information Processing Systems (NeurIPS), Volume 33, pp. 1877–1901. arXiv:2005.14165. Available: https://arxiv.org/abs/2005.14165'),
    sp(),
    num('Vaithilingam, P., Zhang, T., & Glassman, E. L. (2022). Expectation vs. Experience: Evaluating the Usability of Code Generation Tools Powered by Large Language Models. ACM CHI Conference on Human Factors in Computing Systems — Extended Abstracts. doi:10.1145/3491101.3519665'),
    sp(),
    num('Weng, L. (2023). LLM Powered Autonomous Agents. Lilian Weng\'s Blog, June 2023. Available: https://lilianweng.github.io/posts/2023-06-23-agent/'),
    sp(),
    num('Wei, J., Wang, X., Schuurmans, D., Bosma, M., Xia, F., Chi, E., ... & Zhou, D. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. Advances in Neural Information Processing Systems (NeurIPS), Volume 35. arXiv:2201.11903.'),
    sp(),
    num('Sommerville, I. (2016). Software Engineering (10th Edition). Pearson Education Limited, Harlow, England. ISBN: 978-0-13-394303-0.'),
    sp(),
    num('Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner\'s Approach (9th Edition). McGraw-Hill Education, New York. ISBN: 978-1-259-87260-9.'),
    sp(),
    num('Kleppmann, M. (2017). Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems. O\'Reilly Media, Sebastopol, California. ISBN: 978-1-449-37332-0.'),
    sp(),
    num('Fowler, M. (2018). Refactoring: Improving the Design of Existing Code (2nd Edition). Addison-Wesley Professional, Boston. ISBN: 978-0-13-468599-1.'),
    sp(),

    h2('B. Official Technical Documentation'),
    sp(),
    num('Next.js Documentation (2025). "Next.js 16 App Router, Routing, and Deployment." Vercel Inc. Available: https://nextjs.org/docs'),
    sp(),
    num('React Documentation (2025). "React 19 — Concurrent Features, Hooks, and Streaming." Meta Platforms Inc. Available: https://react.dev'),
    sp(),
    num('Tailwind CSS Documentation (2025). "Tailwind CSS v4 — Utility-First CSS Framework." Tailwind Labs Inc. Available: https://tailwindcss.com/docs'),
    sp(),
    num('Node.js Documentation (2025). "Node.js v22 LTS — API Reference." OpenJS Foundation. Available: https://nodejs.org/docs/latest-v22.x/api/'),
    sp(),
    num('Express.js Documentation (2025). "Express 5.x — API Reference and Migration Guide." OpenJS Foundation. Available: https://expressjs.com/en/5x/api.html'),
    sp(),
    num('Prisma ORM Documentation (2025). "Prisma Schema Reference, Client API, and Migrations." Prisma Data Inc. Available: https://www.prisma.io/docs'),
    sp(),
    num('LangChain Documentation (2025). "LangChain JS/TS — Tools, Agents, and Chains." LangChain Inc. Available: https://js.langchain.com/docs'),
    sp(),
    num('LangGraph Documentation (2025). "LangGraph — Building Stateful Multi-Agent Applications." LangChain Inc. Available: https://langchain-ai.github.io/langgraphjs/'),
    sp(),
    num('Google AI Studio / Gemini API Documentation (2025). "Gemini 1.5 Flash — Function Calling, Streaming, and Pricing." Google LLC. Available: https://ai.google.dev/gemini-api/docs'),
    sp(),
    num('OpenAI API Documentation (2025). "GPT-4o Mini, Whisper, TTS-1 — API Reference." OpenAI Inc. Available: https://platform.openai.com/docs/api-reference'),
    sp(),
    num('Sarvam AI Documentation (2025). "Saaras v3 STT, Bulbul v3 TTS, Sarvam-M, Sarvam-30B — API Reference." Sarvam AI Pvt. Ltd. Available: https://docs.sarvam.ai'),
    sp(),
    num('Razorpay API Documentation (2025). "Subscriptions API, Orders API, Webhooks, and Payment Verification." Razorpay Software Pvt. Ltd. Available: https://razorpay.com/docs/api/'),
    sp(),
    num('Supabase Documentation (2025). "PostgreSQL Hosting, Connection Pooling, and Row Level Security." Supabase Inc. Available: https://supabase.com/docs'),
    sp(),
    num('PostgreSQL 16 Documentation (2025). "PostgreSQL 16 SQL Reference, Indexing, and Array Types." PostgreSQL Global Development Group. Available: https://www.postgresql.org/docs/16/'),
    sp(),
    num('JSON Web Token Specification (2015). "RFC 7519 — JSON Web Token (JWT)." Jones, M., Bradley, J., & Sakimura, N. Internet Engineering Task Force (IETF). Available: https://tools.ietf.org/html/rfc7519'),
    sp(),
    num('HMAC Specification (2002). "RFC 2104 — HMAC: Keyed-Hashing for Message Authentication." Krawczyk, H., Bellare, M., & Canetti, R. IETF. Available: https://tools.ietf.org/html/rfc2104'),
    sp(),
    num('bcrypt — Password Hashing (1999). "A Future-Adaptable Password Scheme." Provos, N., & Mazieres, D. USENIX Annual Technical Conference.'),
    sp(),

    h2('C. Industry Reports and Online Resources'),
    sp(),
    num('NASSCOM (2024). India AI Landscape Report 2024: The Rise of Generative AI in India. National Association of Software and Service Companies. New Delhi.'),
    sp(),
    num('Razorpay (2024). The State of Fintech in India 2024. Razorpay Software Pvt. Ltd. Bangalore.'),
    sp(),
    num('Sarvam AI (2024). "Introducing Sarvam-1: India\'s First Foundation Language Model." Sarvam AI Blog. Available: https://www.sarvam.ai/blogs/sarvam-1'),
    sp(),
    num('Vercel (2025). "Next.js 16 Release Notes." Vercel Blog. Available: https://nextjs.org/blog'),
    sp(),
    num('Census of India (2011). "Language Data — C-16 Population by Mother Tongue." Office of the Registrar General & Census Commissioner, India. Available: https://censusindia.gov.in'),

    pb(),
];

module.exports = { content };