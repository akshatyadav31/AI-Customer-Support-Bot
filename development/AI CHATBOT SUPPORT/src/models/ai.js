const { OpenAI } = require('openai');
const { getFAQs } = require('../database/db');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Initialize OpenRouter client
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "AI Customer Support Bot",
  }
});

// Function to generate AI response
async function generateResponse(userMessage, conversationHistory) {
  try {
    // Get FAQs for context
    const faqs = await getFAQs();
    
    // Create a context with FAQs
    const faqContext = faqs.map(faq => 
      `Q: ${faq.question}\nA: ${faq.answer}`
    ).join('\n\n');
    
    // Prepare system prompt with FAQs and instructions
    const systemPrompt = `
      You are a helpful customer support AI assistant. Your goal is to provide accurate, 
      helpful responses to customer queries. If you don't know the answer or if the query 
      is outside the scope of the provided FAQs, suggest escalating to a human agent.
      
      Here are some frequently asked questions you can reference:
      
      ${faqContext}
      
      If the user's query matches one of these FAQs, provide the corresponding answer.
      If the query is related but not exactly matching, provide a helpful response based on the FAQs.
      If the query is completely unrelated to the FAQs, politely suggest escalating to a human agent.
    `;
    
    // Format conversation history for OpenAI format
    const messages = [
      { role: "system", content: systemPrompt }
    ];
    
    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    });
    
    // Send request to OpenRouter
    const completion = await client.chat.completions.create({
      extra_headers: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": process.env.SITE_NAME || "AI Customer Support Bot",
      },
      model: "google/gemini-2.5-flash-preview-09-2025",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    const response = completion.choices[0].message.content;
    
    // Check if we need to escalate
    const needsEscalation = checkIfNeedsEscalation(userMessage, response, faqs);
    
    if (needsEscalation) {
      return `I'm not able to fully answer your question. Let me connect you with a human agent who can help you better. ${response}`;
    }
    
    return response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

// Function to check if the query needs escalation
function checkIfNeedsEscalation(userMessage, aiResponse, faqs) {
  // Convert everything to lowercase for easier comparison
  const userMessageLower = userMessage.toLowerCase();
  const aiResponseLower = aiResponse.toLowerCase();
  
  // Check if the AI response contains escalation phrases
  const escalationPhrases = [
    "connect you with a human",
    "escalate",
    "human agent",
    "i don't know",
    "i'm not sure",
    "i cannot provide",
    "i can't provide"
  ];
  
  for (const phrase of escalationPhrases) {
    if (aiResponseLower.includes(phrase)) {
      return true;
    }
  }
  
  // Check if the query is related to any FAQ
  let isRelatedToFAQ = false;
  for (const faq of faqs) {
    const questionLower = faq.question.toLowerCase();
    if (userMessageLower.includes(questionLower) || 
        questionLower.includes(userMessageLower) ||
        calculateSimilarity(userMessageLower, questionLower) > 0.5) {
      isRelatedToFAQ = true;
      break;
    }
  }
  
  // If not related to any FAQ, consider escalation
  if (!isRelatedToFAQ) {
    return true;
  }
  
  return false;
}

// Simple function to calculate text similarity
function calculateSimilarity(text1, text2) {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  
  return commonWords.length / Math.max(words1.length, words2.length);
}

module.exports = {
  generateResponse
};