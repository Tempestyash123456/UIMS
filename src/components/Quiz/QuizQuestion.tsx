import React from 'react'
import { CheckCircle } from 'lucide-react'
import { QuizQuestion as QuizQuestionType } from '../../types'

interface QuizQuestionProps {
  question: QuizQuestionType
  selectedAnswer?: string
  onSelectAnswer: (answer: string) => void
}

export default function QuizQuestion({
  question,
  selectedAnswer,
  onSelectAnswer
}: QuizQuestionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h3>
      
      <div className="space-y-3">
        {Object.entries(question.options).map(([key, value]) => {
          const isSelected = selectedAnswer === key
          
          return (
            <button
              key={key}
              onClick={() => onSelectAnswer(key)}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className="font-medium">{key}.</span>
                <span className="ml-2">{value}</span>
              </div>
            </button>
          )
        })}
      </div>

      {question.explanation && selectedAnswer && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
          <p className="text-blue-800">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}