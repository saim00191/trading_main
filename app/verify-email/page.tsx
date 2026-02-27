"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { OTPInput } from '@/components/auth/OTPInput';
import { Button } from '@/components/auth/Button';
import { RootState, AppDispatch } from '@/store/store';
import { setLoading, setError } from '@/store/authSlice';
import { Mail } from 'lucide-react';
import { signUpUser } from '@/lib/authService';
import { sendOtpToEmail, verifyOtpFirestore } from '@/lib/otpService'; 

export default function VerifyEmailPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Get temporary signup data from Redux
  const tempSignupData = useSelector(
    (state: RootState) => state.auth.tempSignupData
  );

  // Local states
  const [otp, setOtp] = useState('');
  const [error, setErrorState] = useState('');
  const [isLoading, setIsLoadingState] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Redirect if no signup data
  useEffect(() => {
    if (!tempSignupData?.email) router.push('/signup');
  }, [tempSignupData, router]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Handle OTP input completion
  const handleOTPComplete = (value: string) => {
    if (value.length === 6) verifyOTP(value);
  };

  // Verify OTP and create account
  const verifyOTP = async (otpValue: string) => {
    setIsLoadingState(true);
    dispatch(setLoading(true));
    setErrorState('');

    try {
      // Validate OTP format
      if (!/^\d{6}$/.test(otpValue)) {
        setErrorState('Enter a valid 6-digit OTP');
        return;
      }

      // Verify OTP with your backend / Firestore
      const verified = await verifyOtpFirestore(tempSignupData?.email, otpValue);
      if (!verified) {
        setErrorState('Invalid OTP. Please try again.');
        return;
      }

      // Create Firebase account now
      const result = await signUpUser({
        username: tempSignupData.username,
        email: tempSignupData.email,
        phoneNumber: tempSignupData.phoneNumber,
        password: tempSignupData.password!,
      });

      if (!result.success) {
        setErrorState(result.error || 'Account creation failed.');
        return;
      }

      // Redirect to login
      router.push('/login');
    } catch (err: any) {
      setErrorState(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!tempSignupData?.email) return;
    setIsLoadingState(true);
    setErrorState('');

    try {
      await sendOtpToEmail(tempSignupData.email);
      setTimeLeft(60);
      setCanResend(false);
      setOtp('');
    } catch (err: any) {
      setErrorState('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoadingState(false);
    }
  };

  if (!tempSignupData?.email) return null;
  return (
    <AuthLayout
      title="Verify Email"
      subtitle="Enter the OTP sent to your email"
      backLink="/signup"
    >
      <div className="space-y-6">
        {/* Email display */}
        <motion.div
          className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Mail className="text-blue-500" size={20} />
          <p className="text-sm text-gray-300">
            OTP sent to{" "}
            <span className="font-semibold">{tempSignupData.email}</span>
          </p>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* OTP Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-gray-400 mb-4 text-center">
            Enter the 6-digit OTP
          </p>
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            onComplete={handleOTPComplete}
          />
        </motion.div>

        {/* Countdown */}
        <motion.div
          className="flex justify-center items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {!canResend ? (
            <>
              <span className="text-sm text-gray-400">Resend OTP in</span>
              <span className="text-sm font-semibold text-blue-500">
                {String(timeLeft).padStart(2, "0")}s
              </span>
            </>
          ) : (
            <Button
              onClick={handleResendOTP}
              variant="outline"
              isLoading={isLoading}
              className="text-sm px-4 py-2"
            >
              Resend OTP
            </Button>
          )}
        </motion.div>

        {/* Verify button */}
        {otp.length === 6 && (
          <Button
            onClick={() => verifyOTP(otp)}
            isLoading={isLoading}
            className="w-full"
          >
            Verify OTP
          </Button>
        )}
      </div>
    </AuthLayout>
  );
}
