import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import client from '../api/client';
import Card from './ui/Card';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/notifications', { ui: { silent: true } } as any);
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    await client.put(`/notifications/${id}/read`, undefined, { ui: { silent: true } } as any);
    fetchNotifications();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-notification-popover]')) return;
      setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('click', onClick);
    };
  }, [isOpen]);

  return (
    <div className="relative" data-notification-popover>
      <button 
        onClick={() => setIsOpen((v) => !v)}
        className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors relative border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm shadow-red-600/20">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <Card className="absolute right-0 mt-3 w-[360px] overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {unreadCount ? `${unreadCount} unread` : 'All caught up'}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-600 dark:text-slate-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  type="button"
                  key={notif._id}
                  className={
                    'w-full text-left p-4 border-b border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors ' +
                    (!notif.read ? 'bg-blue-50/60 dark:bg-blue-950/20' : '')
                  }
                  onClick={() => markAsRead(notif._id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={
                        'mt-0.5 rounded-xl p-2 border ' +
                        (!notif.read
                          ? 'bg-blue-100/70 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50'
                          : 'bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-800/60')
                      }
                    >
                      <CheckCheck size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {notif.message}
                      </p>
                    </div>
                    {!notif.read ? (
                      <span className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-600/20" />
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;
