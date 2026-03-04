'use client';

import { useSelector } from 'react-redux';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userEmail = useSelector(selectUserEmail);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      setShowModal(true);
    }
  }, [userEmail]);

  // If logged in → render content
  if (userEmail) {
    return <>{children}</>;
  }

  // If NOT logged in → show modal
  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0f0f1e] border border-gray-700 rounded-xl p-6 w-full max-w-sm text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Not Logged In
            </h2>
            <p className="text-gray-400 mb-6">
              Please sign in to continue.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Go to Login
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}