import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  UserCredential,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, DocumentData } from 'firebase/firestore';
import { supabase } from './supabaseClient';
import { addMonths } from 'date-fns';
import type { User } from '@/store/authSlice';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  phoneNumber: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthSuccessResponse {
  success: true;
  user?: User;
}

interface AuthErrorResponse {
  success: false;
  error: string;
}

type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

// Set persistence
export const setupPersistence = async (): Promise<void> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error setting persistence:', error.message);
    }
  }
};

// Sign Up
export const signUpUser = async (
  data: SignUpData
): Promise<AuthResponse> => {
  try {
    const userCredential: UserCredential =
      await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

    const user = userCredential.user;

    await sendEmailVerification(user);

    const now = new Date().toISOString();
    const timePeriodEnd = addMonths(new Date(), 1).toISOString();

    const { error } = await supabase.from("users").insert([
      {
        firebase_uid: user.uid,
        username: data.username,
        email: data.email,
        phone: data.phoneNumber,
        created_at: now,
        time_period_start: now,
        time_period_end: timePeriodEnd,
        user_type: "free",
      },
    ]);

    if (error) {
      return {
        success: false,
        error: "User created in Firebase but failed in Supabase",
      };
    }

    return {
      success: true,
     user: {
    uid: user.uid,
    username: data.username,
    email: user.email ?? '',
    phoneNumber: data.phoneNumber,
    role: 'user',
    emailVerified: user.emailVerified,
    createdAt: now,
  },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Sign up failed" };
  }
};

// Login
export const loginUser = async (
  data: LoginData
): Promise<AuthResponse> => {
  try {
    const userCredential: UserCredential =
      await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData: DocumentData | undefined = userDoc.data();

    const token = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        username: userData?.username ?? '',
        email: userData?.email ?? '',
        phoneNumber: userData?.phoneNumber ?? '',
        token,
        role: userData?.role ?? 'user',
        emailVerified: user.emailVerified,
        createdAt: userData?.createdAt ?? '',
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Login failed' };
  }
};

// Logout
export const logoutUser = async (): Promise<AuthResponse> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Logout failed' };
  }
};

// Forgot Password
export const resetPassword = async (
  email: string
): Promise<AuthResponse> => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
    });
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Password reset failed' };
  }
};

// Update user email verification
export const updateUserEmailVerified = async (
  uid: string
): Promise<AuthResponse> => {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { emailVerified: true },
      { merge: true }
    );
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Update failed' };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};