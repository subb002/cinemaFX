
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMovieMetadata = async (title: string, genre: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, compelling Netflix-style movie description (max 150 characters) and a rating (like 8.5/10) for a movie titled "${title}" in the genre "${genre}". Output in raw JSON format: {"description": "...", "rating": "..."}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{"description": "No description available.", "rating": "N/A"}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return { description: "Cinemax Original. Experience the thrill in 4K.", rating: "8.9/10" };
  }
};
