'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { InputField } from '@/components/auth/InputField';
import { Button } from '@/components/auth/Button';
import { setUser, setError, setLoading } from '@/store/authSlice';
import { RootState, AppDispatch } from '@/store/store';
import { validateEmail, validatePassword } from '@/lib/validation';
import { setEmail } from '@/store/UserLoggedInSlice';
import { loginUser, setupPersistence } from '@/lib/authService';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoadingState] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Set up Firebase persistence
  useEffect(() => {
    setupPersistence();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoadingState(true);
    dispatch(setLoading(true));

    try {
      const result = await loginUser({ email: formData.email, password: formData.password });
      if (result.success && result.user) {
        if (rememberMe) localStorage.setItem('rememberMe', 'true');

        dispatch(setUser(result.user));
        dispatch(setEmail(formData.email)); // ✅ Save email to Redux + localStorage

        // console.log('Login successful:', result.user);
        // console.log("Sending email to Redux:", formData.email);

        router.push('/dashboard');
      } else {
        setErrors({ form: result.error || 'Login failed. Please try again.' });
      }
    } catch {
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoadingState(false);
      dispatch(setLoading(false));
    }
  };


  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your trading journal"
      backLink="/"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.form && (
          <motion.div
            className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {errors.form}
          </motion.div>
        )}

        <InputField
          label="Email"
          placeholder="your@email.com"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <InputField
          label="Password"
          placeholder="Enter your password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          showPasswordToggle
        />

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-400">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isRateLimited}
          className="w-full"
        >
          Sign In
        </Button>

        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:text-blue-400">
            Create one now
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
