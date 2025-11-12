// ChatBotModal.jsx
import React, { useState } from "react";
import { FiSend, FiX } from "react-icons/fi";

const ChatBotModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi there! How can I help you with your learning modules?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate bot response (replace with API later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "🤖 I'm processing your query... (AI reply here)" },
      ]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-end bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl w-[380px] h-[520px] m-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-indigo-700">Learning Assistant</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FiX size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl text-sm ${
                msg.from === "user"
                  ? "bg-indigo-600 text-white self-end ml-auto max-w-[80%]"
                  : "bg-gray-100 text-gray-800 max-w-[80%]"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 flex items-center">
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotModal;
