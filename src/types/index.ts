// Core application types
export interface User {
  id: string
  email: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  year_of_study?: number
  major?: string
  interests?: string[]
  skills?: string[]
  career_preferences?: string[]
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  description?: string
  created_at: string
}

export interface CareerPath {
  id: string
  title: string
  description: string
  required_skills?: string[]
  salary_range?: string
  growth_outlook?: string
  education_requirements?: string
  created_at: string
}

export interface QuizCategory {
  id: string
  name: string
  description?: string
  icon?: string
  created_at: string
}

export interface QuizQuestion {
  id: string
  category_id: string
  question: string
  options: Record<string, string>
  correct_answer: string
  explanation?: string
  difficulty_level: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  category_id: string
  score: number
  total_questions: number
  time_taken?: number
  answers?: any
  created_at: string
  quiz_categories?: QuizCategory
}

export interface PeerQuestion {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  tags?: string[]
  is_answered: boolean
  upvotes: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface PeerAnswer {
  id: string
  question_id: string
  user_id: string
  content: string
  is_accepted: boolean
  upvotes: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags?: string[]
  view_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  event_type: string
  date_time: string
  location?: string
  capacity?: number
  tags?: string[]
  image_url?: string
  is_active: boolean
  created_at: string
}

export interface EventSubscription {
  id: string
  user_id: string
  event_id: string
  notification_sent: boolean
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  title?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  content: string
  is_user: boolean
  created_at: string
}

// UI Component Props
export interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo'
  trend?: string
}

export interface QuizState {
  currentQuestion: number
  answers: Record<string, string>
  timeStarted: number
  isCompleted: boolean
  score: number
}

// API Response types
export interface DashboardStats {
  quizzesTaken: number
  questionsAsked: number
  eventsSubscribed: number
  chatSessions: number
}