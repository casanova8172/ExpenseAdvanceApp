const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define your categories
const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];

async function categorizeExpense(description) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are an expense categorization assistant. 
            Analyze the following description: "${description}"
            Classify it into exactly one of these categories: ${categories.join(", ")}.
            Return only the category name as a single word.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Check if the AI returned a valid category, else default to 'Other'
        return categories.includes(text) ? text : "Other";
    } catch (error) {
        console.error("AI Error:", error);
        return "Other"; // Fallback
    }
}

module.exports = { categorizeExpense };
