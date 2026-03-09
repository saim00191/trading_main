'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { getNotifications, markAllNotificationsAsSeen, deleteNotification } from '@/lib/notificationsService';
import { Notification } from '@/lib/notificationsService';
import { Trash2, Bell, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { selectUserEmail } from '@/store/UserLoggedInSlice';

export default function NotificationsPage() {
   const userEmail = useSelector(selectUserEmail);
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getNotifications(userEmail);
        setNotifications(data);

        setTimeout(() => {
          markAllNotificationsAsSeen(userEmail).catch(console.error);
        }, 2000);
      } catch (error) {
        toast.error('Failed to load notifications');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [userEmail]);

  const handleViewNotification = (id: string) => {
    router.push(`/notifications/${id}`);
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);

    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => n.status === 'pending').length;

  return (
    <DashboardLayout
      title="Notifications"
      subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            className="bg-card border border-border/50 rounded-lg p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Bell className="mx-auto mb-4 text-muted-foreground" size={40} />
            <h3 className="text-lg font-bold text-foreground mb-2">No Notifications</h3>
            <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleViewNotification(notification.id)}
                className={`bg-card border rounded-lg p-3 md:p-4 cursor-pointer transition-all hover:border-primary/50 ${
                  notification.status === 'pending'
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {notification.status === 'pending' && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                      <h3 className="font-semibold text-foreground truncate text-sm md:text-base">
                        {notification.message.split('\n')[0]}
                      </h3>
                    </div>

                    {notification.message.includes('\n') && (
                      <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 mb-2">
                        {notification.message.split('\n').slice(1).join('\n')}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} />
                      <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    disabled={deletingId === notification.id}
                    className="p-2 text-muted-foreground hover:text-danger transition-colors flex-shrink-0"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
