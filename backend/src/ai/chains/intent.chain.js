// Understand user intent

import OpenAI from "openai";



export async function runIntentChain({ systemPrompt, memory, userMessage }) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const messages = [
        {
            role: "system",
            content: `
You extract user intent.
You do NOT plan.
You do NOT suggest.
You only understand.

Return VALID JSON only.

Output format:
{
  "intent": "PLAN_DAY | MODIFY_PLAN | ASK_QUESTION | GENERAL_TALK",
  "constraints": {},
  "preferences": {}
}
      `,
        },
        {
            role: "system",
            content: `User memory:\n${JSON.stringify(memory)}`,
        },
        {
            role: "user",
            content: userMessage,
        },
    ];

    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
    });

    return JSON.parse(res.choices[0].message.content);
}
