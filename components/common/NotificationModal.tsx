'use client';

import React, { useEffect } from 'react';
import { Notification } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsSeen?: (notificationId: string) => void;
  isAdmin?: boolean; // ✅ NEW PROP
}
export function NotificationModal({
  notification,
  isOpen,
  onClose,
  onMarkAsSeen,
  isAdmin = false,
}: NotificationModalProps) {
 useEffect(() => {
    if (!isAdmin && isOpen && notification && notification.status === 'pending') {
      onMarkAsSeen?.(notification.id);
    }
  }, [isOpen, notification, onMarkAsSeen, isAdmin]);

  if (!notification) return null;

  const formattedDate = new Date(notification.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full shadow-2xl">
              {/* Header */}
              <div className="border-b border-gray-700 px-6 py-4 flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white">{notification.subject}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        notification.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}
                    >
                      {notification.status === 'pending' ? 'Pending' : 'Seen'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-200 text-2xl leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Message</h3>
                  <p className="text-gray-100 text-base leading-relaxed">{notification.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <h3 className="text-sm font-medium text-gray-400 mb-1">
                      {isAdmin ? 'To' : 'Username'} {/* ✅ CHANGED */}
                    </h3>
                    <p className="text-gray-100">{notification.username}</p>
                  </div>
                  <div>
                    <h3 className=" font-medium text-gray-400 mb-1 text-[12px] sm:text-sm">Email</h3>
                    <p className="text-gray-100">{notification.email}</p>
                  </div>
                </div>

                <div>
                 <h3 className="text-sm font-medium text-gray-400 mb-1">
                    {isAdmin ? 'Sent' : 'Received'} {/* ✅ CHANGED */}
                  </h3>
                  <p className="text-gray-100">{formattedDate}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-700 px-6 py-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
