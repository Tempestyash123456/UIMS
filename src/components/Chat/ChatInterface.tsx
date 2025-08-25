import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, Bot, User } from "lucide-react";
import { ChatMessage, ChatSession } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { chatApi } from "../../services/api";
import { useRealtime } from "../../hooks/useRealtime";
import { formatDateTime } from "../../utils/helpers";
import Button from "../UI/Button";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
interface ChatInterfaceProps {
  session: ChatSession;
  onSessionUpdate?: (session: ChatSession) => void;
}

export default function ChatInterface({
  session,
  onSessionUpdate,
}: ChatInterfaceProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await chatApi.getMessages(session.id);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [session.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // In src/components/Chat/ChatInterface.tsx

  //... inside the ChatInterface component

  useRealtime(
    "chat_messages",
    (payload) => {
      // LOG 1: See if the real-time message arrives
      console.log("Real-time payload received:", payload);

      if (payload.new && payload.new.session_id === session.id) {
        setMessages((prev) => [...prev, payload.new]);
        if (!payload.new.is_user) {
          setIsTyping(false);
        }
      }
    },
    `session_id=eq.${session.id}`
  );

  // In src/components/Chat/ChatInterface.tsx

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      // Optimistically add the user's message to the UI
      const userMessage = await chatApi.sendMessage(
        session.id,
        messageContent,
        true
      );
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Get the AI response
      const { response: aiResponse, error: aiError } =
        await chatApi.getAiResponse(messageContent);
      setIsTyping(false);

      if (aiError || !aiResponse) {
        toast.error(
          aiError || "Failed to get a response from the AI assistant."
        );
        const errorMessage = await chatApi.sendMessage(
          session.id,
          "Sorry, I couldn't process that request.",
          false
        );
        setMessages((prev) => [...prev, errorMessage]); // Add error message to UI
        return;
      }

      // Optimistically add the AI's message to the UI
      const aiMessage = await chatApi.sendMessage(
        session.id,
        aiResponse,
        false
      );
      setMessages((prev) => [...prev, aiMessage]);

      onSessionUpdate?.(session);
    } catch (error) {
      setIsTyping(false);
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending your message.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-2 w-full ${
              message.is_user ? "justify-end" : "justify-start"
            }`}
          >
            {/* AI Avatar */}
            {!message.is_user && (
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Message Bubble and Timestamp */}
            <div
              className={`flex flex-col max-w-xs lg:max-w-md ${
                message.is_user ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-4 ${
                  message.is_user
                    ? "rounded-t-2xl rounded-l-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "rounded-t-2xl rounded-r-2xl bg-white text-gray-800 shadow-md"
                }`}
              >
                <div
                  className={`prose prose-sm max-w-full ${
                    message.is_user && "prose-invert"
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 px-1">
                {formatDateTime(message.created_at)}
              </p>
            </div>

            {/* User Avatar */}
            {message.is_user && (
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask me anything about courses, programs, or campus life..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <Button type="submit" loading={loading} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
