import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader } from 'lucide-react'
import { ChatMessage, ChatSession } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { chatApi } from '../../services/api'
import { useRealtime } from '../../hooks/useRealtime'
import { formatDateTime } from '../../utils/helpers'
import Button from '../UI/Button'
import LoadingSpinner from '../UI/LoadingSpinner'

interface ChatInterfaceProps {
  session: ChatSession
  onSessionUpdate?: (session: ChatSession) => void
}

export default function ChatInterface({ session, onSessionUpdate }: ChatInterfaceProps) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [session.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time message updates
  useRealtime(
    'chat_messages',
    (payload) => {
      if (payload.new && payload.new.session_id === session.id) {
        setMessages(prev => [...prev, payload.new])
        if (!payload.new.is_user) {
          setIsTyping(false)
        }
      }
    },
    `session_id=eq.${session.id}`
  )

  const fetchMessages = async () => {
    try {
      const data = await chatApi.getMessages(session.id)
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !profile?.id) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setLoading(true)

    try {
      // Send user message
      await chatApi.sendMessage(session.id, messageContent, true)

      // Simulate AI typing
      setIsTyping(true)

      // Simulate AI response (replace with actual AI integration)
      setTimeout(async () => {
        const aiResponse = await generateAIResponse(messageContent)
        await chatApi.sendMessage(session.id, aiResponse, false)
        setIsTyping(false)
      }, 1500)

    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // This is a mock AI response. In a real application, you would integrate with
    // an AI service like OpenAI, Anthropic, or a custom model
    const responses = [
      "I understand you're asking about university programs. Let me help you with that information.",
      "That's a great question about campus life! Here's what I can tell you...",
      "For course information, I'd recommend checking with the academic advisor or the course catalog.",
      "Campus resources are available to help with that. Would you like me to provide more specific information?",
      "I can help you navigate the university system. What specific area would you like to know more about?"
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
              message.is_user ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.is_user 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-r from-green-500 to-blue-500'
              }`}>
                {message.is_user ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`rounded-lg p-3 ${
                message.is_user
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.is_user ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatDateTime(message.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
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
          <Button
            type="submit"
            disabled={!newMessage.trim() || loading}
            icon={loading ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}