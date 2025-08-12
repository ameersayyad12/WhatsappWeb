function MessageBubble({ message }) {
  const isOutbound = message.direction === 'outbound';

  const statusIcon = {
    sent: '✔',
    delivered: '✔✔',
    read: <span className="text-blue-500">✔✔</span>
  };

  return (
    <div className={`mb-2 ${isOutbound ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
          isOutbound ? 'bg-green-500 text-white' : 'bg-white text-black'
        } shadow`}
      >
        {message.text}
        <div className="text-xs opacity-80 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isOutbound && <span className="ml-2">{statusIcon[message.status]}</span>}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;