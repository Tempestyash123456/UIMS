import { supabase, isSupabaseConfigured } from '../lib/supabase'
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
  DashboardStats 
} from '../types'

// Profile API
export const profileApi = {
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  }
}

// Career API
export const careerApi = {
  async getCareerPaths(): Promise<CareerPath[]> {
    const { data, error } = await supabase
      .from('career_paths')
      .select('*')
      .order('title')

    if (error) throw error
    return data || []
  }
}

// Quiz API
export const quizApi = {
  async getCategories(): Promise<QuizCategory[]> {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async getQuestions(categoryId: string): Promise<QuizQuestion[]> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('difficulty_level')

    if (error) throw error
    return data || []
  },

  async saveAttempt(attempt: Omit<QuizAttempt, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('quiz_attempts')
      .insert([attempt])

    if (error) throw error
  },

  async getUserAttempts(userId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quiz_categories (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Peer Support API
export const peerApi = {
  async getQuestions(): Promise<PeerQuestion[]> {
    const { data, error } = await supabase
      .from('peer_questions')
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createQuestion(question: Omit<PeerQuestion, 'id' | 'created_at' | 'updated_at' | 'is_answered' | 'upvotes' | 'profiles'>): Promise<void> {
    const { error } = await supabase
      .from('peer_questions')
      .insert([question])

    if (error) throw error
  },

  async getAnswers(questionId: string): Promise<PeerAnswer[]> {
    const { data, error } = await supabase
      .from('peer_answers')
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .eq('question_id', questionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createAnswer(answer: Omit<PeerAnswer, 'id' | 'created_at' | 'updated_at' | 'is_accepted' | 'upvotes' | 'profiles'>): Promise<void> {
    const { error } = await supabase
      .from('peer_answers')
      .insert([answer])

    if (error) throw error
  },

  async upvoteQuestion(questionId: string, currentUpvotes: number): Promise<void> {
    const { error } = await supabase
      .from('peer_questions')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', questionId)

    if (error) throw error
  }
}

// Dashboard API
export const dashboardApi = {
  async getStats(userId: string): Promise<DashboardStats> {
    const [quizAttempts, peerQuestions, eventSubs, chatSessions] = await Promise.all([
      supabase.from('quiz_attempts').select('id').eq('user_id', userId),
      supabase.from('peer_questions').select('id').eq('user_id', userId),
      supabase.from('event_subscriptions').select('id').eq('user_id', userId),
      supabase.from('chat_sessions').select('id').eq('user_id', userId)
    ])

    return {
      quizzesTaken: quizAttempts.data?.length || 0,
      questionsAsked: peerQuestions.data?.length || 0,
      eventsSubscribed: eventSubs.data?.length || 0,
      chatSessions: chatSessions.data?.length || 0
    }
  },

  async getRecentActivity(userId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        id,
        score,
        total_questions,
        created_at,
        quiz_categories (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) throw error
    return data || []
  }
}
// Events API
export const eventsApi = {
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date_time', { ascending: true })

    if (error) throw error
    return data || []
  },

  async subscribeToEvent(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_subscriptions')
      .insert([{ event_id: eventId, user_id: userId }])

    if (error) throw error
  },

  async unsubscribeFromEvent(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_subscriptions')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async getUserSubscriptions(userId: string): Promise<EventSubscription[]> {
    const { data, error } = await supabase
      .from('event_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  }
}

// FAQ API
export const faqApi = {
  async getFAQs(category?: string): Promise<FAQ[]> {
    let query = supabase
      .from('faqs')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('view_count', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async incrementViewCount(faqId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_faq_views', {
      faq_id: faqId
    })

    if (error) throw error
  },

  async searchFAQs(searchTerm: string): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      .order('view_count', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Chat API
export const chatApi = {
  async getSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createSession(userId: string, title?: string): Promise<ChatSession> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ user_id: userId, title }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async sendMessage(sessionId: string, content: string, isUser: boolean): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        content,
        is_user: isUser
      }])

    if (error) throw error

    // Update session timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)
  }
}