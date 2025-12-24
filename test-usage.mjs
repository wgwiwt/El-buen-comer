import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function analyzeUsage() {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'models/gemini-3-flash-preview';

    console.log(`📊 Analyzing usage for model: ${modelName}`);

    // Construct a REALISTIC prompt similar to the app's 'Gourmet' search
    // taking into account the 'preFilterRegistry' which injects context.
    // We'll mock ~50 lines of registry context data.
    const mockRegistryLines = Array(50).fill("Restaurante Ejemplo (Valencia, Valencia) - Galardón, 4.5").join("\n");

    const systemInstruction = `Actúa como una API de doble motor... TIENES PROHIBIDO INVENTAR...
  (Simulación de instrucciones del sistema de ~200 palabras...)`;

    const prompt = `Ubicación Usuario: "Valencia". Radio: "5km".
    
  REGISTRO FILTRADO (Fuente de Verdad Única):
  ---
  ${mockRegistryLines}
  ---

  Genera el JSON con un MÁXIMO de 7 restaurantes...
  `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                // systemInstruction: systemInstruction, // Note: SDK method might differ for systemInstruction placement in v1
                temperature: 0.3,
            }
        });

        console.log("\n✅ Request Completed.");

        // Access Usage Metadata
        const usage = response.usageMetadata;

        if (usage) {
            console.log("\n=== 📉 USAGE REPORT ===");
            console.log(`📥 Input Tokens (Prompt): ${usage.promptTokenCount}`);
            console.log(`notOutput Tokens (Response): ${usage.candidatesTokenCount}`);
            console.log(`∑  Total Tokens:        ${usage.totalTokenCount}`);
            console.log("=======================");
        } else {
            console.log("⚠️ No usage metadata returned in response object.");
            console.log({ responseKeys: Object.keys(response) });
        }

    } catch (error) {
        console.log("❌ ERROR:", error.message);
    }
}

analyzeUsage();
