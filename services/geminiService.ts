import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export const parseCommandWithGemini = async (userInput: string) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userInput,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ["web", "api", "streamlit"],
            description: "The type of application."
          },
          name: {
            type: Type.STRING,
            description: "The name of the project/application."
          },
          env: {
            type: Type.STRING,
            description: "The path to the .env file. Must start with ./"
          },
          validation_error: {
            type: Type.STRING,
            description: "If the path or request is unsafe, explain why."
          },
          is_help_request: {
            type: Type.BOOLEAN,
            description: "True if the user is just asking for help or greeting."
          }
        },
        required: ["is_help_request"]
      }
    }
  });

  return response.text ? JSON.parse(response.text) : null;
};
