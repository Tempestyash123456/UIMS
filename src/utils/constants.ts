// Application constants
export const APP_CONFIG = {
  name: 'UniSupport',
  description: 'Complete University Student Support Platform',
  version: '1.0.0'
}

export const QUIZ_CATEGORIES = [
  'Academic',
  'Career', 
  'Campus Life',
  'Technology',
  'Social',
  'Financial Aid',
  'Health',
  'Other'
] as const

export const SKILL_CATEGORIES = [
  'Technical',
  'Communication',
  'Leadership',
  'Creative',
  'Analytical',
  'Language'
] as const

export const CAREER_FILTERS = {
  ALL: 'all',
  RECOMMENDED: 'recommended'
} as const

export const COLOR_CLASSES = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  indigo: 'from-indigo-500 to-indigo-600',
} as const

export const ROUTES = {
  DASHBOARD: '/',
  CAREER: '/career',
  SKILLS: '/skills',
  PEER_SUPPORT: '/peer-support',
  FAQ: '/faq',
  EVENTS: '/events',
  CHAT: '/chat'
} as const