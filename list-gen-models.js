require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function listGenerativeModels() {
    console.log("Listing Generative Models...");
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (response.ok && data.models) {
            const genModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
            console.log("Supported Models:");
            genModels.forEach(m => console.log(m.name));
        } else {
            console.error("FAILURE! Status:", response.status);
            console.error("Error Details:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("CRITICAL ERROR:", error.message);
    }
}

listGenerativeModels();
