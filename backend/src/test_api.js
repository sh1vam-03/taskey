// Test backend API response directly
import http from 'http';

http.get('http://localhost:3000/api/calendar/month?year=2026&month=3', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            const march1 = parsed.data?.days?.["2026-03-01"];
            console.log("March 1st records from /api/calendar/month:");
            console.log(JSON.stringify(march1, null, 2));
        } catch (e) {
            console.error("Parse error or 401 Unauthorized?", data.substring(0, 100));
        }
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
