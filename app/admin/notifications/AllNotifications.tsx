"use client";

import React, { useState, useEffect } from "react";
import { NotificationModal } from "@/components/common/NotificationModal";
import { NotificationTable } from "@/components/common/NotificationTable";
import {
  getAllNotifications,
  getNotificationsByStatus,
  markNotificationAsSeen,
} from "@/lib/admin/adminNotificationsService";
import { Notification } from "@/lib/types";
import { motion } from "framer-motion";


export default function AdminAllNotificationsPage() {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // NEW: Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "seen">(
    "all",
  );

  // Fetch notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        let response;

        if (statusFilter === "all") {
          response = await getAllNotifications(1, 100);
        } else {
          response = await getNotificationsByStatus(statusFilter, 1, 100);
        }

        setNotifications(response.notifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    }

    loadNotifications();
  }, [refreshTrigger, statusFilter]);

  // Apply Search
  useEffect(() => {
    const filtered = notifications.filter(
      (notif) =>
        notif.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredNotifications(filtered);
  }, [searchTerm, notifications]);

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
      console.error("Error marking notification as seen:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const unreadCount = notifications.filter(
    (n) => n.status === "pending",
  ).length;

  return (
    <main className="min-h-screen bg-gray-950">


      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-left text-left gap-3">
              

              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center justify-left   w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full"
                >
                  {unreadCount}
                </motion.span>
              )}
            </div>

            <p className="text-gray-400 mt-1">
              {filteredNotifications.length === 0
                ? "No notifications"
                : `${filteredNotifications.length} notification${filteredNotifications.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Search + Filter */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by user, email or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none"
            />

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "pending" | "seen")
              }
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="seen">Seen</option>
            </select>
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
            notifications={filteredNotifications}
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
        isAdmin={true} // ✅ CHANGED
      />
    </main>
  );
}
