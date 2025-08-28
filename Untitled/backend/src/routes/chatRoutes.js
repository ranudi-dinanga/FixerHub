const express = require('express');
const router = express.Router();
const { handleChatMessage, getConversationHistory, clearConversation } = require('../controllers/chatController');

// POST /api/chat/message - Send a message to the chatbot
router.post('/message', handleChatMessage);

// GET /api/chat/history - Get conversation history
router.get('/history', getConversationHistory);

// DELETE /api/chat/clear - Clear conversation history
router.delete('/clear', clearConversation);

module.exports = router;
