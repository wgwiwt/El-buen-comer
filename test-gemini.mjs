import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    // "gemini-flash-latest" is often a safe bet for free tier
    const modelName = "gemini-flash-latest";

    console.log(`Testing ${modelName}...`);
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: "Hola, funcionas?",
        });

        let text;
        if (typeof response.text === 'function') {
            text = response.text();
        } else {
            text = response.text;
        }

        console.log(`✅ SUCCESS! Response: ${text.substring(0, 50)}`);
    } catch (error) {
        console.log(`❌ FAILED`);
        if (error.message) console.log(error.message);
    }
}

testConnection();
