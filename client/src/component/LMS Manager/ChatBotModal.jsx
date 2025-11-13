import React, { useState, useEffect, useContext } from "react";
import { FiSend, FiX } from "react-icons/fi";
import ApiContext from "../../context/ApiContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatBotModal = ({ isOpen, onClose }) => {
  const { fetchData } = useContext(ApiContext);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi there! How can I help you with your learning modules?",
    },
  ]);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [pdfIds, setPdfIds] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchPdfIds = async () => {
      const response = await fetchData("lms/getAllActiveFiles", "GET");
      if (response?.success) {
        const ids = response.data
          .filter((f) => f.FileType !== "link")
          .map((f) => f.FileID);
        setPdfIds(ids);
      }
    };
    fetchPdfIds();
  }, []);

  const handleSend = async () => {
  if (!input.trim()) return;

  const newMessage = { from: "user", text: input };
  setMessages((prev) => [...prev, newMessage]);
  setInput("");

  const processingMessage = { from: "bot", text: "🤖 I'm processing your query..." };
  setMessages((prev) => [...prev, processingMessage]);

  const body = {
    question: input,
    pdf_ids: pdfIds.map(String),
    chat_history: chatHistory || [],
    user_id: user?.UserID?.toString() || "0",
    organization_id: "GI",
    platform: "DGX_Community_LMS",
  };

  try {
    const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL;
    console.log("Chatbot API URL:", CHATBOT_API_URL); // ✅ Optional check

    const res = await fetch(`${CHATBOT_API_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data?.chat_history) setChatHistory(data.chat_history);

    const botReply = data?.answer || "Sorry, I couldn't fetch a response.";

    setMessages((prev) =>
      prev.map((m) =>
        m.text === processingMessage.text ? { from: "bot", text: botReply } : m
      )
    );
  } catch (error) {
    console.error("Chat API error:", error);
    setMessages((prev) =>
      prev.map((m) =>
        m.text === processingMessage.text
          ? { from: "bot", text: "❌ Something went wrong. Try again later." }
          : m
      )
    );
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-end bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl w-[380px] h-[520px] m-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-indigo-700">
            Learning Assistant
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.from === "user"
                  ? "bg-indigo-600 text-white self-end ml-auto max-w-[80%]"
                  : "bg-gray-50 border border-gray-200 text-gray-800 max-w-[80%]"
              }`}
            >
              {msg.from === "bot" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="mb-2" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong
                        className="text-indigo-700 font-semibold"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="list-disc ml-5 mb-1" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-indigo-700 font-bold text-sm mb-1"
                        {...props}
                      />
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded"
                        {...props}
                      />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-indigo-600 underline hover:text-indigo-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}
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
