import React, { useState, useEffect, useContext } from "react";
import { FiSend, FiX, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import ApiContext from "../../context/ApiContext";
import remarkGfm from "remark-gfm";

const ChatBotModal = ({ isOpen, onClose }) => {
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [pdfIds, setPdfIds] = useState([]);
  const [aiReplies, setAiReplies] = useState({});
  const [aiLoadingId, setAiLoadingId] = useState(null);
  const [chatHistoryMap, setChatHistoryMap] = useState({});

  // Initialize messages based on login status
  useEffect(() => {
    if (isOpen) {
      if (userToken && user) {
        const username = user.Name || user.username || "Learner";
        setMessages([
          {
            from: "bot",
            text: `👋 **Hi ${username}!** How can I help you with your learning modules?`,
          },
        ]);
      } else {
        setMessages([
          {
            from: "bot",
            text: "🔒 **Please log in to chat**\n\nYou need to be logged in to use the Learning Assistant. Please log in to get help with your study modules.",
          },
        ]);
      }
    }
  }, [isOpen, userToken, user]);

  useEffect(() => {
    const fetchPdfIds = async () => {
      try {
        const response = await fetchData("lms/getAllActiveFiles", "GET");
        if (response?.success) {
          const ids = response.data
            .filter((f) => f.FileType !== "link")
            .map((f) => f.FileID);
          setPdfIds(ids);
        }
      } catch (error) {
        console.error("Error fetching PDF IDs:", error);
      }
    };

    if (isOpen && userToken) {
      fetchPdfIds();
    }
  }, [isOpen, fetchData, userToken]);

  const handleSend = async () => {
    if (!input.trim() || !userToken) return;
    

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const processingMessage = {
      from: "bot",
      text: "🤖 *I'm processing your query...*",
    };
    setMessages((prev) => [...prev, processingMessage]);

    const body = {
      question: input,
      pdf_ids: pdfIds.map(String),
      chat_history: chatHistory || [],
      user_id: user?.UserID?.toString() || user?.uniqueId?.toString() || "0",
      organization_id: "GI",
      platform: "DGX_Community_LMS",
    };

    console.log("Sending body to /ask endpoint:", body);

    try {
      const CHATBOT_API = import.meta.env.VITE_CHATBOT_API_URL;

      const res = await fetch(`${CHATBOT_API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data?.chat_history) {
        setChatHistory(data.chat_history);
      }

      const botReply =
        data?.answer ||
        "❌ Sorry, I couldn't generate a response based on the available content. Please try rephrasing your question or ask about something from your study modules.";

      // Replace "processing" message with bot reply
      setMessages((prev) =>
        prev.map((m) =>
          m.text === processingMessage.text
            ? { from: "bot", text: botReply }
            : m,
        ),
      );
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.text === processingMessage.text
            ? {
                from: "bot",
                text: "⚠️ **Connection Error.** Please check your connection and try again later.",
              }
            : m,
        ),
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen) return null;

  const modalStyles = {
    normal: "w-[380px] h-[520px] m-6",
    expanded: "w-[90vw] h-[90vh] m-4 max-w-6xl",
  };

  return (
    <div className="fixed inset-0 flex items-end justify-end bg-black/20 backdrop-blur-sm z-50">
      <div
        className={`bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl flex flex-col transition-all duration-300 ${
          isExpanded ? modalStyles.expanded : modalStyles.normal
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-indigo-700">
            Learning Assistant
          </h2>
          <div className="flex items-center gap-2">
            {/* Expand/Collapse Button */}
            <button
              onClick={toggleExpand}
              className="text-gray-500 hover:text-indigo-600 transition-colors duration-200 p-1"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <FiMinimize2 size={16} />
              ) : (
                <FiMaximize2 size={16} />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition-colors duration-200 p-1"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-xl text-sm max-w-[80%] ${
                  msg.from === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {/* Render Markdown only for bot messages */}
                {msg.from === "bot" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1">{children}</p>,
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-2">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 flex items-center">
          <input
            type="text"
            placeholder={
              userToken
                ? "Ask about your study modules..."
                : "Please log in to chat with the Learning Assistant"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!userToken}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !userToken}
            className="ml-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            <FiSend size={18} />
          </button>
        </div>

        {/* Login Prompt for non-logged in users */}
        {!userToken && (
          <div className="px-3 pb-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-yellow-800 text-sm font-medium">
                🔒 Login required to use Learning Assistant
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBotModal;
