import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import MessageBubble from './MessageBubble';

const socket = io('https://whatsapp-clone-backend-lint.onrender.com');

function ChatWindow({ chat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef();

  useEffect(() => {
    if (chat?._id) {
      fetch(`/api/messages/${chat._id}`)
        .then(res => res.json())
        .then(data => setMessages(data));
    }
  }, [chat]);

  useEffect(() => {
    socket.on('new_message', (msg) => {
      if (msg.wa_id === chat._id) setMessages(prev => [...prev, msg]);
    });
    return () => socket.off('new_message');
  }, [chat]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const payload = {
      wa_id: chat._id,
      name: 'You',
      text: input,
    };
    fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 flex items-center">
        <img src="https://via.placeholder.com/40" alt="Avatar" className="rounded-full mr-3" />
        <div>
          <div className="font-semibold">{chat?.name}</div>
          <div className="text-xs text-gray-300">online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t">
        <div className="flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border rounded-l-full py-2 px-4 focus:outline-none"
            placeholder="Type a message"
          />
          <button
            onClick={sendMessage}
            className="bg-green-500 text-white px-6 rounded-r-full hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
export default ChatWindow;