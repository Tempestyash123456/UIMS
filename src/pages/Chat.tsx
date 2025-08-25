import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { ChatSession } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { chatApi } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import ChatInterface from '../components/Chat/ChatInterface';
import EmptyState from '../components/UI/EmptyState';

export default function Chat() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const data = await chatApi.getSessions(profile.id);
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0]);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, selectedSession]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useRealtime(
    'chat_sessions',
    (payload) => {
      if (payload.new?.user_id === profile?.id) {
        if (payload.eventType === 'INSERT') {
          setSessions((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setSessions((prev) =>
            prev.map((session) => (session.id === payload.new.id ? payload.new : session))
          );
        } else if (payload.eventType === 'DELETE') {
          setSessions((prev) => prev.filter((session) => session.id !== payload.old.id));
          if (selectedSession?.id === payload.old.id) {
            setSelectedSession(sessions[0] || null);
          }
        }
      }
    },
    profile?.id ? `user_id=eq.${profile.id}` : undefined
  );

  const createNewSession = async () => {
    if (!profile?.id) return;
    try {
      const newSession = await chatApi.createSession(profile.id, 'New Chat');
      setSelectedSession(newSession);
    } catch (error) {
      console.error('Error creating chat session:', error);
    }
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await chatApi.deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
            </div>
            <Button onClick={createNewSession} size="sm" icon={<Plus className="w-4 h-4" />}>
              New
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Ask me anything about courses, programs, and campus life.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessions.length > 0 ? (
            sessions.map((session) => (
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
                    <p className="text-xs text-gray-500 mt-1">{formatDate(session.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => deleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3" />
              <p>No chat sessions yet.</p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {selectedSession ? (
          <ChatInterface
            session={selectedSession}
            onSessionUpdate={(updatedSession) => {
              setSessions((prev) =>
                prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
              );
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageCircle}
              title="Select a Chat"
              description="Select a chat from the sidebar or create a new one to get started."
              actionLabel="Create New Chat"
              onAction={createNewSession}
            />
          </div>
        )}
      </main>
    </div>
  );
}