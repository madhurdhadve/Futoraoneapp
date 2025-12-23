require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function listModels() {
    console.log("Listing Gemini Models...");
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (response.ok) {
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error("FAILURE! Status:", response.status);
            console.error("Error Details:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("CRITICAL ERROR:", error.message);
    }
}

listModels();
