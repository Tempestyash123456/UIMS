import React from 'react'
import { Brain } from 'lucide-react'
import { QuizAttempt } from '../../types'
import { formatDate } from '../../utils/helpers'

interface RecentActivityProps {
  activities: QuizAttempt[]
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No recent activity</p>
        <p className="text-sm text-gray-400">Take a quiz to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {activity.quiz_categories?.name} Quiz
              </p>
              <p className="text-xs text-gray-500">
                Score: {activity.score}/{activity.total_questions}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(activity.created_at)}
          </span>
        </div>
      ))}
    </div>
  )
}