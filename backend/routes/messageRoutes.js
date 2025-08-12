// backend/routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const {
  webhookHandler,
  getChats,
  getMessagesByWaId,
  sendMessage,
} = require('../controllers/messageController');

// Webhook endpoint
router.post('/webhook', webhookHandler);

// Get all chats
router.get('/chats', getChats);

// Get messages by wa_id
router.get('/messages/:wa_id', getMessagesByWaId);

// Send new message
router.post('/send', sendMessage);

module.exports = router;