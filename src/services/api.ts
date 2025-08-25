import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Profile,
  CareerPath,
  QuizCategory,
  QuizQuestion,
  QuizAttempt,
  PeerQuestion,
  PeerAnswer,
  Event,
  EventSubscription,
  FAQ,
  ChatSession,
  ChatMessage,
  DashboardStats,
} from '../types';
import toast from 'react-hot-toast';

const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  toast.error(`An error occurred in ${context}.`);
  throw error;
};

// A generic function to fetch data from Supabase
const fromSupabase = async (query: any, context: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }
  const { data, error } = await query;
  if (error) {
    handleError(error, context);
  }
  return data;
};

export const profileApi = {
  getProfile: (userId: string) =>
    fromSupabase(
      supabase.from('profiles').select('*').eq('id', userId).single(),
      'fetching profile'
    ),

  updateProfile: (userId: string, updates: Partial<Profile>) =>
    fromSupabase(
      supabase.from('profiles').update(updates).eq('id', userId),
      'updating profile'
    ),
};

export const careerApi = {
  getCareerPaths: (): Promise<CareerPath[]> =>
    fromSupabase(supabase.from('career_paths').select('*'), 'fetching career paths'),
};

export const quizApi = {
  getCategories: (): Promise<QuizCategory[]> =>
    fromSupabase(supabase.from('quiz_categories').select('*'), 'fetching quiz categories'),

  getQuestions: (categoryId: string): Promise<QuizQuestion[]> =>
    fromSupabase(
      supabase.from('quiz_questions').select('*').eq('category_id', categoryId),
      'fetching quiz questions'
    ),

  saveAttempt: (attempt: Omit<QuizAttempt, 'id' | 'created_at'>) =>
    fromSupabase(supabase.from('quiz_attempts').insert([attempt]), 'saving quiz attempt'),

  getUserAttempts: (userId: string): Promise<QuizAttempt[]> =>
    fromSupabase(
      supabase.from('quiz_attempts').select('*, quiz_categories(name)').eq('user_id', userId),
      'fetching user attempts'
    ),
};

export const peerApi = {
  getQuestions: (): Promise<PeerQuestion[]> =>
    fromSupabase(
      supabase.from('peer_questions').select('*, profiles(full_name)').order('created_at', { ascending: false }),
      'fetching peer questions'
    ),
  createQuestion: (question: Partial<PeerQuestion>) =>
    fromSupabase(supabase.from('peer_questions').insert([question]), 'creating peer question'),
  getAnswers: (questionId: string): Promise<PeerAnswer[]> =>
    fromSupabase(
      supabase.from('peer_answers').select('*, profiles(full_name)').eq('question_id', questionId),
      'fetching peer answers'
    ),
  createAnswer: (answer: Partial<PeerAnswer>) =>
    fromSupabase(supabase.from('peer_answers').insert([answer]), 'creating peer answer'),
  upvoteQuestion: (questionId: string) =>
    fromSupabase(supabase.rpc('upvote_question', { question_id: questionId }), 'upvoting question'),
};

export const dashboardApi = {
  getStats: (userId: string): Promise<DashboardStats> =>
    fromSupabase(supabase.rpc('get_dashboard_stats', { user_id: userId }), 'fetching dashboard stats'),
  getRecentActivity: (userId: string): Promise<QuizAttempt[]> =>
    fromSupabase(
      supabase.from('quiz_attempts').select('*, quiz_categories(name)').eq('user_id', userId).limit(5),
      'fetching recent activity'
    ),
};

export const eventsApi = {
  getEvents: (): Promise<Event[]> =>
    fromSupabase(supabase.from('events').select('*').order('date_time'), 'fetching events'),
  subscribeToEvent: (eventId: string, userId: string) =>
    fromSupabase(
      supabase.from('event_subscriptions').insert([{ event_id: eventId, user_id: userId }]),
      'subscribing to event'
    ),
  unsubscribeFromEvent: (subscriptionId: string) =>
    fromSupabase(
      supabase.from('event_subscriptions').delete().eq('id', subscriptionId),
      'unsubscribing from event'
    ),
  getUserSubscriptions: (userId: string): Promise<EventSubscription[]> =>
    fromSupabase(
      supabase.from('event_subscriptions').select('*').eq('user_id', userId),
      'fetching user subscriptions'
    ),
};

export const faqApi = {
  getFAQs: (category?: string): Promise<FAQ[]> =>
    fromSupabase(
      supabase.from('faqs').select('*').order('view_count', { ascending: false }),
      'fetching FAQs'
    ),
  incrementViewCount: (faqId: string) =>
    fromSupabase(supabase.rpc('increment_faq_views', { faq_id: faqId }), 'incrementing FAQ view count'),
  searchFAQs: (searchTerm: string): Promise<FAQ[]> =>
    fromSupabase(
      supabase.from('faqs').select('*').textSearch('question', searchTerm),
      'searching FAQs'
    ),
};

export const chatApi = {
  getSessions: (userId: string): Promise<ChatSession[]> =>
    fromSupabase(supabase.from('chat_sessions').select('*').eq('user_id', userId), 'fetching chat sessions'),
  createSession: (userId: string, title?: string): Promise<ChatSession> =>
    fromSupabase(
      supabase.from('chat_sessions').insert([{ user_id: userId, title }]).select().single(),
      'creating chat session'
    ),
  deleteSession: (sessionId: string) =>
    fromSupabase(supabase.from('chat_sessions').delete().eq('id', sessionId), 'deleting chat session'),
  getMessages: (sessionId: string): Promise<ChatMessage[]> =>
    fromSupabase(
      supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at'),
      'fetching chat messages'
    ),
  sendMessage: (sessionId: string, content: string, isUser: boolean) =>
    fromSupabase(
      supabase.from('chat_messages').insert([{ session_id: sessionId, content, is_user: isUser }]),
      'sending message'
    ),
};