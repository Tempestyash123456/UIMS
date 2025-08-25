import React, { useState, useEffect } from 'react'
import { Calendar, Filter, Search, Plus } from 'lucide-react'
import { Event, EventSubscription } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { eventsApi } from '../services/api'
import { useRealtime } from '../hooks/useRealtime'
import { useDebounce } from '../hooks/useDebounce'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import SearchInput from '../components/UI/SearchInput'
import EmptyState from '../components/UI/EmptyState'
import EventCard from '../components/Events/EventCard'

export default function Events() {
  const { profile } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [subscriptions, setSubscriptions] = useState<EventSubscription[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(true)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    fetchEvents()
    fetchSubscriptions()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, debouncedSearchTerm, selectedType])

  // Real-time event updates
  useRealtime('events', (payload) => {
    if (payload.eventType === 'INSERT') {
      setEvents(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setEvents(prev => prev.map(event => 
        event.id === payload.new.id ? payload.new : event
      ))
    } else if (payload.eventType === 'DELETE') {
      setEvents(prev => prev.filter(event => event.id !== payload.old.id))
    }
  })

  // Real-time subscription updates
  useRealtime(
    'event_subscriptions',
    (payload) => {
      if (payload.new?.user_id === profile?.id) {
        if (payload.eventType === 'INSERT') {
          setSubscriptions(prev => [...prev, payload.new])
        } else if (payload.eventType === 'DELETE') {
          setSubscriptions(prev => prev.filter(sub => sub.id !== payload.old.id))
        }
      }
    },
    profile?.id ? `user_id=eq.${profile.id}` : undefined
  )

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    if (!profile?.id) return

    try {
      const data = await eventsApi.getUserSubscriptions(profile.id)
      setSubscriptions(data)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (debouncedSearchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type === selectedType)
    }

    setFilteredEvents(filtered)
  }

  const getEventTypes = () => {
    const types = [...new Set(events.map(event => event.event_type))]
    return types
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
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
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Discover and subscribe to events happening around campus
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search events..."
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {getEventTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const subscription = subscriptions.find(sub => sub.event_id === event.id)
            
            return (
              <EventCard
                key={event.id}
                event={event}
                subscription={subscription}
                onSubscriptionChange={fetchSubscriptions}
              />
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="No Events Found"
            description={
              searchTerm || selectedType !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'No events are currently scheduled. Check back later!'
            }
          />
        )}
      </div>
    </div>
  )
}