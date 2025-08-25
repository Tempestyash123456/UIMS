import React, { useState } from 'react'
import { Calendar, MapPin, Users, Bell, BellOff } from 'lucide-react'
import { Event, EventSubscription } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { eventsApi } from '../../services/api'
import { formatDateTime } from '../../utils/helpers'
import Button from '../UI/Button'
import toast from 'react-hot-toast'

interface EventCardProps {
  event: Event
  subscription?: EventSubscription
  onSubscriptionChange?: () => void
}

export default function EventCard({ event, subscription, onSubscriptionChange }: EventCardProps) {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const isSubscribed = !!subscription

  const handleSubscription = async () => {
    if (!profile?.id) return

    setLoading(true)
    try {
      if (isSubscribed) {
        await eventsApi.unsubscribeFromEvent(event.id, profile.id)
        toast.success('Unsubscribed from event')
      } else {
        await eventsApi.subscribeToEvent(event.id, profile.id)
        toast.success('Subscribed to event!')
      }
      onSubscriptionChange?.()
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error('Failed to update subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {event.event_type}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">{formatDateTime(event.date_time)}</span>
        </div>

        {event.location && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{event.location}</span>
          </div>
        )}

        {event.capacity && (
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">Capacity: {event.capacity}</span>
          </div>
        )}
      </div>

      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {event.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Button
          onClick={handleSubscription}
          loading={loading}
          variant={isSubscribed ? 'outline' : 'primary'}
          icon={isSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        >
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </Button>
      </div>
    </div>
  )
}