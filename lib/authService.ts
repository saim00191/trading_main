import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { supabase } from './supabaseClient';

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

// Set persistence
export const setupPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error('Error setting persistence:', error);
  }
};

// Sign Up
export const signUpUser = async (data: SignUpData) => {
  try {
    // 1️⃣ Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCredential.user;

    // 2️⃣ Send email verification
    await sendEmailVerification(user);

    // 3️⃣ Store in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      username: data.username,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: 'user',
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });

    // 4️⃣ Store in Supabase
    const { error } = await supabase.from('users').insert([
      {
        firebase_uid: user.uid,
        username: data.username,
        email: data.email,
        phone: data.phoneNumber,
      },
    ]);

    if (error) {
      console.error('Supabase Insert Error:', error);
      return {
        success: false,
        error: 'User created in Firebase but failed in Supabase',
      };
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Sign up failed',
    };
  }
};

// Login
export const loginUser = async (data: LoginData) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCredential.user;

 
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    const token = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        username: userData?.username || '',
        email: userData?.email || '',
        phoneNumber: userData?.phoneNumber || '',
        token,
        role: userData?.role || 'user',
        emailVerified: user.emailVerified,
        createdAt: userData?.createdAt,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Logout failed',
    };
  }
};

// Forgot Password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
    });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Password reset failed',
    };
  }
};

// Update user email verification
export const updateUserEmailVerified = async (uid: string) => {
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        emailVerified: true,
      },
      { merge: true }
    );
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
