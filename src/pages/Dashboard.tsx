import React, { useState, useEffect } from 'react'
import { BookOpen, TrendingUp, Award } from 'lucide-react'
import StatsCard from '../components/Dashboard/StatsCard'
import QuickActions from '../components/Dashboard/QuickActions'
import RecentActivity from '../components/Dashboard/RecentActivity'
import ProfileSetupReminder from '../components/Dashboard/ProfileSetupReminder'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { dashboardApi } from '../services/api'
import { DashboardStats, QuizAttempt } from '../types'
import { Brain, Users, Calendar, MessageCircle } from 'lucide-react'

export default function Dashboard() {
  const { profile, updateProfile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    quizzesTaken: 0,
    questionsAsked: 0,
    eventsSubscribed: 0,
    chatSessions: 0
  })
  const [recentActivity, setRecentActivity] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (!profile?.id) return

      const [statsData, activityData] = await Promise.all([
        dashboardApi.getStats(profile.id),
        dashboardApi.getRecentActivity(profile.id)
      ])

      setStats(statsData)
      setRecentActivity(activityData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSetup = async () => {
    try {
      await updateProfile({
        interests: ['Technology', 'Business', 'Science'],
        skills: ['JavaScript', 'Python', 'Communication'],
        career_preferences: ['Software Development', 'Data Science']
      })
    } catch (error) {
      // Error handled in context
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Ready to explore your academic journey today?
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <BookOpen className="w-12 h-12 text-white mb-2 mx-auto" />
                <p className="text-sm text-blue-100">UniSupport</p>
                <p className="text-xs text-blue-200">Student Platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Quizzes Completed"
            value={stats.quizzesTaken}
            icon={Brain}
            color="blue"
            trend="This week"
          />
          <StatsCard
            title="Questions Asked"
            value={stats.questionsAsked}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Events Subscribed"
            value={stats.eventsSubscribed}
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="AI Conversations"
            value={stats.chatSessions}
            icon={MessageCircle}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
            <QuickActions />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-600" />
              Recent Activity
            </h3>
            <RecentActivity activities={recentActivity} />
          </div>
        </div>

        {/* Profile Setup Reminder */}
        <ProfileSetupReminder profile={profile} onSetup={handleProfileSetup} />
      </div>
    </div>
  )
}