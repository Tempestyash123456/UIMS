import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { QuizCategory } from '../../types';
import { calculateQuizPercentage } from '../../utils/helpers';
import Button from '../UI/Button';
import { Link } from 'react-router-dom';

interface QuizResultsProps {
  category: QuizCategory;
  score: number;
  totalQuestions: number;
  timeStarted: number;
  onRetakeQuiz: () => void;
}

export default function QuizResults({
  category,
  score,
  totalQuestions,
  timeStarted,
  onRetakeQuiz,
}: QuizResultsProps) {
  const percentage = useMemo(
    () => calculateQuizPercentage(score, totalQuestions),
    [score, totalQuestions]
  );
  const timeTaken = useMemo(
    () => Math.floor((Date.now() - timeStarted) / 1000),
    [timeStarted]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
        <p className="text-gray-600 mb-8">
          Great job completing the {category.name} assessment!
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {score}/{totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{percentage}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{timeTaken}s</div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRetakeQuiz}>Take Another Quiz</Button>
          <Link to="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}