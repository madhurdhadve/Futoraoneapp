require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function checkKey() {
    console.log("Checking API Key: " + API_KEY.substring(0, 8) + "...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            console.log("SUCCESS: API Key is valid!");
            const data = await response.json();
            console.log("Available models count:", data.models?.length);
        } else {
            console.log("FAILED: API Key returned status " + response.status);
            console.log(await response.text());
        }
    } catch (e) {
        console.error("ERROR: " + e.message);
    }
}

checkKey();
