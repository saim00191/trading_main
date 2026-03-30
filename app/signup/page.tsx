'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
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
import { sendOtpToEmail } from '@/lib/otpService'; 
import { FirebaseError } from 'firebase/app';
import {AlreadySignedInModal} from '@/components/AlreadySignedIn';
import { selectUserEmail } from '@/store/UserLoggedInSlice';

export default function SignupPage() {
     const loggedInUserEmail = useSelector(selectUserEmail);
      const [showAlreadySignedInModal, setShowAlreadySignedInModal] = useState(false);
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


   useEffect(() => {
    const rateLimitedUntil = localStorage.getItem('signupRateLimitedUntil');
    if (rateLimitedUntil && new Date().getTime() < parseInt(rateLimitedUntil)) {
      setIsRateLimited(true);
    } else {
      setIsRateLimited(false);
      localStorage.removeItem('signupRateLimitedUntil');
    }
  }, []);

  useEffect(() => {
    if (loggedInUserEmail) {
      setShowAlreadySignedInModal(true);
    }
  }, [loggedInUserEmail]);

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

const getFirebaseErrorMessage = (raw: string): string => {
  // Extract the code inside parentheses
  const match = raw.match(/\(([^)]+)\)/);
  const code = match ? match[1] : raw;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';

    case 'auth/invalid-email':
      return 'Please enter a valid email address.';

    case 'auth/operation-not-allowed':
      return 'Email/password signup is not enabled.';

    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.';

    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';

    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';

    default:
      return 'Failed to send OTP. Please try again.';
  }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoadingState(true);
  dispatch(setLoading(true));
  setErrors({});

  try {
    // ✅ Save temp signup data in Redux (no actual account creation yet)
    dispatch(
      setTempSignupData({
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      })
    );

    // ✅ Send OTP to email
    await sendOtpToEmail(formData.email);

    router.push('/verify-email'); // Go to OTP page
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      setErrors({
        form: `Firebase Error: ${error.code}`,
      });
    } else if (error instanceof Error) {
      setErrors({ form: error.message });
    } else {
      setErrors({ form: 'Failed to send OTP. Please try again.' });
    }
  } finally {
    setIsLoadingState(false);
    dispatch(setLoading(false));
  }
};

// const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();

//   if (!validateForm()) return;

//   setIsLoadingState(true);
//   dispatch(setLoading(true));

//   try {
//     // Save temp signup data for OTP verification
//     dispatch(
//       setTempSignupData({
//         username: formData.username,
//         email: formData.email,
//         phoneNumber: formData.phoneNumber,
//         password: formData.password,
//       })
//     );

//     // Send OTP to user's email
//     await sendOtpToEmail(formData.email);

//     router.push('/verify-email');
//   } catch (error: unknown) {
//     if (error instanceof FirebaseError) {
//       console.log('FirebaseError caught:', error.code);
//       setErrors({
//         form: getFirebaseErrorMessage(`Firebase: Error (${error.code})`),
//       });
//     } else if (error instanceof Error) {
//       console.log('Generic error caught:', error.message);
//       setErrors({
//         form: error.message,
//       });
//     } else {
//       console.log('Unknown error caught:', error);
//       setErrors({
//         form: 'Failed to send OTP. Please try again.',
//       });
//     }
//   } finally {
//     setIsLoadingState(false);
//     dispatch(setLoading(false));
//   }
// };
  return (
<>
    <AlreadySignedInModal
    isOpen={showAlreadySignedInModal}

  />
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
    </>
  );
}
