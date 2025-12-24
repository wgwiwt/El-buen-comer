import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    console.log("Testing gemini-2.5-flash...");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Hello, are you working?",
        });

        const text = response.text();
        console.log("✅ SUCCESS! Response received:");
        console.log(text);
    } catch (error) {
        console.error("❌ ERROR FAILED:");
        console.error(error);
    }
}

testConnection();
