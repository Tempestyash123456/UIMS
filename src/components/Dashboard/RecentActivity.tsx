import { Brain } from 'lucide-react';
import { QuizAttempt } from '../../types';
import { formatDate } from '../../utils/helpers';
import { EmptyState } from '../UI/EmptyState';

interface RecentActivityProps {
  activities: QuizAttempt[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="No Recent Activity"
        description="Your recent quiz attempts will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
  );
}