// import { supabase } from "../supabaseClient";

// export interface AdminUser {
//   id: string;
//   firebase_uid: string;
//   username: string;
//   email: string;
//   phone: string | null;
//   created_at: string;
//   trial_start: string | null;
//   trial_end: string | null;
//   user_type: "free" | "pro";
//   inserted_at: string;
// }

// export interface UserDetailStats {
//   username: string;
//   email: string;
//   phone: string | null;
//   user_type: "free" | "pro";
//   trial_period?: string;
//   join_date: string;
// }

// export const getAllUsers = async (
//   page: number = 1,
//   limit: number = 20
// ): Promise<{ users: AdminUser[]; total: number }> => {

//   const offset = (page - 1) * limit;

//   const { data, count, error } = await supabase
//     .from("users")
//     .select("*", { count: "exact" })
//     .order("created_at", { ascending: false })
//     .range(offset, offset + limit - 1);

//   if (error) {
//     console.error("[adminUsers] Error getting all users:", error);
//     throw error;
//   }

//   return {
//     users: (data ?? []) as AdminUser[],
//     total: count ?? 0
//   };
// };

// export const getUserDetailStats = async (
//   userEmail: string
// ): Promise<UserDetailStats | null> => {

//   try {

//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", userEmail)
//       .maybeSingle(); // safer than .single()

//     if (userError) {
//       console.error("[adminUsers] User fetch error:", userError);
//       return null;
//     }

//     if (!userData) return null;



//     return {
//       username: userData.username,
//       email: userData.email,
//       phone: userData.phone,
//       user_type: userData.user_type,
//       trial_period:
//         userData.trial_start && userData.trial_end
//           ? `${new Date(userData.trial_start).toLocaleDateString()} - ${new Date(
//               userData.trial_end
//             ).toLocaleDateString()}`
//           : undefined,
//       join_date: new Date(userData.created_at).toLocaleDateString(),
//     };

//   } catch (error) {

//     console.error("[adminUsers] Error getting user details:", error);
//     return null;

//   }
// };

// export const upgradeUserToPro = async (
//   userEmail: string,
//   startDate: string,
//   endDate: string
// ): Promise<boolean> => {

//   const { data, error } = await supabase
//     .from("users")
//     .update({
//       user_type: "pro",
//       time_period_start: startDate,
//       time_period_end: endDate
//     })
//     .eq("email", userEmail)
//     .select();

//   if (error) {
//     console.error("[adminUsers] Error upgrading user:", error.message);
//     throw error;
//   }

//   return true;
// };

// export const downgradeUserToFree = async (
//   userEmail: string
// ): Promise<boolean> => {

//   const { error } = await supabase
//     .from("users")
//     .update({
//       user_type: "free",
//       trial_start: null,
//       trial_end: null
//     })
//     .eq("email", userEmail);

//   if (error) {
//     console.error("[adminUsers] Error downgrading user:", error);
//     throw error;
//   }

//   return true;
// };

// export const deleteUser = async (
//   userEmail: string
// ): Promise<boolean> => {

//   const { error: tradesError } = await supabase
//     .from("trades")
//     .delete()
//     .eq("useremail", userEmail);

//   if (tradesError) {
//     console.error("[adminUsers] Error deleting trades:", tradesError);
//   }

//   const { error: userError } = await supabase
//     .from("users")
//     .delete()
//     .eq("email", userEmail);

//   if (userError) throw userError;

//   return true;
// };

// export const searchUsers = async (
//   query: string,
//   page: number = 1,
//   limit: number = 20
// ): Promise<{ users: AdminUser[]; total: number }> => {

//   const offset = (page - 1) * limit;

//   const { data, count, error } = await supabase
//     .from("users")
//     .select("*", { count: "exact" })
//     .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
//     .order("created_at", { ascending: false })
//     .range(offset, offset + limit - 1);

//   if (error) {
//     console.error("[adminUsers] Error searching users:", error);
//     throw error;
//   }

