import { listSchedulesTool } from "./ai/tools/schedule.tool.js";

async function test() {
    const config = {
        configurable: { user: { id: "a552736b-6fc7-44c6-8acf-ba6ddf561eee" } }
    };

    // The AI said: 2026-03-01 to 2026-03-07
    const tool = listSchedulesTool();
    const result = await tool.func({ from: "2026-03-01", to: "2026-03-07" }, config);
    console.log("Raw Tool Output:");
    console.log(JSON.stringify(JSON.parse(result), null, 2));
}

test().catch(console.error).finally(() => process.exit(0));
