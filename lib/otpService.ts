// otpService.ts
import { db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

// OTP validity duration in minutes
const OTP_EXPIRATION_MINUTES = 10;

// Generate random 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to user email
 */
export const sendOtpToEmail = async (email: string) => {
  const otp = generateOtp();

  // Save OTP in Firestore
  await setDoc(
    doc(db, 'emailOtps', email),
    {
      otp,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Send OTP via EmailJS
  // Make sure to configure EmailJS in your frontend
  const templateParams = {
    to_email: email,
    otp_code: otp,
  };

  await emailjs.send(
    'service_re2vqyf',    // replace with your EmailJS service ID
    'template_jot3pco',   // replace with your EmailJS template ID
    templateParams,
    'Smw43TFvzEoTwxKea'     // replace with your EmailJS public key
  );

  return true;
};

/**
 * Verify OTP entered by user
 */
export const verifyOtpFirestore = async (email: string, enteredOtp: string) => {
  const otpDoc = await getDoc(doc(db, 'emailOtps', email));

  if (!otpDoc.exists()) {
    throw new Error('No OTP found. Please request a new one.');
  }

  const data = otpDoc.data();
  const savedOtp = data.otp as string;
  const createdAt = data.createdAt?.toDate?.() || new Date();

  // Check expiration
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
  if (diffMinutes > OTP_EXPIRATION_MINUTES) {
    throw new Error('OTP expired. Please request a new one.');
  }

  if (enteredOtp !== savedOtp) {
    throw new Error('Invalid OTP. Please try again.');
  }

  // OTP is correct, delete it (optional)
  await setDoc(
    doc(db, 'emailOtps', email),
    { otp: '' },
    { merge: true }
  );

  return true;
};