const Message = require('../models/Message');

const processPayload = async (payload) => {
  try {
    // Handle inbound messages
    if (payload.messages && payload.messages.length > 0) {
      const contact = payload.contacts[0];
      const wa_id = contact.wa_id;
      const name = contact.profile.name;

      for (let msg of payload.messages) {
        const { id, timestamp, text, type = 'text' } = msg;
        const messageText = text?.body || '[Unsupported media]';

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

    // Handle status updates
    if (payload.statuses && payload.statuses.length > 0) {
      for (let statusObj of payload.statuses) {
        for (let statusItem of statusObj.statuses) {
          const { id: msgId, status } = statusItem;

          await Message.findOneAndUpdate(
            { message_id: msgId },
            { status },
            { new: true }
          );
        }
      }
    }
  } catch (err) {
    console.error("Error processing payload:", err);
  }
};

module.exports = { processPayload };