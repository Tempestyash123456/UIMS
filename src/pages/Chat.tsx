import React, { useState, useEffect } from 'react'
import { MessageCircle, Plus, Trash2 } from 'lucide-react'
import { ChatSession } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { chatApi } from '../services/api'
import { useRealtime } from '../hooks/useRealtime'
import { formatDate } from '../utils/helpers'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import Button from '../components/UI/Button'
import ChatInterface from '../components/Chat/ChatInterface'
import EmptyState from '../components/UI/EmptyState'

export default function Chat() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  // Real-time session updates
  useRealtime(
    'chat_sessions',
    (payload) => {
      if (payload.new?.user_id === profile?.id) {
        if (payload.eventType === 'INSERT') {
          setSessions(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setSessions(prev => prev.map(session =>
            session.id === payload.new.id ? payload.new : session
          ))
        } else if (payload.eventType === 'DELETE') {
          setSessions(prev => prev.filter(session => session.id !== payload.old.id))
          if (selectedSession?.id === payload.old.id) {
            setSelectedSession(null)
          }
        }
      }
    },
    profile?.id ? `user_id=eq.${profile.id}` : undefined
  )

  const fetchSessions = async () => {
    if (!profile?.id) return

    try {
      const data = await chatApi.getSessions(profile.id)
      setSessions(data)
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0])
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewSession = async () => {
    if (!profile?.id) return

    try {
      const newSession = await chatApi.createSession(profile.id, 'New Chat')
      setSelectedSession(newSession)
    } catch (error) {
      console.error('Error creating chat session:', error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      // Note: In a real app, you'd have a delete API endpoint
      // For now, we'll just remove it from the local state
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      if (selectedSession?.id === sessionId) {
        setSelectedSession(sessions.length > 1 ? sessions[0] : null)
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
            </div>
            <Button
              onClick={createNewSession}
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              New Chat
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Ask me anything about courses, programs, and campus life
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No chat sessions yet</p>
              <Button onClick={createNewSession}>
                Start Your First Chat
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 group ${
                    selectedSession?.id === session.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {session.title || 'Untitled Chat'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(session.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSession(session.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <ChatInterface
            session={selectedSession}
            onSessionUpdate={(updatedSession) => {
              setSessions(prev => prev.map(session =>
                session.id === updatedSession.id ? updatedSession : session
              ))
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageCircle}
              title="No Chat Selected"
              description="Select a chat session from the sidebar or create a new one to get started."
              actionLabel="Create New Chat"
              onAction={createNewSession}
            />
          </div>
        )}
      </div>
    </div>
  )
}