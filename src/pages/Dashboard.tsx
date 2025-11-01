import React from 'react';
import { TrendingUp, Award, Brain, Users, Calendar, MessageCircle } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import QuickActions from '../components/Dashboard/QuickActions';
import ProfileSetupReminder from '../components/Dashboard/ProfileSetupReminder';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/api';
import { DashboardStats, QuizAttempt } from '../types';
import toast from 'react-hot-toast';
import LatestQuizScores from '../components/Dashboard/LatestQuizScores';
import NotificationCenter from '../components/Notifications/NotificationCenter';

export default function Dashboard() {
  const { profile, profileLoading, updateProfile } = useAuth();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [latestAttempts, setLatestAttempts] = React.useState<QuizAttempt[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const [statsData, attemptsData] = await Promise.all([
        dashboardApi.getStats(profile.id),
        dashboardApi.getLatestAttemptsByCategory(profile.id),
      ]);
      setStats(statsData);
      setLatestAttempts(attemptsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  React.useEffect(() => {
    if (profile && !profileLoading) {
      fetchDashboardData();
    }
  }, [profile, profileLoading, fetchDashboardData]);

  const handleProfileSetup = async () => {
    try {
      await updateProfile({
        interests: ['Technology', 'Business', 'Science'],
        skills: ['JavaScript', 'Python', 'Communication'],
        career_preferences: ['Software Development', 'Data Science'],
      });
    } catch (error) {
      console.error('Failed to quick setup profile:', error);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* UPDATED: Header Banner with Notification Center */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start justify-between"> 
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's your academic and career snapshot.
              </p>
            </div>
            
            <div className="flex-shrink-0 relative -mt-4 -mr-4">
              <NotificationCenter />
            </div>
          </div>
        </div>

        {/* UPDATED: Stats Card Grid: Reverted to standard 4 columns, removing the App Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> 
          
          <StatsCard title="Quizzes Completed" value={stats?.quizzes_taken ?? 0} icon={Brain} color="blue" />
          <StatsCard title="Questions Asked" value={stats?.questions_asked ?? 0} icon={Users} color="purple" />
          <StatsCard title="Events Subscribed" value={stats?.events_subscribed ?? 0} icon={Calendar} color="green" />
          <StatsCard title="AI Conversations" value={stats?.chat_sessions ?? 0} icon={MessageCircle} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
            <QuickActions />
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-600" />
              Latest Quiz Scores
            </h3>
            <LatestQuizScores attempts={latestAttempts} />
          </div>
        </div>

        <ProfileSetupReminder profile={profile} onSetup={handleProfileSetup} />
      </div>
    </div>
  );
}