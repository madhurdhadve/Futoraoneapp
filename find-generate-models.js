require('dotenv').config();
const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('Models that support generateContent:\n');

        data.models?.forEach(model => {
            const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
            if (supportsGenerate) {
                console.log(`✅ ${model.name}`);
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
