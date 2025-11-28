import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { Resource, Request, Shipment } from "../types";
import { HOSPITAL_DETAILS } from "../constants";

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
            reasoning: { type: Type.STRING }
          },
          required: ['riskLevel', 'reasoning']
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

// --- AGENTIC LOGISTICS ---

const dispatchTool: FunctionDeclaration = {
  name: "dispatch_vehicle",
  description: "Dispatches a vehicle to transport blood from an origin hospital to a destination hospital.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      origin: { type: Type.STRING, description: "Name of the hospital sending the blood" },
      destination: { type: Type.STRING, description: "Name of the hospital receiving the blood" },
      bloodType: { type: Type.STRING, description: "The blood type being transported" },
      units: { type: Type.NUMBER, description: "Number of units to transport" },
      method: { type: Type.STRING, enum: ["Drone", "Ambulance"], description: "Transport method. Use Drone for small urgent (<=5 units), Ambulance for large." },
      priority: { type: Type.STRING, enum: ["High", "Critical"], description: "Priority level" },
      reason: { type: Type.STRING, description: "Short reason for the dispatch" }
    },
    required: ["origin", "destination", "bloodType", "units", "method", "priority", "reason"]
  }
};

export interface AgentAction {
  action: 'DISPATCH';
  details: {
    origin: string;
    destination: string;
    bloodType: string;
    units: number;
    method: 'Drone' | 'Ambulance';
    priority: 'High' | 'Critical';
    reason: string;
  };
}

export const runAutonomousLogisticsAgent = async (
  requests: Request[],
  resources: Resource[]
): Promise<AgentAction[]> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return [];

    const ai = new GoogleGenAI({ apiKey });

    // Filter for Active requests only
    const activeRequests = requests.filter(r => r.status === 'Active');
    if (activeRequests.length === 0) return [];

    // Simplify data for the model context
    const requestContext = activeRequests.map(r => 
      `Request ID ${r.id}: ${r.hospitalName} needs ${r.quantity} units of ${r.bloodType} (Urgency: ${r.urgency})`
    ).join('\n');

    const resourceContext = resources.filter(r => r.units > 5).map(r => 
      `${r.hospital} has ${r.units} units of ${r.bloodType}`
    ).join('\n');

    const prompt = `
      You are the Autonomous Logistics Coordinator for Blood Bridge.
      
      Task: Match URGENT requests with AVAILABLE supply.
      
      Rules:
      1. Find an Active Request.
      2. Find a hospital that has enough stock (>5 units) of that blood type.
      3. Hospital cannot send to itself.
      4. Use 'Drone' for <= 5 units (Fast). Use 'Ambulance' for > 5 units.
      5. Only dispatch if a match is found.
      
      Current Requests:
      ${requestContext}

      Available Supply:
      ${resourceContext}

      If you find a solution, call the dispatch_vehicle tool. 
      If no matches are possible, do not call any tools.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [dispatchTool] }],
        // Removed toolConfig to allow default AUTO mode and fix type error
      }
    });

    const actions: AgentAction[] = [];

    // Parse Tool Calls
    const toolCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
    
    if (toolCalls) {
      toolCalls.forEach(tc => {
        const fc = tc.functionCall;
        if (fc && fc.name === 'dispatch_vehicle') {
          actions.push({
            action: 'DISPATCH',
            details: {
              origin: fc.args.origin as string,
              destination: fc.args.destination as string,
              bloodType: fc.args.bloodType as string,
              units: fc.args.units as number,
              method: fc.args.method as 'Drone' | 'Ambulance',
              priority: fc.args.priority as 'High' | 'Critical',
              reason: fc.args.reason as string
            }
          });
        }
      });
    }

    return actions;

  } catch (error) {
    console.error("Agent Error:", error);
    return [];
  }
};