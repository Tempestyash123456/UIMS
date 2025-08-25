/*
  # Add Real-time Features and Additional Tables

  1. New Tables
    - `notifications` - User notifications system
    - Add RPC functions for FAQ view counting

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for real-time features

  3. Real-time Setup
    - Enable real-time for relevant tables
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RPC function to increment FAQ view count
CREATE OR REPLACE FUNCTION increment_faq_views(faq_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE faqs 
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = faq_id;
END;
$$;

-- Enable real-time for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE peer_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE peer_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_peer_questions_created_at ON peer_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_peer_answers_question_id ON peer_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_events_date_time ON events(date_time);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_user_event ON event_subscriptions(user_id, event_id);