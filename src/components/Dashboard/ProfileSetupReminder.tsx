import React from 'react'
import { Target } from 'lucide-react'
import { Profile } from '../../types'
import Button from '../UI/Button'

interface ProfileSetupReminderProps {
  profile: Profile | null
  onSetup: () => void
}

export default function ProfileSetupReminder({ profile, onSetup }: ProfileSetupReminderProps) {
  const needsSetup = !profile?.interests?.length || !profile?.skills?.length

  if (!needsSetup) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
      <div className="flex items-start">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <Target className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="ml-4 flex-1">
          <h4 className="text-lg font-medium text-yellow-800">
            Complete Your Profile
          </h4>
          <p className="text-yellow-700 mt-1 mb-4">
            Help us provide better career recommendations by completing your profile with interests and skills.
          </p>
          <Button
            onClick={onSetup}
            variant="secondary"
            className="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
          >
            Quick Setup
          </Button>
        </div>
      </div>
    </div>
  )
}