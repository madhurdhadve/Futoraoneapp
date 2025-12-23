require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function debugModels() {
    console.log("Checking API Key:", GEMINI_API_KEY.substring(0, 5) + "...");
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
            console.log("API returned error:", response.status);
            console.log(JSON.stringify(data, null, 2));
            return;
        }

        if (data.models && data.models.length > 0) {
            console.log("FOUND MODELS:");
            data.models.forEach(m => {
                const canGenerate = m.supportedGenerationMethods.includes('generateContent');
                console.log(`- ${m.name} [Gen: ${canGenerate}]`);
            });
        } else {
            console.log("No models found in the response.");
            console.log("Full response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

debugModels();