//   return {
//     users: (data ?? []) as AdminUser[],
//     total: count ?? 0
//   };
// };







import { supabase } from "../supabaseClient";

export interface AdminUser {
  id: string;
  firebase_uid: string;
  username: string;
  email: string;
  phone: string | null;
  created_at: string;
  trial_start: string | null;
  trial_end: string | null;
  user_type: "free" | "pro";
  inserted_at: string;
   is_blocked: boolean; 
}

export interface UserDetailStats {
  username: string;
  email: string;
  phone: string | null;
  user_type: "free" | "pro";
  trial_period?: string;
  join_date: string;
  pro_start?: string;   // ✅ ADD
  pro_end?: string;     // ✅ ADD
  is_blocked: boolean;  // ✅ ADD
}

export const getAllUsers = async (
  page: number = 1,
  limit: number = 20
): Promise<{ users: AdminUser[]; total: number }> => {

  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[adminUsers] Error getting all users:", error);
    throw error;
  }

  return {
    users: (data ?? []) as AdminUser[],
    total: count ?? 0
  };
};

export const toggleBlockUser = async (
  userEmail: string,
  block: boolean
): Promise<boolean> => {

  const { error } = await supabase
    .from("users")
    .update({ is_blocked: block })
    .eq("email", userEmail);

  if (error) {
    console.error("[adminUsers] Error blocking/unblocking user:", error);
    throw error;
  }

  return true;
};

export const getUserDetailStats = async (
  userEmail: string
): Promise<UserDetailStats | null> => {

  try {

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail)
      .maybeSingle(); // safer than .single()

    if (userError) {
      console.error("[adminUsers] User fetch error:", userError);
      return null;
    }

    if (!userData) return null;



   return {
  username: userData.username,
  email: userData.email,
  phone: userData.phone,
  user_type: userData.user_type,
  is_blocked: userData.is_blocked,

  pro_start: userData.time_period_start
    ? new Date(userData.time_period_start).toLocaleDateString()
    : undefined,

  pro_end: userData.time_period_end
    ? new Date(userData.time_period_end).toLocaleDateString()
    : undefined,

  trial_period:
    userData.trial_start && userData.trial_end
      ? `${new Date(userData.trial_start).toLocaleDateString()} - ${new Date(
          userData.trial_end
        ).toLocaleDateString()}`
      : undefined,

  join_date: new Date(userData.created_at).toLocaleDateString(),
};

  } catch (error) {

    console.error("[adminUsers] Error getting user details:", error);
    return null;

  }
};

export const upgradeUserToPro = async (
  userEmail: string,
  startDate: string,
  endDate: string
): Promise<boolean> => {

  const { data, error } = await supabase
    .from("users")
    .update({
      user_type: "pro",
      time_period_start: startDate,
      time_period_end: endDate
    })
    .eq("email", userEmail)
    .select();

  if (error) {
    console.error("[adminUsers] Error upgrading user:", error.message);
    throw error;
  }

  return true;
};

export const downgradeUserToFree = async (
  userEmail: string
): Promise<boolean> => {

  const { error } = await supabase
    .from("users")
    .update({
      user_type: "free",
      trial_start: null,
      trial_end: null
    })
    .eq("email", userEmail);

  if (error) {
    console.error("[adminUsers] Error downgrading user:", error);
    throw error;
  }

  return true;
};

export const deleteUser = async (
  userEmail: string
): Promise<boolean> => {

  const { error: tradesError } = await supabase
    .from("trades")
    .delete()
    .eq("useremail", userEmail);

  if (tradesError) {
    console.error("[adminUsers] Error deleting trades:", tradesError);
  }

  const { error: userError } = await supabase
    .from("users")
    .delete()
    .eq("email", userEmail);

  if (userError) throw userError;

  return true;
};

export const searchUsers = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{ users: AdminUser[]; total: number }> => {

  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[adminUsers] Error searching users:", error);
    throw error;
  }

  return {
    users: (data ?? []) as AdminUser[],
    total: count ?? 0
  };
};