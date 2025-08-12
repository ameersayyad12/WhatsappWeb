require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/messages', require('./routes/messageRoutes'));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('send_message', async (message) => {
    const newMsg = new Message(message);
    await newMsg.save();
    io.emit('new_message', newMsg); // broadcast to all
  });

  socket.on('update_status', async ({ id, status }) => {
    const updated = await Message.findByIdAndUpdate(id, { status }, { new: true });
    if (updated) io.emit('status_updated', updated);
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { io };