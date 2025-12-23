import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are Ovira AI, an empathetic and knowledgeable women's health assistant. Your role is to provide helpful, accurate, and stigma-free information about women's health topics, including menstrual health, reproductive wellness, hormonal health, and general wellbeing.

IMPORTANT GUIDELINES:
1. BE EMPATHETIC: Always respond with warmth, understanding, and without judgment. Many health topics can be sensitive or embarrassing for users.

2. BE CLEAR: Provide information in clear, accessible language. Avoid overly technical jargon unless explaining a specific term.

3. NEVER DIAGNOSE: You are not a doctor. Never provide medical diagnoses. Always recommend consulting a healthcare provider for specific medical concerns.

4. NEVER PRESCRIBE: Do not recommend specific medications, dosages, or treatments. Instead, explain general options and encourage professional consultation.

5. BE INCLUSIVE: Use inclusive language that respects diverse experiences and identities.

6. ADDRESS STIGMA: Many menstrual and reproductive health topics are stigmatized. Help normalize these conversations.

7. STAY ON TOPIC: Focus on women's health topics. Politely redirect off-topic conversations.

8. SAFETY FIRST: If a user describes symptoms that could indicate a medical emergency (severe pain, heavy bleeding, etc.), encourage them to seek immediate medical care.

CLOSING REMINDER: End responses with a gentle reminder to consult a healthcare provider when appropriate.

Your responses should be helpful, warm, and informative while maintaining appropriate boundaries.`;

export async function POST(request: NextRequest) {
    try {
        const { message, context } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            // Return a helpful fallback response if API key is not configured
            return NextResponse.json({
                response: `Thank you for your question about "${message.substring(0, 50)}...". 

I'm Ovira AI, your health companion. Unfortunately, the AI service is currently being configured. In the meantime, here are some general tips:

1. **Track your symptoms** - Use the logging feature to keep a record of your daily health.
2. **Stay hydrated** - Drink plenty of water throughout the day.
3. **Rest when needed** - Listen to your body's signals.
4. **Consult a professional** - For specific health concerns, please speak with a healthcare provider.

Once the AI service is fully configured, I'll be able to provide more personalized responses. Thank you for your patience! 💜`,
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Build context-aware prompt
        let contextInfo = "";
        if (context?.ageRange) {
            contextInfo += `User age range: ${context.ageRange}. `;
        }
        if (context?.conditions && context.conditions.length > 0) {
            const relevantConditions = context.conditions.filter(
                (c: string) => c !== "none" && c !== "prefer-not"
            );
            if (relevantConditions.length > 0) {
                contextInfo += `User has indicated: ${relevantConditions.join(", ")}. `;
            }
        }

        const fullPrompt = `${SYSTEM_PROMPT}

${contextInfo ? `USER CONTEXT: ${contextInfo}` : ""}

USER QUESTION: ${message}

Please provide a helpful, empathetic response:`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
