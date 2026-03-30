'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import { motion } from 'framer-motion';

interface UserSelectorProps {
  users: User[];
  selectedEmails: string[];
  sendToAll: boolean;
  onSelectionChange: (emails: string[]) => void;
  onSendToAllChange: (sendToAll: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function UserSelector({
  users,
  selectedEmails,
  sendToAll,
  onSelectionChange,
  onSendToAllChange,
  searchQuery,
  onSearchChange,
}: UserSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredUsers = users.filter(
    user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (email: string) => {
    const newSelection = selectedEmails.includes(email)
      ? selectedEmails.filter(e => e !== email)
      : [...selectedEmails, email];
    onSelectionChange(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedEmails.length === users.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map(u => u.email));
    }
  };

  return (
    <div className="space-y-4">
      {/* Send to All Toggle */}
      <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <input
          type="checkbox"
          id="send-to-all"
          checked={sendToAll}
          onChange={e => onSendToAllChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
        <label htmlFor="send-to-all" className="flex-1 cursor-pointer">
          <div className="font-medium text-white">Send to all users</div>
          <div className="text-sm text-gray-400">Notify all {users.length} users</div>
        </label>
      </div>

      {!sendToAll && (
        <>
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* User List */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-700 px-4 py-3 flex items-center justify-between bg-gray-900/50">
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedEmails.length === users.length && users.length > 0}
                  onChange={toggleAllUsers}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-300">
                  {selectedEmails.length} of {users.length} selected
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                {isExpanded ? '−' : '+'}
              </button>
            </div>

            {/* Users List */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 last:border-0 hover:bg-gray-700/30 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(user.email)}
                        onChange={() => toggleUserSelection(user.email)}
                        className="w-4 h-4 cursor-pointer accent-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Selected Users Preview */}
      {!sendToAll && selectedEmails.length > 0 && (
        <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="text-sm font-medium text-blue-300 mb-2">
            Selected users ({selectedEmails.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedEmails.slice(0, 3).map(email => (
              <span
                key={email}
                className="px-2 py-1 bg-blue-600/40 text-blue-200 text-xs rounded-lg"
              >
                {email}
              </span>
            ))}
            {selectedEmails.length > 3 && (
              <span className="px-2 py-1 bg-blue-600/40 text-blue-200 text-xs rounded-lg">
                +{selectedEmails.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
