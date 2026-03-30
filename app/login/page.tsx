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
import { selectUserEmail, setEmail } from '@/store/UserLoggedInSlice';
import { loginUser, setupPersistence } from '@/lib/authService';
import { FirebaseError } from 'firebase/app';
import {AlreadySignedInModal} from '@/components/AlreadySignedIn';

type AuthSuccessResponse = {
  success: true;
  user: unknown;
};

type AuthErrorResponse = {
  success: false;
  error: string;
};

type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

export default function LoginPage() {
   const loggedInUserEmail = useSelector(selectUserEmail);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

   const [showAlreadySignedInModal, setShowAlreadySignedInModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoadingState] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    setupPersistence();
  }, []);

  // Check if already logged in and show modal
  useEffect(() => {
    if (loggedInUserEmail) {
      setShowAlreadySignedInModal(true);
    }
  }, [loggedInUserEmail]);

  // Redirect if already authenticated (after modal is dismissed)
  useEffect(() => {
    if (isAuthenticated && !showAlreadySignedInModal) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, showAlreadySignedInModal, router]);

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


const getFirebaseErrorMessage = (raw: string): string => {
  // Extract code inside parentheses if string is like "Firebase: Error (auth/...)"  
  const match = raw.match(/\(([^)]+)\)/);
  const code = match ? match[1] : raw;

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';

    case 'auth/user-disabled':
      return 'This account has been disabled.';

    case 'auth/user-not-found':
      return 'No account found with this email.';

    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';

    case 'auth/too-many-requests':
      return 'Too many login attempts. Please try again later.';

    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';

    case 'auth/invalid-credential':
      return 'Invalid email or password.';

    case 'auth/internal-error':
      return 'Server error. Please try again later.';

    case 'auth/operation-not-allowed':
      return 'Email/password login is not enabled.';

    default:
      return 'Login failed. Please try again.';
  }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoadingState(true);
  dispatch(setLoading(true));

  try {
    const result = await loginUser({
      email: formData.email,
      password: formData.password,
    });

    console.log('Login result:', result);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

       if (!result.user) {
    setErrors({ form: 'User data not found. Please try again.' });
    return;
  }

      dispatch(setUser(result.user));
      dispatch(setEmail(formData.email));

      router.push('/dashboard');
    } else {
  

      setErrors({
        form: getFirebaseErrorMessage(result.error),
      });
    }
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
    
      setErrors({
        form: getFirebaseErrorMessage(`Firebase: Error (${error.code})`),
      });
    } else if (error instanceof Error) {

      setErrors({
        form: error.message,
      });
    } else {
   
      setErrors({
        form: 'Login failed. Please try again.',
      });
    }
  } finally {
    setIsLoadingState(false);
    dispatch(setLoading(false));
  }
};

  return (
    <>
    
    
  <AlreadySignedInModal
      isOpen={showAlreadySignedInModal}
  
    />
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
    </>
  );
}
