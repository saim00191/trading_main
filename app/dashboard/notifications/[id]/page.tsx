'use client';

import  { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getNotificationById, markNotificationAsSeen, deleteNotification } from '@/lib/notificationsService';
import { Notification } from '@/lib/notificationsService';
import { ArrowLeft, Trash2, Calendar, User, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {  format } from 'date-fns';

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notificationId = params.id as string;

  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadNotification = async () => {
      try {
        const data = await getNotificationById(notificationId);
        if (data) {
          setNotification(data);
          // Mark as seen
          if (data.status === 'pending') {
            await markNotificationAsSeen(notificationId);
          }
        } else {
          toast.error('Notification not found');
          router.push('/notifications');
        }
      } catch (error) {
        toast.error('Failed to load notification');
        console.error(error);
        router.push('dashboard/notifications');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotification();
  }, [notificationId, router]);

  const handleDelete = async () => {
    if (!confirm('Delete this notification?')) return;

    setIsDeleting(true);
    try {
      await deleteNotification(notificationId);
      toast.success('Notification deleted');
      router.push('/notifications');
    } catch (error) {
      toast.error('Failed to delete notification');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/notifications')}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm md:text-base font-medium">Back</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-muted-foreground hover:text-danger transition-colors disabled:opacity-50"
          >
            <Trash2 size={20} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        ) : notification ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-lg p-6 md:p-8"
          >
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {notification.message.split('\n')[0]}
            </h1>

            {/* Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground" size={18} />
                <div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(notification.created_at), 'PPpp')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="text-muted-foreground" size={18} />
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="text-sm font-medium text-foreground">Admin</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="text-muted-foreground" size={18} />
                <div>
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="text-sm font-medium text-foreground truncate">{notification.username}</p>
                  <p className="text-sm font-medium text-foreground truncate">{notification.email}</p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="prose prose-invert max-w-none">
              <p className="text-base md:text-lg text-foreground whitespace-pre-wrap leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Status Badge */}
            <div className="mt-8 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  notification.status === 'pending'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-success/20 text-success'
                }`}
              >
                {notification.status === 'pending' ? 'Unread' : 'Read'}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Notification not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
