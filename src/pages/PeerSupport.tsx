import React, { useState, useEffect } from 'react'
import { Users, Plus, MessageSquare, ThumbsUp, Search, Filter, Tag } from 'lucide-react'
import { PeerQuestion, PeerAnswer } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { peerApi } from '../services/api'
import { QUIZ_CATEGORIES } from '../utils/constants'
import { formatDate } from '../utils/helpers'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import SearchInput from '../components/UI/SearchInput'
import EmptyState from '../components/UI/EmptyState'
import toast from 'react-hot-toast'

export default function PeerSupport() {
  const { profile } = useAuth()
  const [questions, setQuestions] = useState<PeerQuestion[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<PeerQuestion[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showNewQuestion, setShowNewQuestion] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<PeerQuestion | null>(null)
  const [answers, setAnswers] = useState<PeerAnswer[]>([])
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [questions, searchTerm, selectedCategory])

  const fetchQuestions = async () => {
    try {
      const data = await peerApi.getQuestions()
      setQuestions(data)
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnswers = async (questionId: string) => {
    try {
      const data = await peerApi.getAnswers(questionId)
      setAnswers(data)
    } catch (error) {
      console.error('Error fetching answers:', error)
    }
  }

  const filterQuestions = () => {
    let filtered = questions

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }

    setFilteredQuestions(filtered)
  }

  const submitQuestion = async (formData: FormData) => {
    if (!profile?.id) return

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as string
    const tagsInput = formData.get('tags') as string
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : []

    try {
      await peerApi.createQuestion({
        user_id: profile.id,
        title,
        content,
        category,
        tags
      })

      toast.success('Question posted successfully!')
      setShowNewQuestion(false)
      fetchQuestions()
    } catch (error) {
      console.error('Error posting question:', error)
      toast.error('Failed to post question')
    }
  }

  const submitAnswer = async (formData: FormData) => {
    if (!profile?.id || !selectedQuestion) return

    const content = formData.get('answer') as string

    try {
      await peerApi.createAnswer({
        question_id: selectedQuestion.id,
        user_id: profile.id,
        content
      })

      toast.success('Answer posted successfully!')
      fetchAnswers(selectedQuestion.id)
    } catch (error) {
      console.error('Error posting answer:', error)
      toast.error('Failed to post answer')
    }
  }

  const upvoteQuestion = async (questionId: string) => {
    try {
      const question = questions.find(q => q.id === questionId)
      if (!question) return

      await peerApi.upvoteQuestion(questionId, question.upvotes)

      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      ))
    } catch (error) {
      console.error('Error upvoting question:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading peer support...</p>
        </div>
      </div>
    )
  }

  // Question detail view
  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedQuestion(null)}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← Back to Questions
          </button>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedQuestion.profiles?.full_name || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedQuestion.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedQuestion.category}
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedQuestion.title}</h1>
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{selectedQuestion.content}</p>

            {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mb-4">
                <Tag className="w-4 h-4 text-gray-500" />
                {selectedQuestion.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => upvoteQuestion(selectedQuestion.id)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{selectedQuestion.upvotes}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span>{answers.length} answers</span>
              </div>
            </div>
          </div>

          {/* Answer Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Answer</h3>
            <form action={submitAnswer} className="space-y-4">
              <textarea
                name="answer"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your knowledge and help a fellow student..."
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Post Answer
              </button>
            </form>
          </div>

          {/* Answers */}
          <div className="space-y-4">
            {answers.map((answer) => (
              <div key={answer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {answer.profiles?.full_name || 'Anonymous'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(answer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
              </div>
            ))}
          </div>

          {answers.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Answers Yet</h3>
              <p className="text-gray-500">Be the first to help answer this question!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Ask a Peer</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Get help from fellow students and share your knowledge with others
            </p>
          </div>
          <button
            onClick={() => setShowNewQuestion(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ask Question
          </button>
        </div>

        {/* New Question Modal */}
        {showNewQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Ask a Question</h2>
                <p className="text-gray-600 mt-1">Share your question with the community</p>
              </div>
              
              <form action={submitQuestion} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What's your question about?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {QUIZ_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="content"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide more details about your question..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
                  <input
                    type="text"
                    name="tags"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., programming, math, career-advice (comma separated)"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewQuestion(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Post Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search questions..."
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {QUIZ_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => {
                setSelectedQuestion(question)
                fetchAnswers(question.id)
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {question.profiles?.full_name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(question.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {question.category}
                  </span>
                  {question.is_answered && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Answered
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">{question.title}</h2>
              <p className="text-gray-700 mb-4 line-clamp-2">{question.content}</p>

              {question.tags && question.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-500" />
                  {question.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                  {question.tags.length > 3 && (
                    <span className="text-sm text-gray-500">+{question.tags.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-4 text-gray-600">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    upvoteQuestion(question.id)
                  }}
                  className="flex items-center space-x-2 hover:text-blue-600"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{question.upvotes}</span>
                </button>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>View answers</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <EmptyState
            icon={Users}
            title="No Questions Found"
            description={
              searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search terms or filters.'
                : 'Be the first to ask a question and help build our community!'
            }
            actionLabel="Ask the First Question"
            onAction={() => setShowNewQuestion(true)}
          />
        )}
      </div>
    </div>
  )
}