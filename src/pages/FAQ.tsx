import React, { useState, useEffect } from 'react'
import { HelpCircle, Search, Filter, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { FAQ as FAQType } from '../types'
import { faqApi } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import { QUIZ_CATEGORIES } from '../utils/constants'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import SearchInput from '../components/UI/SearchInput'
import EmptyState from '../components/UI/EmptyState'

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQType[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    fetchFAQs()
  }, [selectedCategory])

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchFAQs()
    } else {
      setFilteredFaqs(faqs)
    }
  }, [debouncedSearchTerm, faqs])

  const fetchFAQs = async () => {
    try {
      const data = await faqApi.getFAQs(selectedCategory)
      setFaqs(data)
      setFilteredFaqs(data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchFAQs = async () => {
    try {
      const data = await faqApi.searchFAQs(debouncedSearchTerm)
      setFilteredFaqs(data)
    } catch (error) {
      console.error('Error searching FAQs:', error)
    }
  }

  const toggleFaq = async (faqId: string) => {
    if (expandedFaq === faqId) {
      setExpandedFaq(null)
    } else {
      setExpandedFaq(faqId)
      // Increment view count
      try {
        await faqApi.incrementViewCount(faqId)
        setFaqs(prev => prev.map(faq =>
          faq.id === faqId ? { ...faq, view_count: faq.view_count + 1 } : faq
        ))
      } catch (error) {
        console.error('Error incrementing view count:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <HelpCircle className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Find quick answers to common questions about university life
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search FAQs..."
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

        {/* Featured FAQs */}
        {!searchTerm && selectedCategory === 'all' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Questions</h2>
            <div className="space-y-4">
              {faqs.filter(faq => faq.is_featured).slice(0, 3).map((faq) => (
                <div key={faq.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedFaq === faq.id && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {faq.category}
                          </span>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{faq.view_count} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All FAQs */}
        <div className="space-y-4">
          {filteredFaqs.filter(faq => !faq.is_featured || searchTerm || selectedCategory !== 'all').map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full text-left flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
              </button>
              
              {expandedFaq === faq.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                  
                  {faq.tags && faq.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {faq.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {faq.category}
                      </span>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{faq.view_count} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <EmptyState
            icon={HelpCircle}
            title="No FAQs Found"
            description={
              searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search terms or category filter.'
                : 'No frequently asked questions are available yet.'
            }
          />
        )}
      </div>
    </div>
  )
}