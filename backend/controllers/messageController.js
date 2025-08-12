// backend/controllers/messageController.js

const Message = require('../models/Message');

// Process incoming webhook payload
exports.webhookHandler = async (req, res) => {
  try {
    const payload = req.body;

    // Handle inbound messages
    if (payload.entry?.[0]?.changes?.[0]?.value?.messages) {
      const value = payload.entry[0].changes[0].value;
      const wa_id = value.contacts[0].wa_id;
      const name = value.contacts[0].profile.name;

      for (const msg of value.messages) {
        const { id, timestamp, type, text } = msg;
        const messageText = text?.body || `[${type}]`;

        await Message.findOneAndUpdate(
          { message_id: id },
          {
            wa_id,
            name,
            text: messageText,
            type,
            timestamp: new Date(timestamp * 1000),
            direction: 'inbound',
            message_id: id,
          },
          { upsert: true, new: true }
        );
      }
    }

    // Handle status updates (sent, delivered, read)
    if (payload.entry?.[0]?.changes?.[0]?.value?.statuses) {
      const value = payload.entry[0].changes[0].value;

      for (const statusItem of value.statuses) {
        const { id, status } = statusItem;

        await Message.findOneAndUpdate(
          { message_id: id },
          { status },
          { new: true }
        );
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Error in webhookHandler:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all chats grouped by wa_id
exports.getChats = async (req, res) => {
  try {
    const chats = await Message.aggregate([
      { $sort: { timestamp: 1 } },
      {
        $group: {
          _id: '$wa_id',
          name: { $first: '$name' },
          messages: { $push: '$$ROOT' }
        }
      }
    ]);
    res.json(chats);
  } catch (err) {
    console.error('Error in getChats:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// Get messages by wa_id
exports.getMessagesByWaId = async (req, res) => {
  try {
    const { wa_id } = req.params;
    const messages = await Message.find({ wa_id }).sort('timestamp');
    res.json(messages);
  } catch (err) {
    console.error('Error in getMessagesByWaId:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a new outbound message
exports.sendMessage = async (req, res) => {
  try {
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

    // Emit real-time event via Socket.IO
    if (global.io) {
      global.io.emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};