'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Ban, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  userType: 'Free' | 'Pro';
  joinDate: string;
  subscriptionEnd: string;
  status: 'Active' | 'Blocked';
}

// Mock user data
const mockUsers: User[] = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    phone: '+92-300-1234567',
    userType: 'Pro',
    joinDate: '2024-01-15',
    subscriptionEnd: '2024-04-15',
    status: 'Active',
  },
  {
    id: 2,
    username: 'alice_smith',
    email: 'alice@example.com',
    phone: '+92-301-2345678',
    userType: 'Free',
    joinDate: '2024-02-20',
    subscriptionEnd: 'N/A',
    status: 'Active',
  },
  {
    id: 3,
    username: 'bob_wilson',
    email: 'bob@example.com',
    phone: '+92-302-3456789',
    userType: 'Pro',
    joinDate: '2024-01-05',
    subscriptionEnd: '2024-03-05',
    status: 'Blocked',
  },
  {
    id: 4,
    username: 'carol_johnson',
    email: 'carol@example.com',
    phone: '+92-303-4567890',
    userType: 'Free',
    joinDate: '2024-02-10',
    subscriptionEnd: 'N/A',
    status: 'Active',
  },
  {
    id: 5,
    username: 'dave_brown',
    email: 'dave@example.com',
    phone: '+92-304-5678901',
    userType: 'Pro',
    joinDate: '2023-12-01',
    subscriptionEnd: '2024-05-01',
    status: 'Active',
  },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'All' | 'Free' | 'Pro'>('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'delete' | null>(null);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = userTypeFilter === 'All' || user.userType === userTypeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, userTypeFilter]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    setActionType('block');
    setIsConfirmModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setActionType('delete');
    setIsConfirmModalOpen(true);
  };

  const confirmAction = () => {
    // Action would be performed here
    setIsConfirmModalOpen(false);
    setSelectedUser(null);
    setActionType(null);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Users Management</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 mb-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-muted-foreground" />
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value as 'All' | 'Free' | 'Pro')}
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            >
              <option>All Users</option>
              <option>Free</option>
              <option>Pro</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AdminTable<User>
          columns={[
            { key: 'username', label: 'Username' },
            { key: 'email', label: 'Email' },
            { key: 'userType', label: 'Type', render: (value) => (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                value === 'Pro' ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
              }`}>
                {value}
              </span>
            )},
            { key: 'joinDate', label: 'Join Date' },
            { key: 'status', label: 'Status', render: (value) => (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                value === 'Active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
              }`}>
                {value}
              </span>
            )},
          ]}
          data={filteredUsers}
          actions={(user) => (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => handleViewUser(user)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="View User"
              >
                <Eye size={18} className="text-primary" />
              </motion.button>
              <motion.button
                onClick={() => handleBlockUser(user)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Block User"
              >
                <Ban size={18} className="text-warning" />
              </motion.button>
              <motion.button
                onClick={() => handleDeleteUser(user)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Delete User"
              >
                <Trash2 size={18} className="text-danger" />
              </motion.button>
            </div>
          )}
        />
      </motion.div>

      {/* View User Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Username</p>
              <p className="text-foreground font-medium">{selectedUser.username}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Email</p>
              <p className="text-foreground font-medium">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Phone</p>
              <p className="text-foreground font-medium">{selectedUser.phone}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">User Type</p>
                <p className="text-foreground font-medium">{selectedUser.userType}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Status</p>
                <p className={selectedUser.status === 'Active' ? 'text-success' : 'text-danger'}>
                  {selectedUser.status}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Join Date</p>
              <p className="text-foreground font-medium">{selectedUser.joinDate}</p>
            </div>
          </div>
        )}
        actions={
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
          >
            Close
          </button>
        }
      />

      {/* Confirm Action Modal */}
      <AdminModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={actionType === 'block' ? 'Block User?' : 'Delete User?'}
        size="sm"
      >
        <p className="text-muted-foreground mb-6">
          {actionType === 'block'
            ? `Are you sure you want to block ${selectedUser?.email}? They won't be able to access their account.`
            : `Are you sure you want to permanently delete ${selectedUser?.email}? This action cannot be undone.`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsConfirmModalOpen(false)}
            className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmAction}
            className={`flex-1 px-4 py-2 rounded-lg text-primary-foreground font-medium transition-colors ${
              actionType === 'block'
                ? 'bg-warning hover:bg-warning/80'
                : 'bg-danger hover:bg-danger/80'
            }`}
          >
            {actionType === 'block' ? 'Block User' : 'Delete User'}
          </button>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
