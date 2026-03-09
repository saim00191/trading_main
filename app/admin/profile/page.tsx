'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Lock, LogOut } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminModal } from '@/components/admin/AdminModal';

export default function AdminProfilePage() {
  const router = useRouter();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    // Change password logic here
    setIsChangePasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className="bg-card border border-border rounded-xl p-8 backdrop-blur-sm max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <User size={48} className="text-primary-foreground" />
          </motion.div>
        </div>

        {/* Profile Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin User</h2>
          <p className="text-muted-foreground">System Administrator</p>
          <p className="text-xs text-muted-foreground mt-2">admin@tradingjournalsaas.com</p>
        </div>

        {/* Info Grid */}
        <div className="space-y-4 mb-8 pb-8 border-b border-border">
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Admin Name</p>
            <p className="text-foreground font-medium">Admin User</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Email</p>
            <p className="text-foreground font-medium">admin@tradingjournalsaas.com</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Role</p>
            <p className="text-foreground font-medium">System Administrator</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Status</p>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/20 text-success">
              Active
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.button
            onClick={() => setIsChangePasswordOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock size={20} />
            Change Password
          </motion.button>

          <motion.button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Change Password Modal */}
      <AdminModal
        isOpen={isChangePasswordOpen}
        onClose={() => {
          setIsChangePasswordOpen(false);
          setPasswordError('');
        }}
        title="Change Password"
        size="md"
      >
        <div className="space-y-4">
          {passwordError && (
            <motion.div
              className="p-4 rounded-lg bg-danger/10 border border-danger/50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-danger text-sm font-medium">{passwordError}</p>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              setIsChangePasswordOpen(false);
              setPasswordError('');
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
          >
            Update Password
          </button>
        </div>
      </AdminModal>

      {/* Logout Confirmation Modal */}
      <AdminModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        title="Confirm Logout?"
        size="sm"
      >
        <p className="text-muted-foreground mb-6">
          Are you sure you want to logout from the admin panel? You will need to login again to access it.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLogoutConfirmOpen(false)}
            className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 rounded-lg bg-danger text-foreground font-medium hover:bg-danger/80 transition-colors"
          >
            Logout
          </button>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
