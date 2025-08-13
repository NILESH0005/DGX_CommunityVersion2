import React, { useState } from 'react';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add user message
      setChatHistory([...chatHistory, { sender: 'user', text: message }]);
      
      // Add bot reply after a short delay
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          sender: 'bot', 
          text: "I'm your AI assistant. How can I help you with the LMS platform today?" 
        }]);
      }, 500);
      
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="w-96 bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200">
          {/* Chat Header */}
          <div className="bg-DGXblue text-white p-4 flex items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
              alt="Robot" 
              className="w-12 h-12 mr-3"
            />
            <h3 className="font-bold text-xl">LMS Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="ml-auto text-white hover:text-gray-200 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="h-80 p-5 overflow-y-auto bg-gray-50">
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
                  alt="Robot" 
                  className="w-20 h-20 mb-4"
                />
                <p className="text-lg">Hello! How can I help you today?</p>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs p-4 rounded-2xl text-lg ${msg.sender === 'user' 
                    ? 'bg-DGXblue text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t-2 border-gray-200 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 border-2 border-gray-300 rounded-l-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-DGXblue"
              />
              <button
                onClick={handleSendMessage}
                className="bg-DGXblue text-white px-6 py-3 rounded-r-xl hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-DGXblue text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all transform hover:scale-110 flex items-center justify-center"
        >
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
            alt="Robot" 
            className="w-16 h-16"
          />
        </button>
      )}
    </div>
  );
};

export default ChatBot;