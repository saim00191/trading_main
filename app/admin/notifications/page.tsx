'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationForm } from '@/components/common/NotificationForm';
import { 
  getAllUsers, 
  sendNotificationToAllUsers, 
  sendNotificationToMultipleUsers 
} from '@/lib/notificationService';
import { User, SendMode } from '@/lib/types';
import { motion } from 'framer-motion';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AdminAllNotificationsPage from './AllNotifications';

export default function AdminNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('[v0] Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

 const handleSubmitNotification = async (formData: {
  subject: string;
  message: string;
  sendMode: SendMode;
  selectedUserIds?: string[];
}) => {
  setIsLoading(true);

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (formData.sendMode === 'all') {
      await sendNotificationToAllUsers(formData.subject, formData.message);
    } else if (formData.sendMode === 'single' || formData.sendMode === 'multiple') {
      const selectedUsers = users.filter(u => formData.selectedUserIds?.includes(u.id));
      await sendNotificationToMultipleUsers(selectedUsers, formData.subject, formData.message);
    }
  } finally {
    setIsLoading(false);
  }
};

  if (isLoadingUsers) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading users...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <AdminSidebar />
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 mt-1">Send notifications to users</p>
            </div>
        
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Send Notification</h2>
            <p className="text-gray-400">
              Create and send notifications to a single user, multiple users, or broadcast to all users.
            </p>
          </div>

          <NotificationForm
            users={users}
            isLoading={isLoading}
            onSubmit={handleSubmitNotification}
          />
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 p-6 bg-blue-900/20 border border-blue-700/50 rounded-lg"
        >
          <div className="flex gap-4">
            <svg
              className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-300 mb-1">Notification Modes</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li><strong>Single User:</strong> Send to one specific user with name and email search</li>
                <li><strong>Multiple Users:</strong> Select and send to multiple users with multi-select dropdown</li>
                <li><strong>All Users:</strong> Broadcast to all {users.length} users in the system</li>
              </ul>
              <p className="text-blue-200 text-sm mt-3">
                Search users by name or email in dropdown selectors. Notifications appear as "Pending" until users view them.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Users Count Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Total Users in System</div>
              <div className="text-2xl font-bold text-white">{users.length}</div>
            </div>
          </div>
        </motion.div>
      </div>

      <AdminAllNotificationsPage/>
    </main>
  );
}
