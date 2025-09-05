// Core User and Profile Types
export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  year_of_study?: number;
  major?: string;
  interests?: string[];
  skills?: string[];
  career_preferences?: string[];
}

// Career and Skills Types
export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  required_skills?: string[];
  salary_range?: string;
  growth_outlook?: string;
  education_requirements?: string;
}

// New type for AI-powered recommendations
export interface AiCareerRecommendation {
  title: string;
  description: string;
  reasoning: string;
  suggested_skills_to_learn: string[];
}

// Quiz Types
export interface QuizCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface QuizQuestion {
  id: string;
  category_id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  category_id: string;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  created_at: string;
  quiz_categories?: { name: string };
}

// Peer Support Types
export interface PeerQuestion {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  upvotes: number;
  created_at: string;
  profiles?: { full_name: string };
}

export interface PeerAnswer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string };
}

// Other Content Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  view_count: number;
  is_featured: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  date_time: string;
  location?: string;
  capacity?: number;
  tags?: string[];
  image_url?: string;
}

export interface EventSubscription {
  id: string;
  event_id: string;
  user_id: string;
}

// Chat Types
export interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

// API and Component Prop Types
export interface DashboardStats {
  quizzes_taken: number;
  questions_asked: number;
  events_subscribed: number;
  chat_sessions: number;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'purple' | 'green' | 'orange';
  trend?: string;
}

export interface QuizState {
  currentQuestion: number;
  answers: Record<string, string>;
  timeStarted: number;
  isCompleted: boolean;
  score: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}