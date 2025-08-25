import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, Home, Target, Users, Brain, HelpCircle, Calendar, MessageCircle } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/career', icon: Target, label: 'Career Paths' },
  { to: '/skills', icon: Brain, label: 'Skills Assessment' },
  { to: '/peer-support', icon: Users, label: 'Ask a Peer' },
  { to: '/faq', icon: HelpCircle, label: 'FAQ' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/chat', icon: MessageCircle, label: 'AI Assistant' },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 mt-12">
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}