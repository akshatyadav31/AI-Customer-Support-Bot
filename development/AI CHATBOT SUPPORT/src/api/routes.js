const express = require('express');
const router = express.Router();
const { generateResponse } = require('../models/ai');
const { saveConversation, getConversationHistory } = require('../database/db');

// Get conversation history
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await getConversationHistory(sessionId);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process new message
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID and message are required' 
      });
    }

    // Get conversation history
    const history = await getConversationHistory(sessionId);
    
    // Generate AI response
    const aiResponse = await generateResponse(message, history);
    
    // Save the conversation
    await saveConversation(sessionId, message, aiResponse);
    
    res.json({ 
      success: true, 
      response: aiResponse 
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      needsEscalation: true 
    });
  }
});

module.exports = router;