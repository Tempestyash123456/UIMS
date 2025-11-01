import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Target,
  Users,
  Brain,
  HelpCircle,
  Calendar,
  MessageCircle,
  User,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// import NotificationCenter from '../Notifications/NotificationCenter'; // ⬅️ REMOVED IMPORT
import { ROUTES } from '../../utils/constants';

const navItems = [
  { to: ROUTES.DASHBOARD, icon: Home, label: 'Dashboard' },
  { to: ROUTES.CAREER, icon: Target, label: 'Career Paths' },
  { to: ROUTES.SKILLS, icon: Brain, label: 'Skills Assessment' },
  { to: ROUTES.PEER_SUPPORT, icon: Users, label: 'Ask a Peer' },
  { to: ROUTES.FAQ, icon: HelpCircle, label: 'FAQ' },
  { to: ROUTES.EVENTS, icon: Calendar, label: 'Events' },
  { to: ROUTES.CHAT, icon: MessageCircle, label: 'AI Assistant' },
];

export default function Sidebar() {
  const { signOut, profile, profileLoading } = useAuth();

  const fullName = profile?.full_name || 'Student';
  const major = profile?.major || 'University Student';

  return (
    <aside className="bg-white shadow-lg h-screen w-64 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">UniSupport</h1>
            <p className="text-sm text-gray-500">Student Platform</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
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

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Link to="/profile">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {profileLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium text-gray-800 truncate ${profileLoading ? 'animate-pulse bg-gray-200 rounded' : ''}`}>
              {profileLoading ? '\u00A0' : fullName}
            </p>
            <p className={`text-xs text-gray-500 truncate ${profileLoading ? 'animate-pulse bg-gray-100 rounded' : ''}`}>
              {profileLoading ? '\u00A0' : major}
            </p>
          </div>
          {/* REMOVED: <NotificationCenter /> */}
        </div>

        <button
          onClick={signOut}
          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}