'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { InputField } from '@/components/auth/InputField';
import { Button } from '@/components/auth/Button';
import { setTempSignupData, setError, setLoading } from '@/store/authSlice';
import { AppDispatch } from '@/store/store';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber,
} from '@/lib/validation';
import { signUpUser } from '@/lib/authService';
import { sendOtpToEmail, verifyOtpFirestore } from '@/lib/otpService'; 

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoadingState] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const MAX_ATTEMPTS = 5;
  const RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    const rateLimitedUntil = localStorage.getItem('signupRateLimitedUntil');
    if (rateLimitedUntil && new Date().getTime() < parseInt(rateLimitedUntil)) {
      setIsRateLimited(true);
    } else {
      setIsRateLimited(false);
      localStorage.removeItem('signupRateLimitedUntil');
    }
  }, []);

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

    // Validate username
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.valid) {
        newErrors.username = usernameValidation.errors[0];
      }
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const phoneValidation = validatePhoneNumber(formData.phoneNumber);
      if (!phoneValidation.valid) {
        newErrors.phoneNumber = phoneValidation.errors[0];
      }
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Validate confirm password
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

    if (!validateForm()) return;

    setIsLoadingState(true);
    dispatch(setLoading(true));

    try {
      // Save temp signup data in Redux for VerifyEmailPage
      dispatch(
        setTempSignupData({
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        })
      );

      // Send OTP email
      await sendOtpToEmail(formData.email);

      // Redirect to Verify Email page
      router.push('/verify-email');
    }
      catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setErrors({ form: "Failed to send OTP. Try again." });
      }
    } finally {
      setIsLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Stark Trading Journal today"
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
          label="Username"
          placeholder="Enter your username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />

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
          label="Phone Number"
          placeholder="+1 (555) 123-4567"
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
        />

        <InputField
          label="Password"
          placeholder="Minimum 8 characters"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          showPasswordToggle
        />

        <InputField
          label="Confirm Password"
          placeholder="Re-enter your password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          showPasswordToggle
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isRateLimited}
          className="w-full"
        >
          Create Account
        </Button>

        <p className="text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-400">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
