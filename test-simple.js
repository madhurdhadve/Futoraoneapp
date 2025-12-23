require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const model = 'gemini-1.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

async function test() {
    const payload = {
        contents: [{ parts: [{ text: "Write a haiku about coding." }] }]
    };

    console.log("URL:", url);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
