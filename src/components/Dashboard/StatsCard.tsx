import React from 'react';
import { StatsCardProps } from '../../types';
import { COLOR_CLASSES } from '../../utils/constants';

export default function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1">
              ↗ {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${COLOR_CLASSES[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}