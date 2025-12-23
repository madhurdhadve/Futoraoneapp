require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const names = data.models.map(m => m.name).join('\n');
            fs.writeFileSync('clean_models.txt', names);
            console.log("Wrote models to clean_models.txt");
        } else {
            console.log("Failed: " + response.status);
        }
    } catch (e) {
        console.error("Error: " + e.message);
    }
}

listModels();
