'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiUserDropdownProps {
  users: User[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
}

export function MultiUserDropdown({
  users,
  selectedUserIds,
  onSelectionChange,
}: MultiUserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUsers = users.filter(
    user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
  const allVisibleSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];
    onSelectionChange(newSelection);
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = filteredUsers.map(u => u.id);
      const newSelection = selectedUserIds.filter(id => !visibleIds.includes(id));
      onSelectionChange(newSelection);
    } else {
      const visibleIds = filteredUsers.map(u => u.id);
      const newSelection = [...new Set([...selectedUserIds, ...visibleIds])];
      onSelectionChange(newSelection);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-left text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors flex items-center justify-between"
      >
        <span>
          {selectedUserIds.length === 0 ? (
            <span className="text-gray-500">Select users...</span>
          ) : (
            <div>
              <div className="text-sm text-gray-400">
                {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
              </div>
              <div className="font-medium text-white">
                {selectedUsers.slice(0, 2).map(u => u.username).join(', ')}
                {selectedUsers.length > 2 && ` +${selectedUsers.length - 2} more`}
              </div>
            </div>
          )}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {/* Search Input */}
            <div className="border-b border-gray-700 p-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
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
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Select All Visible */}
            {filteredUsers.length > 0 && (
              <div className="border-b border-gray-700 px-4 py-3 flex items-center gap-3 bg-gray-900/50">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-300 cursor-pointer flex-1">
                  Select all shown ({filteredUsers.length})
                </label>
              </div>
            )}

            {/* User List */}
            <div className="max-h-64 overflow-y-auto">
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
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{user.username}</div>
                      <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Users Preview */}
      {selectedUserIds.length > 0 && (
        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="text-xs font-medium text-blue-300 mb-2">
            Selected users ({selectedUserIds.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.slice(0, 3).map(user => (
              <div
                key={user.id}
                className="px-2 py-1 bg-blue-600/40 text-blue-200 text-xs rounded-lg flex items-center gap-2"
              >
                <span>{user.username}</span>
                <button
                  onClick={() => toggleUser(user.id)}
                  className="hover:text-blue-100 transition-colors"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedUsers.length > 3 && (
              <div className="px-2 py-1 bg-blue-600/40 text-blue-200 text-xs rounded-lg">
                +{selectedUsers.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
