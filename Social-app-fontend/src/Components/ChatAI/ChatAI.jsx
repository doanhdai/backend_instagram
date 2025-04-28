import React, { useState, useEffect, useRef } from "react";
import { BsChatSquareDots } from "react-icons/bs";
import { getChatAI } from "../../Service/ChatAIApi";
import { IoSend } from "react-icons/io5";
const ChatAI = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "You", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getChatAI(input);
      setMessages((prev) => [...prev, { sender: "AI", text: response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Error occurred. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Icon chat nổi */}
      <div
        className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <BsChatSquareDots size={20} />
      </div>

      {/* Cửa sổ chat */}
      {isChatOpen && (
        <div className="w-80 sm:w-96 h-[600px] bg-black text-white rounded-xl shadow-xl flex flex-col absolute bottom-14 right-0 animate-slide-in">
          <div className="p-4 bg-gray-900 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-4">
              <img
                src={
                  "https://phongvu.vn/cong-nghe/wp-content/uploads/2024/11/google-gemini-gap-su-co-thumb.jpg"
                }
                alt={"ai"}
                className="w-12 h-12 object-cover rounded-full"
              />
              <span className="text-lg font-bold">Chat with AI</span>
            </div>

            <button
              className="text-2xl text-white hover:text-gray-300"
              onClick={() => setIsChatOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-black">
            {messages.map((msg, index) => (
              <div
                key={index}
                y
                className={`mb-4 p-3 rounded-lg max-w-[80%] w-fit break-words whitespace-pre-wrap ${
                  msg.sender.toLowerCase() === "you"
                    ? "bg-blue-500 text-white ml-auto text-right"
                    : "bg-gray-700 text-white mr-auto text-left"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div>
                <div className="mb-4 p-3 rounded-lg max-w-[80%] bg-gray-700 text-white mr-auto text-left">
                  AI is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex p-4 border-t border-gray-700 bg-black">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
              className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-full px-4 py-2 outline-none placeholder-gray-400 disabled:bg-gray-600"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="ml-3 bg-blue-500 text-white px-3 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              <IoSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAI;
