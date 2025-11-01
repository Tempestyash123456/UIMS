import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Event, EventSubscription } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { eventsApi } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';
import { useDebounce } from '../hooks/useDebounce';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SearchInput from '../components/UI/SearchInput';
import { EmptyState } from '../components/UI/EmptyState';
import EventCard from '../components/Events/EventCard';
import toast from 'react-hot-toast'; // Import toast for error handling

export default function Events() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [subscriptions, setSubscriptions] = useState<EventSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false); // New Error State

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchEvents = useCallback(async () => {
    try {
      setHasError(false);
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events list.');
      setHasError(true);
    } 
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    if (!profile?.id) {
      setSubscriptions([]); // Clear subscriptions if logged out
      return;
    }
    try {
      const data = await eventsApi.getUserSubscriptions(profile.id);
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load event subscriptions.');
    }
  }, [profile?.id]);

  // Combine initial data fetch into one effect
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchSubscriptions()]);
      if (isMounted) {
         setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    }
  }, [fetchEvents, fetchSubscriptions]); // Depend on memoized fetch functions

  useRealtime('events', (payload) => {
    if (payload.eventType === 'INSERT') {
      setEvents((prev) => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setEvents((prev) => prev.map((event) => (event.id === payload.new.id ? payload.new : event)));
    } else if (payload.eventType === 'DELETE') {
      setEvents((prev) => prev.filter((event) => event.id !== payload.old.id));
    }
  });
  
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const searchMatch = debouncedSearchTerm
        ? event.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          event.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        : true;
      const typeMatch = selectedType !== 'all' ? event.event_type === selectedType : true;
      return searchMatch && typeMatch;
    });
  }, [events, debouncedSearchTerm, selectedType]);

  const eventTypes = useMemo(() => [...new Set(events.map((event) => event.event_type))], [events]);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
            icon={Calendar}
            title="Data Load Error"
            description="Failed to retrieve events. Please check your connection or try again later."
            actionLabel="Reload Page"
            onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Discover and subscribe to events happening around campus.
          </p>
        </header>

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
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const subscription = subscriptions.find((sub) => sub.event_id === event.id);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  subscription={subscription}
                  onSubscriptionChange={fetchSubscriptions}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Events Found"
            description="Try adjusting your search terms or filters. Otherwise, no events are currently scheduled."
          />
        )}
      </div>
    </div>
  );
}