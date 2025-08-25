import React from 'react'
import { Clock } from 'lucide-react'

interface QuizProgressProps {
  categoryName: string
  currentQuestion: number
  totalQuestions: number
  timeStarted: number
}

export default function QuizProgress({
  categoryName,
  currentQuestion,
  totalQuestions,
  timeStarted
}: QuizProgressProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100
  const timeElapsed = Math.floor((Date.now() - timeStarted) / 1000)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>
          <p className="text-gray-600">Question {currentQuestion + 1} of {totalQuestions}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>{timeElapsed}s</span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}