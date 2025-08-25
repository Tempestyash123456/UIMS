import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type PermissionStatus = 'granted' | 'denied' | 'default';

export function useNotifications() {
  const [permission, setPermission] = useState<PermissionStatus>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support desktop notifications.');
      return;
    }

    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    if (newPermission === 'granted') {
      toast.success('Notifications enabled!');
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/vite.svg', 
        ...options,
      });
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
  };
}