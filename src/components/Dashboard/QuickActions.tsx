import React from 'react';
import { Target, Brain, Users, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const quickActions = [
  { icon: Target, label: 'Explore Careers', href: ROUTES.CAREER, color: 'blue' },
  { icon: Brain, label: 'Take Quiz', href: ROUTES.SKILLS, color: 'purple' },
  { icon: Users, label: 'Ask Peers', href: ROUTES.PEER_SUPPORT, color: 'green' },
  { icon: MessageCircle, label: 'Chat AI', href: ROUTES.CHAT, color: 'orange' },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {quickActions.map((action) => (
        <Link
          key={action.label}
          to={action.href}
          className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
        >
          <div
            className={`p-3 rounded-lg bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 group-hover:scale-110 transition-transform duration-200`}
          >
            <action.icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 mt-2 text-center">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}