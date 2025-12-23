require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const payload = {
    contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
    }
};

async function testKey() {
    console.log("Testing Gemini API Key with native fetch...");
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
            console.log("SUCCESS! Gemini responded:");
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error("FAILURE! Status:", response.status);
            console.error("Error Details:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("CRITICAL ERROR:", error.message);
    }
}

testKey();
