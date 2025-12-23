require('dotenv').config();
const API_KEY = process.env.GEMINI_API_KEY;

async function testModel(modelName, apiVersion = 'v1beta') {
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{
            role: 'user',
            parts: [{ text: 'Hello' }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();

        if (response.ok) {
            console.log(`✅ ${modelName} (${apiVersion}): WORKS!`);
            return true;
        } else {
            console.log(`❌ ${modelName} (${apiVersion}): ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${modelName} (${apiVersion}): ${error.message}`);
        return false;
    }
}

async function findWorkingModel() {
    const modelsToTest = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash-exp',
        'gemini-exp-1206'
    ];

    const apiVersions = ['v1beta', 'v1'];

    console.log('Testing models...\n');

    for (const version of apiVersions) {
        for (const model of modelsToTest) {
            await testModel(model, version);
        }
    }
}

findWorkingModel();
