/*
  # University Student Platform Database Schema

  1. New Tables
    - `profiles` - User profiles with preferences and academic info
    - `skills` - Master list of skills
    - `career_paths` - Available career paths
    - `quiz_categories` - Categories for skill assessments
    - `quiz_questions` - Questions for skill assessments
    - `quiz_attempts` - User quiz attempts and scores
    - `peer_questions` - Questions posted by students
    - `peer_answers` - Answers to peer questions
    - `faqs` - Dynamic FAQ system
    - `events` - University events
    - `event_subscriptions` - User event subscriptions
    - `chat_sessions` - AI chatbot sessions
    - `chat_messages` - Messages in chat sessions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure users can only access their own data where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  year_of_study integer,
  major text,
  interests text[],
  skills text[],
  career_preferences text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skills master table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create career paths table
CREATE TABLE IF NOT EXISTS career_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  required_skills text[],
  salary_range text,
  growth_outlook text,
  education_requirements text,
  created_at timestamptz DEFAULT now()
);

-- Create quiz categories table
CREATE TABLE IF NOT EXISTS quiz_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES quiz_categories(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  difficulty_level integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES quiz_categories(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  time_taken integer, -- in seconds
  answers jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create peer questions table
CREATE TABLE IF NOT EXISTS peer_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags text[],
  is_answered boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create peer answers table
CREATE TABLE IF NOT EXISTS peer_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES peer_questions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_accepted boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL,
  tags text[],
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL,
  date_time timestamptz NOT NULL,
  location text,
  capacity integer,
  tags text[],
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create event subscriptions table
CREATE TABLE IF NOT EXISTS event_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_user boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Skills policies (read-only for users)
CREATE POLICY "Skills are readable by authenticated users"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- Career paths policies (read-only for users)
CREATE POLICY "Career paths are readable by authenticated users"
  ON career_paths FOR SELECT
  TO authenticated
  USING (true);

-- Quiz categories policies (read-only for users)
CREATE POLICY "Quiz categories are readable by authenticated users"
  ON quiz_categories FOR SELECT
  TO authenticated
  USING (true);

-- Quiz questions policies (read-only for users)
CREATE POLICY "Quiz questions are readable by authenticated users"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

-- Quiz attempts policies
CREATE POLICY "Users can read own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Peer questions policies
CREATE POLICY "Peer questions are readable by authenticated users"
  ON peer_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert peer questions"
  ON peer_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own peer questions"
  ON peer_questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Peer answers policies
CREATE POLICY "Peer answers are readable by authenticated users"
  ON peer_answers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert peer answers"
  ON peer_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own peer answers"
  ON peer_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- FAQs policies (read-only for users)
CREATE POLICY "FAQs are readable by authenticated users"
  ON faqs FOR SELECT
  TO authenticated
  USING (true);

-- Events policies (read-only for users)
CREATE POLICY "Events are readable by authenticated users"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Event subscriptions policies
CREATE POLICY "Users can read own event subscriptions"
  ON event_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event subscriptions"
  ON event_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own event subscriptions"
  ON event_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can read own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can read messages from own sessions"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = session_id 
    AND chat_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages to own sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = session_id 
    AND chat_sessions.user_id = auth.uid()
  ));