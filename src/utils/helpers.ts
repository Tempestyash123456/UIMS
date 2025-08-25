import { QuizAttempt, CareerPath, Profile } from '../types'

// Date formatting utilities
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getTimeAgo = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(dateString)
}

// Score calculation utilities
export const calculateQuizPercentage = (score: number, total: number): number => {
  return Math.round((score / total) * 100)
}

export const getScoreColor = (score: number, total: number): string => {
  const percentage = calculateQuizPercentage(score, total)
  if (percentage >= 80) return 'text-green-600 bg-green-100'
  if (percentage >= 60) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

// Career matching utilities
export const calculateCareerMatch = (path: CareerPath, profile: Profile): number => {
  if (!profile?.skills?.length || !path.required_skills?.length) return 0
  
  const matchingSkills = path.required_skills.filter(skill =>
    profile.skills?.some(userSkill =>
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  )
  
  return Math.round((matchingSkills.length / path.required_skills.length) * 100)
}

export const isUserSkillMatch = (skill: string, userSkills?: string[]): boolean => {
  if (!userSkills?.length) return false
  return userSkills.some(userSkill =>
    userSkill.toLowerCase().includes(skill.toLowerCase())
  )
}

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Array utilities
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6
}

// Local storage utilities
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}