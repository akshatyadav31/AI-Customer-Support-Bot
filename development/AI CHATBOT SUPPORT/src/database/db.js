const fs = require('fs').promises;
const path = require('path');

// Path to our JSON database file
const DB_PATH = path.join(__dirname, '../../data/conversations.json');
const FAQ_PATH = path.join(__dirname, '../../data/faqs.json');

// Initialize database if it doesn't exist
async function initializeDB() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, '../../data'), { recursive: true });
    
    // Check if conversations database exists
    try {
      await fs.access(DB_PATH);
    } catch (error) {
      // Create empty conversations database
      await fs.writeFile(DB_PATH, JSON.stringify({ conversations: {} }));
      console.log('Conversations database created');
    }
    
    // Check if FAQs database exists
    try {
      await fs.access(FAQ_PATH);
    } catch (error) {
      // Create sample FAQs database
      const sampleFaqs = {
        faqs: [
          {
            question: "What are your business hours?",
            answer: "Our business hours are Monday to Friday, 9 AM to 5 PM."
          },
          {
            question: "How do I reset my password?",
            answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page."
          },
          {
            question: "Do you offer refunds?",
            answer: "Yes, we offer refunds within 30 days of purchase."
          }
        ]
      };
      await fs.writeFile(FAQ_PATH, JSON.stringify(sampleFaqs, null, 2));
      console.log('Sample FAQs database created');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get conversation history for a session
async function getConversationHistory(sessionId) {
  try {
    await initializeDB();
    const data = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
    return data.conversations[sessionId] || [];
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw error;
  }
}

// Save conversation to database
async function saveConversation(sessionId, userMessage, aiResponse) {
  try {
    await initializeDB();
    const data = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
    
    // Initialize session if it doesn't exist
    if (!data.conversations[sessionId]) {
      data.conversations[sessionId] = [];
    }
    
    // Add messages to history
    data.conversations[sessionId].push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });
    
    data.conversations[sessionId].push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });
    
    // Save updated data
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

// Get all FAQs
async function getFAQs() {
  try {
    await initializeDB();
    const data = JSON.parse(await fs.readFile(FAQ_PATH, 'utf8'));
    return data.faqs || [];
  } catch (error) {
    console.error('Error getting FAQs:', error);
    throw error;
  }
}

module.exports = {
  initializeDB,
  getConversationHistory,
  saveConversation,
  getFAQs
};