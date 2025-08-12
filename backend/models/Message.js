const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  wa_id: String,
  name: String,
  text: String,
  type: { type: String, default: 'text' },
  timestamp: Date,
  direction: { type: String, enum: ['inbound', 'outbound'] },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
  message_id: String, 
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);