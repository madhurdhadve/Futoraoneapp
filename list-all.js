require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function listAll() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found:", JSON.stringify(data));
        }
    } catch (error) {
        console.error(error.message);
    }
}

listAll();
