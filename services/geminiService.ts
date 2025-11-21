
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Resource, Request } from "../types";

const getSystemInstruction = () => `
You are an AI assistant for a blood bank management system called "Blood Bridge". 
Your role is to analyze current inventory levels and active requests to provide actionable insights.
Focus on identifying critical shortages (Low/Critical status) and suggesting actions.
Keep responses concise, professional, and life-saving oriented.
`;

export const generateInventoryAnalysis = async (resources: Resource[], requests: Request[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "API Key is missing. Cannot generate analysis.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a prompt based on current state
    const resourceSummary = resources.map(r => `${r.hospital} (${r.bloodType}): ${r.units} units`).join('\n');
    const requestSummary = requests.filter(r => r.status === 'Active').map(r => `${r.hospitalName} needs ${r.quantity} units of ${r.bloodType} (${r.urgency})`).join('\n');

    const prompt = `
    Analyze the following data:
    
    Current Inventory:
    ${resourceSummary}

    Active Urgent Requests:
    ${requestSummary}

    Provide a 3-bullet point summary of the most critical actions needed right now to save lives.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Failed to generate AI analysis. Please check your network or API quota.";
  }
};

// --- Supply Forecast Types ---
export interface ForecastResult {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  reasoning: string;
  trendData: number[];
}

export const generateForecast = async (
  bloodType: string, 
  timeframe: string, 
  currentUnits: number
): Promise<ForecastResult | null> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Perform a supply forecast analysis for Blood Type: ${bloodType}.
      Current Global Inventory: ${currentUnits} Units.
      Forecast Period: ${timeframe}.

      Consider typical hospital usage rates, seasonal donation trends, and the current stock level.
      
      Return a JSON object with:
      1. riskLevel: 'Low', 'Moderate', 'High', or 'Critical'.
      2. reasoning: A concise professional explanation (max 2 sentences) citing reasons like high demand, shelf life, or seasonal impact.
      3. trendData: An array of 7 numbers representing the projected unit count over the time period (simulating a graph trend).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Critical'] },
            reasoning: { type: Type.STRING },
            trendData: { 
              type: Type.ARRAY, 
              items: { type: Type.NUMBER } 
            }
          },
          required: ['riskLevel', 'reasoning', 'trendData']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ForecastResult;
    }
    return null;

  } catch (error) {
    console.error("Gemini Forecast Error:", error);
    return null;
  }
};
