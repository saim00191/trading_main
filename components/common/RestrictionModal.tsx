'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { Lock, AlertCircle, TrendingDown } from 'lucide-react';
import { RestrictionModalType } from '@/hooks/useRestrictionModal';

interface RestrictionModalProps {
  isOpen: boolean;
  modalType: RestrictionModalType;
}

const modalConfig = {
  blocked: {
    title: 'Your Account Was Locked',
    description: 'Your account has been restricted due to security or policy reasons. Please contact support to resolve this issue.',
    buttonLabel: 'Contact Support',
    buttonPath: '/dashboard/contact-support',
    icon: Lock,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  trial: {
    title: 'Your Trial Was Ended',
    description: 'Your trial period has ended. Upgrade your plan to continue using all features without interruption.',
    buttonLabel: 'Upgrade Now',
    buttonPath: '/dashboard/upgrade',
    icon: AlertCircle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  trade_limit: {
    title: 'Trade Limit Exceeded',
    description: 'You have reached your free trial trade limit. Upgrade your plan to continue trading.',
    buttonLabel: 'Upgrade Plan',
    buttonPath: '/dashboard/upgrade',
    icon: TrendingDown,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
};

export function RestrictionModal({ isOpen, modalType }: RestrictionModalProps) {
  const router = useRouter();

  if (!isOpen || !modalType) {
    return null;
  }

  const config = modalConfig[modalType];
  const IconComponent = config.icon;

  const handleAction = () => {
    router.push(config.buttonPath);
  };

  return (
    <AnimatePresence>
      {isOpen && modalType && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.preventDefault()}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.preventDefault()}
          >
            <div className={`
              relative w-full max-w-md rounded-2xl border backdrop-blur-xl
              bg-gray-900/80 shadow-2xl
              ${config.borderColor}
            `}>
              {/* Gradient background */}
              <div className={`absolute inset-0 rounded-2xl ${config.bgColor} opacity-20`} />

              {/* Content */}
              <div className="relative space-y-6 p-8">
                {/* Icon */}
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${config.bgColor}`}>
                  <IconComponent className={`${config.color} h-8 w-8`} />
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {config.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-300">
                    {config.description}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleAction}
                  className={`
                    w-full rounded-lg px-4 py-3 font-semibold
                    transition-all duration-200
                    text-white
                    ${modalType === 'blocked'
                      ? 'bg-red-600 hover:bg-red-700 active:scale-95'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                    }
                  `}
                >
                  {config.buttonLabel}
                </button>

                {/* Footer info */}
                <p className="text-xs text-center text-gray-500">
                  {modalType === 'blocked'
                    ? 'This action cannot be undone without contacting support.'
                    : 'Upgrade to unlock all premium features.'}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
