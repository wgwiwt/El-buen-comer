import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    console.log("Testing gemini-2.5-pro as requested...");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: "Dime un plato típico de Valencia",
        });

        let text;
        if (typeof response.text === 'function') {
            text = response.text();
        } else {
            text = response.text;
        }

        console.log("✅ SUCCESS! Response received:");
        console.log(text);
    } catch (error) {
        console.log("❌ ERROR FAILED:");
        if (error.message) console.log(error.message);
        else console.log(error);
    }
}

testConnection();
