import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { ChatMessage, ChatSession } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { chatApi } from '../../services/api';
import { useRealtime } from '../../hooks/useRealtime';
import { formatDateTime } from '../../utils/helpers';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

interface ChatInterfaceProps {
  session: ChatSession;
  onSessionUpdate?: (session: ChatSession) => void;
}

export default function ChatInterface({ session, onSessionUpdate }: ChatInterfaceProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await chatApi.getMessages(session.id);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [session.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useRealtime(
    'chat_messages',
    (payload) => {
      if (payload.new && payload.new.session_id === session.id) {
        setMessages((prev) => [...prev, payload.new]);
        if (!payload.new.is_user) {
          setIsTyping(false);
        }
      }
    },
    `session_id=eq.${session.id}`
  );

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      await chatApi.sendMessage(session.id, messageContent, true);
      setIsTyping(true);

      // Simulate AI response
      setTimeout(async () => {
        const aiResponse = `This is a simulated response to: "${messageContent}"`;
        await chatApi.sendMessage(session.id, aiResponse, false);
        onSessionUpdate?.(session);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                message.is_user ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.is_user
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gradient-to-r from-green-500 to-blue-500'
                }`}
              >
                {message.is_user ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`rounded-lg p-3 ${
                  message.is_user
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.is_user ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatDateTime(message.created_at)}
                </p>
              </div>
            </div>
          </div>
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