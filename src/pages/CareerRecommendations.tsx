import React, { useState, useEffect } from 'react'
import { Target, TrendingUp, DollarSign, BookOpen, Search, Filter } from 'lucide-react'
import { CareerPath } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { careerApi } from '../services/api'
import { calculateCareerMatch, isUserSkillMatch } from '../utils/helpers'
import { CAREER_FILTERS } from '../utils/constants'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import SearchInput from '../components/UI/SearchInput'
import EmptyState from '../components/UI/EmptyState'

export default function CareerRecommendations() {
  const { profile } = useAuth()
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([])
  const [filteredPaths, setFilteredPaths] = useState<CareerPath[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCareerPaths()
  }, [])

  useEffect(() => {
    filterCareerPaths()
  }, [careerPaths, searchTerm, selectedFilter, profile])

  const fetchCareerPaths = async () => {
    try {
      const data = await careerApi.getCareerPaths()
      setCareerPaths(data)
    } catch (error) {
      console.error('Error fetching career paths:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCareerPaths = () => {
    let filtered = careerPaths

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(path =>
        path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by match with user skills/interests
    if (selectedFilter === CAREER_FILTERS.RECOMMENDED && profile?.skills?.length) {
      filtered = filtered.filter(path => {
        if (!path.required_skills) return false
        return path.required_skills.some(skill => 
          profile.skills?.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      })
    }

    setFilteredPaths(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading career recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Career Recommendations</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Discover career paths that match your skills and interests
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search career paths..."
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={CAREER_FILTERS.ALL}>All Careers</option>
                <option value={CAREER_FILTERS.RECOMMENDED}>Recommended for You</option>
              </select>
            </div>
          </div>
        </div>

        {/* Career Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPaths.map((path) => {
            const matchPercentage = calculateCareerMatch(path, profile!)
            
            return (
              <div key={path.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
                    {matchPercentage > 0 && (
                      <div className="flex items-center mb-2">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {matchPercentage}% Match
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3">{path.description}</p>

                <div className="space-y-4">
                  {/* Salary Range */}
                  {path.salary_range && (
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm text-gray-700">
                        <strong>Salary:</strong> {path.salary_range}
                      </span>
                    </div>
                  )}

                  {/* Growth Outlook */}
                  {path.growth_outlook && (
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">
                        <strong>Growth:</strong> {path.growth_outlook}
                      </span>
                    </div>
                  )}

                  {/* Education Requirements */}
                  {path.education_requirements && (
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm text-gray-700">
                        <strong>Education:</strong> {path.education_requirements}
                      </span>
                    </div>
                  )}

                  {/* Required Skills */}
                  {path.required_skills && path.required_skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {path.required_skills.map((skill, index) => {
                          const isUserSkill = isUserSkillMatch(skill, profile?.skills)
                          
                          return (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isUserSkill
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {skill}
                              {isUserSkill && ' ✓'}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                    Learn More
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredPaths.length === 0 && (
          <EmptyState
            icon={Target}
            title="No Career Paths Found"
            description="Try adjusting your search terms or filters to find relevant career paths."
          />
        )}
      </div>
    </div>
  )
}