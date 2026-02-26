

async function testStream() {
    const response = await fetch("http://localhost:5000/api/ai/conversations/123/message?stream=true", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": "accessToken=mock" // Since we hit 401 unauthorized earlier, actually we need a real token or bypass auth.
        },
        body: JSON.stringify({ message: "Hello" })
    });

    console.log("Status:", response.status);
    if (!response.ok) {
        console.log(await response.text());
        return;
    }

    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    // using node-fetch stream
    for await (const value of response.body) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop(); // Keep incomplete chunk in buffer

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith("data: ")) {
                const dataStr = line.substring(6).trim();
                if (dataStr === "[DONE]") continue;

                try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.token) {
                        console.log("CHUNK:", parsed.token);
                        fullText += parsed.token;
                    }
                } catch (e) {
                    console.log("PARSE ERROR:", dataStr);
                }
            }
        }
    }
    console.log("DONE. FullText:", fullText);
}

testStream().catch(console.error);
