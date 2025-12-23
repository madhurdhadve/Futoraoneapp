require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const payload = {
    contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
};

async function testV1() {
    console.log("Testing Gemini API Key with v1...");
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
            console.log("SUCCESS! v1 responded:");
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error("FAILURE! Status:", response.status);
            console.error("Error Details:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("CRITICAL ERROR:", error.message);
    }
}

testV1();
