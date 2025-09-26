import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications as useBrowserNotifications } from '../../hooks/useNotifications';
import { useRealtime } from '../../hooks/useRealtime';
import Button from '../UI/Button';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../types';

export default function NotificationCenter() {
  const { profile } = useAuth();
  const { showNotification } = useBrowserNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.read).length);
  }, [profile?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useRealtime(
    'notifications',
    (payload) => {
      if (payload.new && payload.new.user_id === profile?.id) {
        const newNotification = payload.new as Notification;
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        showNotification(newNotification.title, {
          body: newNotification.message,
          tag: newNotification.id,
        });
      }
    },
    profile?.id ? `user_id=eq.${profile.id}` : undefined
  );

  const markAsRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!profile?.id) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success': return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'warning': return <AlertCircle className={`${iconClass} text-yellow-600`} />;
      case 'error': return <AlertCircle className={`${iconClass} text-red-600`} />;
      default: return <Info className={`${iconClass} text-blue-600`} />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                      </div>
                      {!notification.read && (
                        <button onClick={() => markAsRead(notification.id)} className="p-1 text-blue-600 hover:text-blue-800" title="Mark as read">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}