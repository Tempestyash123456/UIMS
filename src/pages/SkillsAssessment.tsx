import React, { useState, useEffect } from 'react'
import { Brain, Play, Trophy } from 'lucide-react'
import { QuizCategory, QuizQuestion as QuizQuestionType, QuizAttempt, QuizState } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { quizApi } from '../services/api'
import { getScoreColor } from '../utils/helpers'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import Card from '../components/UI/Card'
import EmptyState from '../components/UI/EmptyState'
import QuizProgress from '../components/Quiz/QuizProgress'
import QuizQuestion from '../components/Quiz/QuizQuestion'
import QuizNavigation from '../components/Quiz/QuizNavigation'
import QuizResults from '../components/Quiz/QuizResults'
import toast from 'react-hot-toast'

export default function SkillsAssessment() {
  const { profile } = useAuth()
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null)
  const [questions, setQuestions] = useState<QuizQuestionType[]>([])
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    timeStarted: 0,
    isCompleted: false,
    score: 0
  })
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchUserAttempts()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await quizApi.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAttempts = async () => {
    if (!profile?.id) return

    try {
      const data = await quizApi.getUserAttempts(profile.id)
      setUserAttempts(data)
    } catch (error) {
      console.error('Error fetching user attempts:', error)
    }
  }

  const startQuiz = async (category: QuizCategory) => {
    try {
      const data = await quizApi.getQuestions(category.id)

      setSelectedCategory(category)
      setQuestions(data)
      setQuizStarted(true)
      setQuizState({
        currentQuestion: 0,
        answers: {},
        timeStarted: Date.now(),
        isCompleted: false,
        score: 0
      })
    } catch (error) {
      console.error('Error starting quiz:', error)
      toast.error('Failed to start quiz')
    }
  }

  const selectAnswer = (questionId: string, answer: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }))
  }

  const nextQuestion = () => {
    if (quizState.currentQuestion < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }))
    } else {
      finishQuiz()
    }
  }

  const prevQuestion = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }))
    }
  }

  const finishQuiz = async () => {
    if (!profile?.id || !selectedCategory) return

    // Calculate score
    let correctAnswers = 0
    questions.forEach(question => {
      if (quizState.answers[question.id] === question.correct_answer) {
        correctAnswers++
      }
    })

    const score = correctAnswers
    const timeTaken = Math.floor((Date.now() - quizState.timeStarted) / 1000)

    try {
      await quizApi.saveAttempt({
        user_id: profile.id,
        category_id: selectedCategory.id,
        score,
        total_questions: questions.length,
        time_taken: timeTaken,
        answers: quizState.answers
      })

      setQuizState(prev => ({
        ...prev,
        isCompleted: true,
        score
      }))

      fetchUserAttempts()
      toast.success('Quiz completed successfully!')
    } catch (error) {
      console.error('Error saving quiz results:', error)
      toast.error('Failed to save quiz results')
    }
  }

  const resetQuiz = () => {
    setSelectedCategory(null)
    setQuestions([])
    setQuizStarted(false)
    setQuizState({
      currentQuestion: 0,
      answers: {},
      timeStarted: 0,
      isCompleted: false,
      score: 0
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading skill assessments...</p>
        </div>
      </div>
    )
  }

  // Quiz completion screen
  if (quizState.isCompleted) {
    return (
      <QuizResults
        category={selectedCategory!}
        score={quizState.score}
        totalQuestions={questions.length}
        timeStarted={quizState.timeStarted}
        onRetakeQuiz={resetQuiz}
        onBackToDashboard={() => window.location.href = '/dashboard'}
      />
    )
  }

  // Quiz in progress
  if (quizStarted && questions.length > 0) {
    const currentQuestion = questions[quizState.currentQuestion]

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <QuizProgress
            categoryName={selectedCategory?.name || ''}
            currentQuestion={quizState.currentQuestion}
            totalQuestions={questions.length}
            timeStarted={quizState.timeStarted}
          />

          <QuizQuestion
            question={currentQuestion}
            selectedAnswer={quizState.answers[currentQuestion.id]}
            onSelectAnswer={(answer) => selectAnswer(currentQuestion.id, answer)}
          />

          <QuizNavigation
            currentQuestion={quizState.currentQuestion}
            totalQuestions={questions.length}
            hasAnswer={!!quizState.answers[currentQuestion.id]}
            onPrevious={prevQuestion}
            onNext={nextQuestion}
          />
        </div>
      </div>
    )
  }

  // Main quiz selection screen
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Brain className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Skills Assessment</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Test your knowledge and discover your strengths across different skill areas
          </p>
        </div>

        {/* Your Recent Attempts */}
        {userAttempts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-6 h-6 text-yellow-600 mr-2" />
              Your Recent Attempts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAttempts.slice(0, 3).map((attempt) => (
                <div key={attempt.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {(attempt as any).quiz_categories?.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Score: {attempt.score}/{attempt.total_questions}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getScoreColor(attempt.score, attempt.total_questions)
                    }`}>
                      {Math.round((attempt.score / attempt.total_questions) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(attempt.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} hover>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                </div>
              </div>

              <p className="text-gray-600 mb-6 line-clamp-3">
                {category.description || 'Test your knowledge and skills in this area.'}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Multiple choice questions
                </div>
                <button
                  onClick={() => startQuiz(category)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </button>
              </div>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <EmptyState
            icon={Brain}
            title="No Assessments Available"
            description="Check back later for new skill assessment opportunities."
          />
        )}
      </div>
    </div>
  )
}
