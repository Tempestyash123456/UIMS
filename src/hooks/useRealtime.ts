import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useRealtime(
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // Create channel
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        callback
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, callback, filter])

  return channelRef.current
}

export function useRealtimePresence(
  channelName: string,
  userInfo: any,
  onPresenceChange?: (presence: any) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userInfo) return

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userInfo.id,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        if (onPresenceChange) {
          onPresenceChange(newState)
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userInfo)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [channelName, userInfo, onPresenceChange])

  return channelRef.current
}