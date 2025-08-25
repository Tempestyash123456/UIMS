import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  })

  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default'
      })
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission({
      granted: result === 'granted',
      denied: result === 'denied',
      default: result === 'default'
    })

    return result === 'granted'
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission.granted) {
      new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      })
    }
  }

  return {
    permission,
    requestPermission,
    showNotification
  }
}