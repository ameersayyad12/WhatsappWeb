import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { ChatWindow } from './components/ChatWindow';
const socket = io('https://your-backend.onrender.com');

function App() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetch('/api/chats')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({ _id: c._id, name: c.name }));
        setChats(formatted);
        if (formatted.length > 0) setSelectedChat(formatted[0]);
      });
  }, []);

  useEffect(() => {
    socket.on('new_message', () => {
      fetch('/api/chats').then(res => res.json()).then(/* update chats */);
    });
    return () => socket.off('new_message');
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 text-white flex flex-col">
        <div className="p-4 font-bold text-xl border-b">WhatsApp Clone</div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-700 ${
                selectedChat?._id === chat._id ? 'bg-gray-600' : ''
              }`}
            >
              <div className="font-medium">{chat.name}</div>
              <div className="text-sm opacity-80 truncate">Tap to chat</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default App;