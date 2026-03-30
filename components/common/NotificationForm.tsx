'use client';

import React, { useState } from 'react';
import { User, SendMode } from '@/lib/types';
import { SingleUserDropdown } from './SingleUserDropdown';
import { MultiUserDropdown } from './MultiUserDropdown';
import { motion } from 'framer-motion';

interface NotificationFormProps {
  users: User[];
  isLoading: boolean;
  onSubmit: (formData: {
    subject: string;
    message: string;
    sendMode: SendMode;
    selectedUserIds?: string[];
  }) => Promise<void>;
  onSuccess?: () => void;
}

export function NotificationForm({
  users,
  isLoading,
  onSubmit,
  onSuccess,
}: NotificationFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendMode, setSendMode] = useState<SendMode>('single');
  const [singleUserId, setSingleUserId] = useState<string | null>(null);
  const [multipleUserIds, setMultipleUserIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    if (sendMode === 'single' && !singleUserId) {
      setError('Please select a user');
      return;
    }

    if (sendMode === 'multiple' && multipleUserIds.length === 0) {
      setError('Please select at least one user');
      return;
    }

    try {
      await onSubmit({
        subject: subject.trim(),
        message: message.trim(),
        sendMode,
        selectedUserIds: sendMode === 'single' ? [singleUserId!] : sendMode === 'multiple' ? multipleUserIds : undefined,
      });

      setSuccess(true);
      setSubject('');
      setMessage('');
      setSingleUserId(null);
      setMultipleUserIds([]);

      onSuccess?.();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Notification sent successfully!
        </motion.div>
      )}

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g., New Feature Alert"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
        />
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Enter your notification message..."
          rows={5}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors resize-none"
        />
      </div>

      {/* Send Mode Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Send Mode <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {/* Single User */}
          <label className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
            <input
              type="radio"
              name="sendMode"
              value="single"
              checked={sendMode === 'single'}
              onChange={() => setSendMode('single')}
              className="w-4 h-4 cursor-pointer accent-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium text-white">Send to Single User</div>
              <div className="text-sm text-gray-400">Notify one specific user</div>
            </div>
          </label>

          {/* Multiple Users */}
          <label className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
            <input
              type="radio"
              name="sendMode"
              value="multiple"
              checked={sendMode === 'multiple'}
              onChange={() => setSendMode('multiple')}
              className="w-4 h-4 cursor-pointer accent-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium text-white">Send to Multiple Users</div>
              <div className="text-sm text-gray-400">Notify selected users</div>
            </div>
          </label>

          {/* All Users */}
          <label className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
            <input
              type="radio"
              name="sendMode"
              value="all"
              checked={sendMode === 'all'}
              onChange={() => setSendMode('all')}
              className="w-4 h-4 cursor-pointer accent-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium text-white">Send to All Users</div>
              <div className="text-sm text-gray-400">Notify all {users.length} users</div>
            </div>
          </label>
        </div>
      </div>

      {/* User Selection (Single) */}
      {sendMode === 'single' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select User <span className="text-red-500">*</span>
          </label>
          <SingleUserDropdown
            users={users}
            selectedUserId={singleUserId}
            onSelectionChange={setSingleUserId}
          />
        </div>
      )}

      {/* User Selection (Multiple) */}
      {sendMode === 'multiple' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Users <span className="text-red-500">*</span>
          </label>
          <MultiUserDropdown
            users={users}
            selectedUserIds={multipleUserIds}
            onSelectionChange={setMultipleUserIds}
          />
        </div>
      )}

      {/* Send to All Confirmation */}
      {sendMode === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg text-amber-300 text-sm flex items-start gap-3"
        >
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div className="font-medium mb-1">Send to all {users.length} users</div>
            <div className="text-xs opacity-90">
              This notification will be sent to every user in the system.
            </div>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z" />
            </svg>
            Send Notification
          </>
        )}
      </button>
    </form>
  );
}
