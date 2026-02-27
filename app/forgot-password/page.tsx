'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { InputField } from '@/components/auth/InputField';
import { Button } from '@/components/auth/Button';
import { validateEmail } from '@/lib/validation';
import { resetPassword } from '@/lib/authService';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Failed to send reset link. Please try again.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="Password reset link sent"
        backLink="/login"
      >
        <div className="space-y-6">
          {/* Success icon */}
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-full">
              <CheckCircle className="text-green-500" size={48} />
            </div>
          </motion.div>

          {/* Success message */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-300 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="font-semibold text-blue-500 mb-4">{email}</p>
            <p className="text-sm text-gray-400">
              Check your email and follow the link to reset your password. If you don't see
              it, check your spam folder.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Back to Login
            </Button>

            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full text-center text-blue-500 hover:text-blue-400 text-sm transition-colors py-2"
            >
              Try another email
            </button>
          </motion.div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions"
      backLink="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info message */}
        <motion.div
          className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-start gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Mail className="text-blue-500 mt-0.5 " size={20} />
          <p className="text-sm text-gray-300">
            Enter the email address associated with your account and we'll send you a link
            to reset your password.
          </p>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Email input */}
        <InputField
          label="Email Address"
          placeholder="your@email.com"
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
        />

        {/* Submit button */}
        <Button type="submit" isLoading={isLoading} className="w-full">
          Send Reset Link
        </Button>

        {/* Back to login */}
        <p className="text-center text-gray-400 text-sm">
          Remember your password?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-400">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
