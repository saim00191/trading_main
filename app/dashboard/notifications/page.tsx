'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationModal } from '@/components/common/NotificationModal';
import { NotificationTable } from '@/components/common/NotificationTable';
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsSeen,
} from '@/lib/notificationService';
import { Notification } from '@/lib/types';
import { motion } from 'framer-motion';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { useSelector } from 'react-redux';
import { Navigation } from '@/components/common/Navigation';

export default function UserNotificationsPage() {
  const userEmail = useSelector(selectUserEmail);

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch notifications & unread count
  useEffect(() => {
    if (!userEmail) return; // <-- Guard against null

    async function loadNotifications() {
      try {
        const notifs = await getUserNotifications(userEmail!); // <-- add !
      const unread = await getUnreadCount(userEmail!);  
        setNotifications(notifs);
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
    loadNotifications();
  }, [userEmail, refreshTrigger]);

  // Handlers
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleMarkAsSeen = async (notificationId: string) => {
    try {
      await markNotificationAsSeen(notificationId);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  if (!userEmail) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p>Please log in to view notifications.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
              <p className="text-gray-400 mt-1">
                {notifications.length === 0
                  ? 'No notifications'
                  : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NotificationTable
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
          />
        </motion.div>

  
      </div>

      {/* Modal */}
      <NotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMarkAsSeen={handleMarkAsSeen}
      />
    </main>
  );
}