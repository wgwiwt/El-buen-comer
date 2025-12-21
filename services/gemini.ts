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
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("restaurante " + (item.name || "") + ", " + (item.address || location))}`
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
      SEARCH SCOPE: Search the OFFICIAL_REGISTRY for restaurants where the Municipality matches "${location}".
      - ALLOW exact matches (e.g. "Madrid" == "Madrid").
      - ALLOW substring matches if it refers to the same place (e.g. "Donostia" matches "Donostia / San Sebastián").
      `;
    }

    systemInstruction = `You are a strict gastronomic auditor. Your ONLY source of valid restaurants is the OFFICIAL_REGISTRY provided below.
    The OFFICIAL_REGISTRY is a list of text lines where each line roughly follows this structure:
    "Region Province Municipality Restaurant_Name Awards"
    
    * IMPORTANT: The column separators are spaces/tabs. You must deduce which part is the Restaurant Name by looking at the context.
    * The 'Restaurant_Name' is usually after the Municipality and before the Awards (Michelin, Soles, Bib Gourmand, Recomendado).
    
    TASK:
    1. FILTER: Search within OFFICIAL_REGISTRY for restaurants in the requested location: "${location}".
       ${geoLogicInstruction}
       - CRITICAL: IF NO RESTAURANTS MATCH THE LOCATION "${location}" IN THE REGISTRY, RETURN AN EMPTY ARRAY [].
       - DO NOT RETURN RANDOM RESTAURANTS FROM OTHER LOCATIONS.
       
    2. ENRICH: Once you have identified the valid restaurants from the list (Max 7), use your internal knowledge to complete the missing details for the card (description, ambiance, dish).
       * DO NOT INVENT RESTAURANTS. If it's not in the OFFICIAL_REGISTRY, do not return it.
       * ONLY return restaurants that strictly appear in the provided text list.

    3. FORMAT: Return a JSON array with exactly these fields:
       - name: Exact name from the registry.
       - rating: Use 4.8 or 4.9 for these top-tier places.
       - awards: The awards listed in the registry line (e.g. "1 estrella michelin, 2 soles").
       - description: A brief, appetizing description in Spanish (20 words).
       - ambiance: Short phrase in Spanish (e.g., "Minimalista", "Casona histórica").
       - signatureDish: Their most famous dish or tasting menu name.
       - price: Approximate price per person (e.g., "60-90").
       - category: One word (e.g., "Creativa", "Mariscos", "Tradicional").
       - address: The specific Municipality where the restaurant is located.
    `;

    prompt = `User Location: "${location}". Radius requested: "${distance}".
    
    OFFICIAL_REGISTRY:
    ---
    ${OFFICIAL_REGISTRY}
    ---

    Return a JSON Array of max 10 objects with keys: name, rating, awards, price, description, ambiance, signatureDish, address, category.
    Ensure ALL strings are in SPANISH.
    `;
  } else {
    // --- LÓGICA COMUNIDAD (Siempre Casco Urbano) ---
    // NOTA: Ignoramos el parámetro 'distance' para Community por requisito de negocio,
    // excepto para informar a la IA que se limite al casco urbano.

    systemInstruction = `Eres un experto local en gastronomía española y analista de reseñas. 
    
    IDIOMA OBLIGATORIO: Todo el texto generado debe estar en ESPAÑOL.
    
    RESTRICCIÓN GEOGRÁFICA ESTRICTA:
    - Para la categoría "Comunidad" DEBES LIMITARTE EXCLUSIVAMENTE AL CASCO URBANO de la localidad: "${location}".
    - NO busques en pueblos vecinos ni en afueras lejanas.
    - IMPORTANTE: Solo devuelve restaurantes que SEPAS CON CERTEZA QUE EXISTEN y están abiertos.

    TU MISIÓN:
    1. Cross-Reference (Referencia Cruzada): Busca restaurantes que sean "Top Rated" TANTO en Google Maps como en TripAdvisor.
    2. FILTRO DE POPULARIDAD ESTRICTO: Solo incluye restaurantes que tengan MÁS DE 300 RESEÑAS (combinando ambas plataformas o en Google Maps).
    3. TOLERANCIA CERO CON LA INVENCIÓN: Busca hasta encontrar MÍNIMO 12 restaurantes REALES.
    4. Si el restaurante no existe en tu base de conocimiento o en Google Maps, NO LO PONGAS.
    5. Descarta cadenas de comida rápida. Prioriza la autenticidad.
    
    Estilo de respuesta:
    - description: Describe la COMIDA y el estilo de cocina en 20-30 palabras (en Español).
    - ambiance: Tipo de local (Ej: "Taberna bulliciosa", "Terraza familiar", "Romántico-Elegante", "Industrial").
    - category: Una o dos palabras en Español (Ej: "Tapas", "Asador", "Mexicano", "Italiana", "Fusión").
    - signatureDish: Nombre del plato en español.
    - address: SOLO "MUNICIPIO, PROVINCIA".
    `;

    prompt = `Busca entre 12 y 15 restaurantes favoritos de la comunidad, SITUADOS ESTRICTAMENTE EN EL CASCO URBANO DE "${location}".
    
    CRITERIOS DE SELECCIÓN:
    - REALISMO TOTAL: Prohibido inventar nombres. Todos los restaurantes deben ser encontrables en Google Maps.
    - DOBLE VALIDACIÓN: Deben tener alta puntuación en Google Maps Y TripAdvisor.
    - VOLUMEN: Mínimo 300 reseñas (reviews) verificables.
    - Calidad: Basado en popularidad real.
    - Exclusiones: NO incluyas restaurantes que ya estén en la guía Michelin/Repsol.

    Devuelve un JSON con:
    - name (string exacto como aparece en Google)
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
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
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