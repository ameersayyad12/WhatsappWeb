const express = require('express');
const router = express.Router();
const { processPayload } = require('../utils/payloadProcessor');
const Message = require('../models/Message');

// Webhook endpoint
router.post('/webhook', async (req, res) => {
  await processPayload(req.body);
  res.status(200).send('OK');
});

// Get all chats grouped by wa_id
router.get('/chats', async (req, res) => {
  const result = await Message.aggregate([
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: "$wa_id",
        name: { $first: "$name" },
        messages: { $push: "$$ROOT" }
      }
    }
  ]);
  res.json(result);
});

// Get messages by wa_id
router.get('/messages/:wa_id', async (req, res) => {
  const messages = await Message.find({ wa_id: req.params.wa_id }).sort('timestamp');
  res.json(messages);
});

// Send new message (outbound)
router.post('/send', async (req, res) => {
  const { wa_id, name, text } = req.body;
  const message = new Message({
    wa_id,
    name,
    text,
    direction: 'outbound',
    status: 'sent',
    timestamp: new Date(),
  });
  await message.save();
  global.io.emit('new_message', message); // Real-time
  res.status(201).json(message);
});

module.exports = router;