import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, TrendingUp, Award, Brain, Users, Calendar, MessageCircle } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentActivity from '../components/Dashboard/RecentActivity';
import ProfileSetupReminder from '../components/Dashboard/ProfileSetupReminder';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/api';
import { DashboardStats, QuizAttempt } from '../types';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { profile, updateProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [statsData, activityData] = await Promise.all([
        dashboardApi.getStats(profile.id),
        dashboardApi.getRecentActivity(profile.id),
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  if (loading) {
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
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's your academic and career snapshot.
              </p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <BookOpen className="w-12 h-12 text-white mb-2 mx-auto" />
                <p className="text-sm text-blue-100">UniSupport</p>
                <p className="text-xs text-blue-200">Student Platform</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Quizzes Completed" value={stats?.quizzesTaken ?? 0} icon={Brain} color="blue" />
          <StatsCard title="Questions Asked" value={stats?.questionsAsked ?? 0} icon={Users} color="purple" />
          <StatsCard title="Events Subscribed" value={stats?.eventsSubscribed ?? 0} icon={Calendar} color="green" />
          <StatsCard title="AI Conversations" value={stats?.chatSessions ?? 0} icon={MessageCircle} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
            <QuickActions />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-600" />
              Recent Activity
            </h3>
            <RecentActivity activities={recentActivity} />
          </div>
        </div>

        <ProfileSetupReminder profile={profile} onSetup={handleProfileSetup} />
      </div>
    </div>
  );
}