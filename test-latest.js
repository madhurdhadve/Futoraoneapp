require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const payload = {
    contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
};

async function testLatest() {
    console.log("Testing Gemini API Key with gemini-1.5-flash-latest...");
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
            console.log("SUCCESS! gemini-1.5-flash-latest responded:");
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error("FAILURE! Status:", response.status);
            console.error("Error Details:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("CRITICAL ERROR:", error.message);
    }
}

testLatest();
