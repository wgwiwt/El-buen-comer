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

// --- OPTIMIZATION 1: PRE-FILTERING ---
const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const preFilterRegistry = (location: string, registry: string): string => {
  const lines = registry.split('\n').filter(line => line.trim() !== '');
  const normLocation = normalizeString(location);

  // 1. Find lines that directly match the location (City/Town)
  const exactMatches = lines.filter(line => normalizeString(line).includes(normLocation));

  if (exactMatches.length === 0) {
    // Fallback: If no exact match, return everything to avoid missing data, 
    // or maybe perform a simpler filter? Let's return full registry if unsure to be safe.
    return registry;
  }

  // 2. Extract Provinces from the matching lines to allow "Nearby" searches (15km/30km)
  // Format usually is: Name (Province, City) - Awards
  // Regex to capture content inside first parenthesis before comma
  const provinces = new Set<string>();
  exactMatches.forEach(line => {
    const match = line.match(/\(([^,]+),/); // Matches "Almería" in "(Almería, Adra)"
    if (match && match[1]) {
      provinces.add(normalizeString(match[1]));
    }
  });

  // 3. Filter registry to include ALL restaurants from those Identify Provinces.
  // This reduces context from ~600 lines (whole Spain/Andalucía) to ~50-100 (relevant Province),
  // saving tokens while keeping "nearby" context valid.
  const filteredLines = lines.filter(line => {
    const match = line.match(/\(([^,]+),/);
    if (match && match[1]) {
      return provinces.has(normalizeString(match[1]));
    }
    // If format doesn't match, include it just in case
    return false;
  });

  return filteredLines.join('\n');
};

const parseRestaurantResponse = (text: string, location: string): Restaurant[] => {
  try {
    // Attempt to extract JSON from code blocks if present
    const jsonMatch = text.match(JSON_BLOCK_REGEX) || text.match(CODE_BLOCK_REGEX);
    const jsonString = jsonMatch ? jsonMatch[1] : text;

    // Auto-fix common JSON errors in streams (comma at end)
    const fixedJsonString = jsonString.replace(/,\s*\]/, ']');

    const data = JSON.parse(fixedJsonString);

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
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`restaurante ${item.name || ""}, ${item.address || location}`)}`
      }));
    }
    return [];
  } catch (e) {
    // console.error("Error parsing Gemini response:", e); 
    // Suppress error during streaming partial parsing
    return [];
  }
};

export const fetchRestaurants = async (
  location: string,
  distance: string,
  type: AppTab,
  onUpdate?: (restaurants: Restaurant[]) => void
): Promise<Restaurant[]> => {

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = "";
  let prompt = "";

  if (type === AppTab.GOURMET) {
    const isExpandedSearch = distance === '15km' || distance === '30km';

    // --- APPLY PRE-FILTERING ---
    const filteredRegistry = preFilterRegistry(location, OFFICIAL_REGISTRY);

    let geoLogicInstruction = "";
    if (isExpandedSearch) {
      geoLogicInstruction = `
      FASE 1 - LÓGICA GEOGRÁFICA (EXPANDIDA):
      1. Identifica el municipio solicitado por el usuario: "${location}".
      2. Calcula internamente qué otros municipios o pueblos están dentro del radio de ${distance}.
      3. TU OBJETIVO: Buscar en el REGISTRO proporcionado restaurantes que estén situados en "${location}" O en cualquiera de esos pueblos vecinos identificados.
      `;
    } else {
      geoLogicInstruction = `
      FASE 1 - LÓGICA GEOGRÁFICA (ESTRICTA):
      1. Identifica el municipio solicitado: "${location}".
      2. TU OBJETIVO: Buscar en el REGISTRO ÚNICAMENTE restaurantes cuyo municipio coincida exactamente con "${location}". Ignora alrededores.
      `;
    }

    systemInstruction = `Actúa como una API de doble motor: Motor de Base de Datos Estricta + Motor de Conocimiento Gastronómico.
    
    TIENES PROHIBIDO INVENTAR RESTAURANTES. Solo puedes devolver restaurantes que existan físicamente en el texto del REGISTRO proporcionado abajo.
    
    NOTA SOBRE DUPLICADOS: Si un restaurante aparece varias veces en el registro (ej. con premios actualizados), USA SIEMPRE LA VERSIÓN CON MÁS PREMIOS O MÁS RECIENTE.

    INSTRUCCIONES DE PROCESO (OBLIGATORIO):

    ${geoLogicInstruction}

    FASE 2 - FILTRADO Y VALIDACIÓN:
    - Escanea el REGISTRO.
    - Extrae SOLO los restaurantes que cumplan la condición geográfica de la Fase 1.
    - Si encuentras más de 7, selecciona los 7 con mejores galardones (Estrellas Michelin > Soles > Bib Gourmand).

    FASE 3 - ENRIQUECIMIENTO DE TARJETA (Aquí usas tu conocimiento):
    - Una vez tengas la lista de nombres validados (que salen del registro), OLVIDA la información escueta del registro.
    - Usa tu conocimiento interno sobre esos restaurantes específicos para rellenar los campos que faltan:
      * description: Redacta una descripción atractiva en ESPAÑOL sobre su estilo de cocina (max 25 palabras).
      * ambiance: Describe el ambiente (Ej: "Palacio reformado", "Vistas al mar", "Minimalista").
      * signatureDish: Nombra su plato más icónico.
      * price: Estima el precio medio real (Ej: "80-120").
      * category: Categoría culinaria (Ej: "Creativa", "Mariscos", "Asador").
      * address: Pon el Municipio real donde se encuentra.

    FORMATO DE SALIDA:
    Devuelve un JSON Array limpio. NO uses bloques de código markdown (\`\`\`json). Empieza directamente con [.
    `;

    prompt = `Ubicación Usuario: "${location}". Radio: "${distance}".
    
    REGISTRO FILTRADO (Fuente de Verdad Única):
    ---
    ${filteredRegistry}
    ---

    Genera el JSON con un MÁXIMO de 7 restaurantes encontrados en el registro dentro del radio.
    Keys requeridas: name, rating (pon 4.8 o similar), awards (copia exacta del registro), price, description, ambiance, signatureDish, address, category.
    `;
  } else {
    // --- LÓGICA COMUNIDAD ---

    systemInstruction = `Eres un experto local en gastronomía española y analista de reseñas. 
    
    IDIOMA OBLIGATORIO: Todo el texto generado debe estar en ESPAÑOL.
    
    RESTRICCIÓN GEOGRÁFICA ESTRICTA:
    - Aunque el usuario pida un radio amplio, para la categoría "Comunidad" DEBES LIMITARTE EXCLUSIVAMENTE AL CASCO URBANO de la localidad: "${location}".
    - NO busques en pueblos vecinos ni en afueras lejanas. Cíñete a lo local.

    TU MISIÓN:
    1. REALIZA UNA REFERENCIA CRUZADA RIGUROSA entre Google Maps y TripAdvisor para el casco urbano de "${location}".
    2. FILTRO DE VOLUMEN (CRÍTICO): Solo selecciona restaurantes que tengan MÁS DE 300 RESEÑAS (Reviews) verificables. Si un sitio es muy bueno pero tiene pocas reseñas, descártalo.
    3. FILTRO DE CALIDAD: Busca valoraciones consistentemente altas (4.5+ estrellas).
    4. Descarta cadenas de comida rápida o trampas para turistas. Prioriza la autenticidad y el favor de los locales.
    
    Estilo de respuesta:
    - description: Describe la COMIDA y el estilo de cocina en 20-30 palabras (en Español).
    - ambiance: Tipo de local (Ej: "Taberna bulliciosa", "Terraza familiar", "Romántico", "Industrial").
    - category: Una o dos palabras en Español (Ej: "Tapas", "Asador", "Mexicano", "Italiana", "Fusión").
    - signatureDish: Nombre del plato en español.
    - address: SOLO "MUNICIPIO, PROVINCIA".
    `;

    prompt = `Busca 15 restaurantes favoritos de la comunidad en el CASCO URBANO DE "${location}".
    
    CRITERIOS DE SELECCIÓN OBLIGATORIOS:
    1. POPULARIDAD: Deben tener MÍNIMO 300 RESEÑAS (Reviews) en Google Maps/TripAdvisor.
    2. CALIDAD: Puntuación superior a 4.5.
    3. LOCALIZACIÓN: Estrictamente en el casco urbano.
    4. EXCLUSIONES: NO incluyas restaurantes que ya estén en la guía Michelin/Repsol.
    5. Importante: Devuelve un JSON Array válido. NO uses bloques de código markdown. Empieza con [.

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
    `;
  }

  try {
    // --- FINAL CONFIGURATION: GEMINI 3 FLASH (USER REQUESTED & VERIFIED) ---
    // User requested gemini-3-flash. Verified active as 'gemini-3-flash-preview'.

    const response = await ai.models.generateContent({
      model: 'models/gemini-3-flash-preview', // Requires full name or exact alias
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    // In @google/genai v1+, response.text is often a getter.
    // We cast relevant types to avoid TS errors if types are slightly mismatched.

    const fullText = (response as any).text instanceof Function
      ? (response as any).text()
      : (response as any).text;

    console.log("Gemini Raw Response:", fullText); // Debug log

    // Call onUpdate once at the end if provided, to satisfy the interface
    if (onUpdate && typeof fullText === 'string') {
      try {
        const parsed = parseRestaurantResponse(fullText, location);
        onUpdate(parsed);
      } catch (e) {
        console.warn("Could not parse for onUpdate:", e);
      }
    }

    // FINAL PARSE (Standard)
    return parseRestaurantResponse(fullText as string, location);

  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};