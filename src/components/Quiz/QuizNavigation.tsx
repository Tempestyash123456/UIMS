import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Button from '../UI/Button'

interface QuizNavigationProps {
  currentQuestion: number
  totalQuestions: number
  hasAnswer: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function QuizNavigation({
  currentQuestion,
  totalQuestions,
  hasAnswer,
  onPrevious,
  onNext
}: QuizNavigationProps) {
  const isFirstQuestion = currentQuestion === 0
  const isLastQuestion = currentQuestion === totalQuestions - 1

  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        icon={<ArrowLeft className="w-5 h-5" />}
      >
        Previous
      </Button>
      
      <Button
        onClick={onNext}
        disabled={!hasAnswer}
        icon={<ArrowRight className="w-5 h-5" />}
      >
        {isLastQuestion ? 'Finish' : 'Next'}
      </Button>
    </div>
  )
}