'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { LogOut, CheckCircle } from 'lucide-react';
import { clearEmail } from '@/store/UserLoggedInSlice';
import { logout } from '@/store/authSlice';
import { AppDispatch } from '@/store/store';

interface AlreadySignedInModalProps {
  isOpen: boolean;
}

export const AlreadySignedInModal: React.FC<AlreadySignedInModalProps> = ({
  isOpen,

}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(clearEmail());
    dispatch(logout());
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          {/* MODAL BOX */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-blue-500" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              Already Signed In
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-center text-sm mb-8">
              You are already logged into your account. You can continue using the platform or logout to switch accounts.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-all duration-200 font-medium text-sm"
              >
                <LogOut size={18} />
                Logout 
              </button>

              {/* Continue Button */}
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white font-medium text-sm"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};