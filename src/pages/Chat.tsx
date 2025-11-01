import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Plus, Trash2, Edit } from 'lucide-react';
import { ChatSession } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { chatApi } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import ChatInterface from '../components/Chat/ChatInterface';
import { EmptyState } from '../components/UI/EmptyState';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import toast from 'react-hot-toast';

export default function Chat() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const fetchSessions = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const data = await chatApi.getSessions(profile.id);
      setSessions(data);
      if (data.length > 0) {
        if (!selectedSession || !data.some(s => s.id === selectedSession.id)) {
          setSelectedSession(data[0]);
        }
      } else {
        setSelectedSession(null);
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

  const handleRealtimeEvent = useCallback((payload: any) => {
    
    // We use a temporary variable for the next selected session, updated in place.
    let nextSelectedSession = selectedSession;

    setSessions(prevSessions => {
      let newSessions = [...prevSessions];

      switch (payload.eventType) {
        case 'INSERT':
          newSessions = [payload.new, ...prevSessions];
          nextSelectedSession = payload.new;
          break;
          
        case 'UPDATE':
          newSessions = prevSessions.map(s => (s.id === payload.new.id ? payload.new : s));
          if (nextSelectedSession?.id === payload.new.id) {
            nextSelectedSession = payload.new;
          }
          break;
          
        case 'DELETE':
          newSessions = prevSessions.filter(s => s.id !== payload.old.id);
          
          if (selectedSession?.id === payload.old.id) {
            // Find the index of the deleted item in the original (prevSessions) list
            const deletedIndex = prevSessions.findIndex(s => s.id === payload.old.id);
            
            // 🚨 CRITICAL FIX: Select the session at the same index in the new list.
            // If that index is out of bounds (because it was the last item), select the last item in the new list.
            // If the list is empty, nextSelectedSession will be null.
            if (newSessions.length > 0) {
              const newIndex = Math.min(deletedIndex, newSessions.length - 1);
              nextSelectedSession = newSessions[newIndex];
            } else {
              nextSelectedSession = null;
            }
          }
          break;
        default:
          return prevSessions;
      }
      
      // Update the selected session immediately after session list is calculated.
      setSelectedSession(nextSelectedSession);
      
      return newSessions;
    });

  }, [selectedSession]); // We need selectedSession to know if the deleted session was the current one

  useRealtime(
    'chat_sessions',
    handleRealtimeEvent,
    profile?.id ? `user_id=eq.${profile.id}` : undefined
  );

  const createNewSession = async () => {
    if (!profile?.id) return;
    try {
      const newSession = await chatApi.createSession(profile.id, 'New Chat');
      setSelectedSession(newSession);
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to create new chat.');
    }
  };

  const handleDeleteRequest = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
    setIsModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await chatApi.deleteSession(sessionToDelete);
      toast.success('Chat session deleted successfully');
      // The realtime listener handles the UI removal and selection change instantly.
    } catch (error) {
      toast.error('Failed to delete chat session.');
    } finally {
      setIsModalOpen(false);
      setSessionToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleEdit = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setNewTitle(session.title || '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleTitleUpdate = async (sessionId: string) => {
    if (!newTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await chatApi.updateSession(sessionId, newTitle);
      toast.success('Session title updated!');
    } catch (error) {
      toast.error('Failed to update title.');
    } finally {
      setEditingSessionId(null);
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
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteSession}
        title="Delete Chat Session"
        message="Are you sure you want to delete this chat session? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">
                  AI Assistant
                </h2>
              </div>
              <Button
                onClick={createNewSession}
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                New
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Ask me anything about courses, programs, and campus life.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                    {editingSessionId === session.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={handleTitleChange}
                        onBlur={() => handleTitleUpdate(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleTitleUpdate(session.id);
                          } else if (e.key === 'Escape') {
                            setEditingSessionId(null);
                          }
                        }}
                        className="text-sm font-medium text-gray-900 truncate w-full p-1 -m-1 bg-white border border-blue-300 rounded"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3
                        className="text-sm font-medium text-gray-900 truncate"
                        onDoubleClick={() => handleEdit(session)}
                      >
                        {session.title || 'Untitled Chat'}
                      </h3>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(session.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(session) }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600"
                      aria-label="Edit title"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteRequest(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600"
                       aria-label="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {selectedSession ? (
            <ChatInterface
              session={selectedSession}
              onSessionUpdate={(updatedSession) => {
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === updatedSession.id ? updatedSession : s
                  )
                );
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageCircle}
                title="No Chats Available"
                description="Create a new chat to get started with the AI assistant."
                actionLabel="Create New Chat"
                onAction={createNewSession}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}