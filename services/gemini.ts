import { GoogleGenAI } from "@google/genai";
import { Restaurant, AppTab } from "../types";
import { OFFICIAL_REGISTRY } from "../data/officialRegistry";

// Extracted Regex for better compilation efficiency
const JSON_BLOCK_REGEX = /```json\n([\s\S]*?)\n```/;
const CODE_BLOCK_REGEX = /```\n([\s\S]*?)\n```/;

// Interface for raw API response to improve type safety
interface RawRestaurantResponse {
  name?: string;
  rating?: number;
  awards?: string;
  price?: string | number;
  ambiance?: string;
  description?: string;
  signatureDish?: string;
  category?: string;
  address?: string;
}

const parseRestaurantResponse = (text: string, location: string): Restaurant[] => {
  try {
    // Attempt to extract JSON from code blocks if present
    const jsonMatch = text.match(JSON_BLOCK_REGEX) || text.match(CODE_BLOCK_REGEX);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    
    const data = JSON.parse(jsonString);
    
    if (Array.isArray(data)) {
      return data.map((item: RawRestaurantResponse) => ({
        name: item.name || "Restaurante Desconocido",
        rating: typeof item.rating === 'number' ? item.rating : 4.5,
        awards: item.awards || "",
        // Force price to be string or number, default to formatted string if missing
        price: item.price || "Precio medio", 
        ambiance: item.ambiance || "Local acogedor",
        description: item.description || "Cocina local.",
        signatureDish: item.signatureDish || "Especialidad de la casa",
        category: item.category || "Casual",
        address: item.address || location, 
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((item.name || "") + " " + location)}`
      }));
    }
    return [];
  } catch (e) {
    console.error("Error parsing Gemini response:", e);
    return [];
  }
};

export const fetchRestaurants = async (
  location: string, 
  distance: string, 
  type: AppTab
): Promise<Restaurant[]> => {
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = "";
  let prompt = "";

  if (type === AppTab.GOURMET) {
    // Lógica Específica para GOURMET con Radio
    const isExpandedSearch = distance === '15km' || distance === '30km';
    
    let geoLogicInstruction = "";
    if (isExpandedSearch) {
      geoLogicInstruction = `
      GEOGRAPHICAL EXPANSION TASK:
      1. Identify the user's requested location: "${location}".
      2. Identify nearby towns/municipalities within a ${distance} radius of "${location}".
      3. SEARCH SCOPE: You must look for restaurants in the OFFICIAL_REGISTRY that are located in "${location}" OR in any of those identified nearby towns.
      `;
    } else {
      geoLogicInstruction = `
      SEARCH SCOPE: Search the OFFICIAL_REGISTRY STRICTLY for restaurants where the Municipality matches "${location}". Do not include nearby towns.
      `;
    }

    systemInstruction = `You are a strict gastronomic auditor. Your ONLY source of valid restaurants is the OFFICIAL_REGISTRY provided below.

    OFFICIAL_REGISTRY format: "Restaurant Name (Province, Municipality) - (Awards)"

    YOUR TASK IS A TWO-STEP PROCESS:

    1. FILTER: ${geoLogicInstruction}
       - STRICT CONSTRAINT: You must ONLY return restaurants that appear verbatim in the registry. Do not hallucinate or add restaurants not in the list.
       - QUANTITY LIMIT: If there are many matches (e.g., > 10), select ONLY the top 10 most prestigious ones (prioritize Michelin Stars, then Soles, then Bib Gourmand).

    2. ENRICH: Once you have identified the valid restaurants (Max 10), use your internal knowledge (simulate a web search) to complete the missing details for the card.
       - IMPORTANT: All text (description, ambiance, category, etc.) MUST BE IN SPANISH.
       - description: A short, compelling description of the chef's cuisine/philosophy (max 25 words).
       - ambiance: The style/interior (e.g., "Minimalista", "Casona histórica", "Vistas al mar").
       - signatureDish: Their most famous dish or tasting menu name.
       - price: Approximate price per person (e.g., "60-90").
       - category: One word (e.g., "Creativa", "Mariscos", "Tradicional").
       - address: The specific Municipality where the restaurant is located.

    If no matches are found in the registry for the scope defined, return an empty JSON array [].
    `;

    prompt = `User Location: "${location}". Radius requested: "${distance}".
    
    OFFICIAL_REGISTRY:
    ---
    ${OFFICIAL_REGISTRY}
    ---

    Return a JSON Array of max 10 objects with keys: name, rating (use 4.8 or 4.9), awards (exactly from list), price, description, ambiance, signatureDish, address, category.
    Ensure ALL strings are in SPANISH.
    `;
  } else {
    // --- LÓGICA COMUNIDAD (Siempre Casco Urbano) ---
    // NOTA: Ignoramos el parámetro 'distance' para Community por requisito de negocio,
    // excepto para informar a la IA que se limite al casco urbano.
    
    systemInstruction = `Eres un experto local en gastronomía española y analista de reseñas. 
    
    IDIOMA OBLIGATORIO: Todo el texto generado debe estar en ESPAÑOL.
    
    RESTRICCIÓN GEOGRÁFICA ESTRICTA:
    - Aunque el usuario pida un radio amplio, para la categoría "Comunidad" DEBES LIMITARTE EXCLUSIVAMENTE AL CASCO URBANO de la localidad: "${location}".
    - NO busques en pueblos vecinos ni en afueras lejanas. Cíñete a lo local.

    TU MISIÓN:
    1. Simula una referencia cruzada de datos entre Google Maps, TripAdvisor y TheFork para el casco urbano de "${location}".
    2. Selecciona restaurantes que tengan consistentemente altas valoraciones (4.5+ estrellas) en estas plataformas.
    3. Descarta cadenas de comida rápida o trampas para turistas. Prioriza la autenticidad y el favor de los locales.
    
    Estilo de respuesta:
    - description: Describe la COMIDA y el estilo de cocina en 20-30 palabras (en Español).
    - ambiance: Tipo de local (Ej: "Taberna bulliciosa", "Terraza familiar", "Romántico", "Industrial").
    - category: Una o dos palabras en Español (Ej: "Tapas", "Asador", "Mexicano", "Italiana", "Fusión").
    - signatureDish: Nombre del plato en español.
    - address: SOLO "MUNICIPIO, PROVINCIA".
    `;

    prompt = `Busca 15 restaurantes favoritos de la comunidad, SITUADOS ESTRICTAMENTE EN EL CASCO URBANO DE "${location}".
    
    CRITERIOS DE SELECCIÓN:
    - Cantidad: Genera una lista de 15 candidatos de alta calidad para asegurar variedad.
    - Calidad: Basado en referencias cruzadas de Google, TripAdvisor y TheFork.
    - Exclusiones: NO incluyas restaurantes que ya estén en la guía Michelin/Repsol (esos van en la otra pestaña).

    Devuelve un JSON con:
    - name (string)
    - rating (number, ej 4.6)
    - price (number o string ej "20-30"): Coste medio.
    - awards: Dejar vacío o poner "Recomendado local", "Certificado Excelencia", etc.
    - ambiance (string en Español)
    - description (string en Español)
    - signatureDish (string en Español)
    - category (string en Español para la etiqueta de color)
    - address (Municipio, Provincia)

    Formato JSON Array exacto.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, 
        tools: [{ googleMaps: {} }],
      }
    });

    const text = response.text;
    if (!text) return [];

    return parseRestaurantResponse(text, location);

  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};