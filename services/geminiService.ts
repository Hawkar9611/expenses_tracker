import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, ExpenseCategory, Currency } from "../types";

// Helper to convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    throw new Error("API Key is missing. Please configure it.");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseReceiptImage = async (imageFile: File): Promise<Partial<Transaction>> => {
  const ai = getAIClient();
  const base64Data = await blobToBase64(imageFile);

  // We want a JSON response
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER, description: "Total amount of the receipt" },
      date: { type: Type.STRING, description: "Date of purchase in YYYY-MM-DD format" },
      merchant: { type: Type.STRING, description: "Name of the merchant or store" },
      description: { type: Type.STRING, description: "Brief description of items purchased" },
      category: { 
        type: Type.STRING, 
        description: "Best fitting category from: Food, Transport, Utilities, Entertainment, Shopping, Health, Housing, Other",
        enum: Object.values(ExpenseCategory)
      },
    },
    required: ["amount", "merchant", "category"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data,
            },
          },
          {
            text: "Analyze this receipt image and extract the following details. If the date is missing, use today's date."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text) as Partial<Transaction>;
    // Explicitly set type to expense for receipts
    parsed.type = 'expense';
    return parsed;
  } catch (error) {
    console.error("Error parsing receipt:", error);
    throw error;
  }
};

export const generateInsights = async (transactions: Transaction[], currency: Currency = 'USD'): Promise<string> => {
  const ai = getAIClient();
  
  // Prepare a summary of transactions for the AI to analyze
  const simplifiedTransactions = transactions.slice(0, 60).map(t => ({
    date: t.date,
    amount: t.amount,
    type: t.type,
    category: t.category,
    description: t.description
  }));

  const prompt = `
    Analyze the following financial transactions (income and expenses) and provide:
    1. A brief summary of financial health (Income vs Spending).
    2. Three actionable tips to save money or optimize budget.
    3. Use Markdown formatting for headings and lists.
    
    Context:
    - The currency used is: ${currency}
    - Keep in mind the typical purchasing power and price scales of this currency when analyzing amounts.

    Transaction Data:
    ${JSON.stringify(simplifiedTransactions, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate insights at this time.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Sorry, I encountered an error while analyzing your transactions.";
  }
};