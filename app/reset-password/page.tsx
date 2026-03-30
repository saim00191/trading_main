'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { InputField } from '@/components/auth/InputField';
import { Button } from '@/components/auth/Button';
import { verifyResetCode, confirmPasswordChange } from '@/lib/authService';
import { Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

type PageState = 'loading' | 'invalid' | 'form' | 'success';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Verify reset code on mount
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setPageState('invalid');
        setError('No reset code provided. Please check your email link.');
        return;
      }

      try {
        const result = await verifyResetCode(oobCode);
        if (result.success && result.email) {
          setEmail(result.email);
          setPageState('form');
        } else {
          setPageState('invalid');
          setError(result.error);
        }
      } catch (err) {
        setPageState('invalid');
        setError('Something went wrong. Please try again.');
      }
    };

    verifyCode();
  }, [oobCode]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: 'No password', color: 'bg-gray-600' };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!oobCode) {
        setError('Reset code is missing. Please check your email link.');
        return;
      }

      const result = await confirmPasswordChange(oobCode, formData.password);

      if (result.success) {
        setPageState('success');
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <AuthLayout
        title="Verifying Reset Link"
        subtitle="Please wait while we verify your reset link..."
        backLink="/login"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader className="text-blue-500" size={40} />
          </motion.div>
          <p className="text-gray-400 text-center">Verifying reset link...</p>
        </div>
      </AuthLayout>
    );
  }

  // Invalid link state
  if (pageState === 'invalid') {
    return (
      <AuthLayout
        title="Reset Link Invalid"
        subtitle="Unable to process your request"
        backLink="/login"
      >
        <div className="space-y-6">
          {/* Error icon */}
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-full">
              <AlertCircle className="text-red-500" size={48} />
            </div>
          </motion.div>

          {/* Error message */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-white mb-2">Reset Link Expired</h2>
            <p className="text-gray-400 text-sm mb-4">
              {error || 'This reset link is invalid or has expired. Please request a new one.'}
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/forgot-password" className="block">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>

            <Link href="/login" className="block">
              <button className="w-full text-center text-blue-500 hover:text-blue-400 text-sm transition-colors py-2">
                Back to Login
              </button>
            </Link>
          </motion.div>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Your password has been successfully reset"
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
            <p className="text-gray-300 mb-2">Your password has been successfully updated.</p>
            <p className="text-sm text-gray-400">You will be redirected to login in a few seconds...</p>
          </motion.div>

          {/* Action button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/login" className="block">
              <Button className="w-full">Go to Login Now</Button>
            </Link>
          </motion.div>
        </div>
      </AuthLayout>
    );
  }

  // Form state
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
      backLink="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info message */}
        <motion.div
          className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-start gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Lock className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
          <p className="text-sm text-gray-300">
            Please enter a strong password to secure your account.
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

        {/* Password input */}
        <InputField
          label="New Password"
          placeholder="Enter a strong password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          showPasswordToggle={true}
          
        />

        {/* Password strength indicator */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Password strength:</span>
              <span className={passwordStrength.score === 4 ? 'text-green-400' : 'text-gray-400'}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full ${passwordStrength.color}`}
              />
            </div>
          </motion.div>
        )}

        {/* Confirm password input */}
        <InputField
          label="Confirm Password"
          placeholder="Re-enter your password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          showPasswordToggle={true}
          
        />

        {/* Submit button */}
        <Button type="submit" isLoading={isLoading} className="w-full">
          Reset Password
        </Button>

        {/* Back to login */}
        <p className="text-center text-gray-400 text-sm">
          Remembered your password?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-400">
            Sign in instead
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
