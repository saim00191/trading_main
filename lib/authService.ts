import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  UserCredential,
  getAuth,
  verifyPasswordResetCode,
  confirmPasswordReset,
  AuthError,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc, DocumentData } from "firebase/firestore";
import { supabase } from "./supabaseClient";
import { addDays, set } from "date-fns";
import type { User } from "@/store/authSlice";

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
      console.error("Error setting persistence:", error.message);
    }
  }
};

// Sign Up
// export const signUpUser = async (data: SignUpData): Promise<AuthResponse> => {
//   try {
//     const userCredential: UserCredential = await createUserWithEmailAndPassword(
//       auth,
//       data.email,
//       data.password,
//     );

//     const user = userCredential.user;

//     await sendEmailVerification(user);

//     const now = new Date(); // Signup time
//     const startISO = now.toISOString();

//     // 14 days later at 23:59:59
//     const endDate = set(addDays(now, 14), {
//       hours: 23,
//       minutes: 59,
//       seconds: 59,
//     });
//     const timePeriodEnd = endDate.toISOString();

//     const { error } = await supabase.from("users").insert([
//       {
//         firebase_uid: user.uid,
//         username: data.username,
//         email: data.email,
//         phone: data.phoneNumber,
//         created_at: now,
//         time_period_start: now,
//         time_period_end: timePeriodEnd,
//         user_type: "free",
//         last_updated_at: startISO,
//         trade_left_free_trial: 20,
//         is_blocked: false,
//       },
//     ]);

//     if (error) {
//       return {
//         success: false,
//         error: "User created in Firebase but failed in Supabase",
//       };
//     }

//     return {
//       success: true,
//       user: {
//         uid: user.uid,
//         username: data.username,
//         email: user.email ?? "",
//         phoneNumber: data.phoneNumber,
//         role: "user",
//         emailVerified: user.emailVerified,
//         createdAt: startISO,
//       },
//     };
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return { success: false, error: error.message };
//     }
//     return { success: false, error: "Sign up failed" };
//   }
// };

export const signUpUser = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    // 1. Create user in Firebase Auth
    const userCredential: UserCredential =
      await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

    const user = userCredential.user;

    // 2. Send email verification
    await sendEmailVerification(user);

    // 3. Prepare dates
    const now = new Date();
    const startISO = now.toISOString();

    const endDate = set(addDays(now, 14), {
      hours: 23,
      minutes: 59,
      seconds: 59,
    });

    const timePeriodEnd = endDate.toISOString();

    // 4. Save user in Firestore (IMPORTANT)
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: data.username,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: "user",
      emailVerified: false,
      createdAt: startISO,

      // optional fields (your previous logic)
      time_period_start: startISO,
      time_period_end: timePeriodEnd,
      trade_left_free_trial: 20,
      is_blocked: false,
    });

    // 5. Return response
    return {
      success: true,
      user: {
        uid: user.uid,
        username: data.username,
        email: user.email ?? "",
        phoneNumber: data.phoneNumber,
        role: "user",
        emailVerified: user.emailVerified,
        createdAt: startISO,
      },
    };
  } catch (error: unknown) {
    console.error("Signup Error:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Sign up failed" };
  }
  
  }


// Login
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );

    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData: DocumentData | undefined = userDoc.data();

    const token = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        username: userData?.username ?? "",
        email: userData?.email ?? "",
        phoneNumber: userData?.phoneNumber ?? "",
        token,
        role: userData?.role ?? "user",
        emailVerified: user.emailVerified,
        createdAt: userData?.createdAt ?? "",
      },
    };
  } catch (error: unknown) {
       console.error('Login Error:', error);  // <--- log the real error
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Login failed" };
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
    return { success: false, error: "Logout failed" };
  }
};

// Forgot Password
// export const resetPassword = async (
//   email: string
// ): Promise<AuthResponse> => {
//   try {
//     await sendPasswordResetEmail(auth, email, {
//       url: `${window.location.origin}/reset-password`,
//       handleCodeInApp: true,
//     });
//     // console.log('Password reset email sent successfully');
//     return { success: true };
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return { success: false, error: error.message };
//     }
//     return { success: false, error: 'Password reset failed' };
//   }
// };

// Update user email verification
export const updateUserEmailVerified = async (
  uid: string,
): Promise<AuthResponse> => {
  try {
    await setDoc(
      doc(db, "users", uid),
      { emailVerified: true },
      { merge: true },
    );
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Update failed" };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// ----------------------
// RESET-PASSWORD

export const resetPassword = async (email: string): Promise<AuthResponse> => {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  try {
    // Firebase password reset settings
    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`, // your reset password page
      handleCodeInApp: true,
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    return { success: true };
  } catch (error: unknown) {
    const authError = error as AuthError;
    let errorMessage = "Failed to send password reset email.";

    // Map Firebase error codes to user-friendly messages
    switch (authError.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email address.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many attempts. Please try again later.";
        break;
    }

    return { success: false, error: errorMessage };
  }
};
export async function verifyResetCode(oobCode: string) {
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return { success: true, email };
  } catch (error) {
    const authError = error as AuthError;
    let errorMessage = "Reset link is invalid or has expired";

    if (authError.code === "auth/invalid-action-code") {
      errorMessage = "This reset link is invalid or has expired";
    } else if (authError.code === "auth/expired-action-code") {
      errorMessage = "This reset link has expired. Please request a new one.";
    }

    return { success: false, error: errorMessage, email: null };
  }
}

export async function confirmPasswordChange(
  oobCode: string,
  newPassword: string,
) {
  try {
    // Validate password strength
    if (newPassword.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
      };
    }

    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    let errorMessage = "Failed to reset password";

    if (authError.code === "auth/invalid-action-code") {
      errorMessage = "This reset link is invalid or has expired";
    } else if (authError.code === "auth/expired-action-code") {
      errorMessage = "This reset link has expired";
    } else if (authError.code === "auth/weak-password") {
      errorMessage = "Password is too weak. Please choose a stronger password.";
    } else if (authError.code === "auth/invalid-password") {
      errorMessage = "Invalid password format";
    }

    return { success: false, error: errorMessage };
  }
}
