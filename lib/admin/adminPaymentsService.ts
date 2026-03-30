import { supabase } from "../supabaseClient";

export interface AdminPayment {
  id: string;
  user_email: string;
  name: string;
  amount: number;
  months: number;
  payment_method: string;
  sender_number: string;
  receiver_number: string;
  account_holder_name: string;
  screenshot_url: string | null;
 status: 'Pending' | 'Approved' | 'Rejected'; // ✅ FIXED
  admin_note: string | null;
  created_at: string;
  updated_at: string;
   pro_period_start_date: string | null;
  pro_period_end_date: string | null;
}

export interface PaymentFilters {
  status?: 'Pending' | 'Approved' | 'Rejected';
  payment_method?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getAllPayments = async (filters?: PaymentFilters, page: number = 1, limit: number = 20): Promise<{ payments: AdminPayment[]; total: number }> => {
  try {
    let query = supabase.from('records_of_payment').select('*', { count: 'exact' });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.payment_method) query = query.eq('payment_method', filters.payment_method);

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%`);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const offset = (page - 1) * limit;
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { payments: (data as AdminPayment[]) || [], total: count || 0 };
  } catch (error) {
    console.error('[adminPayments] Error getting all payments:', error);
    throw error;
  }
};

export const getPaymentById = async (paymentId: string): Promise<AdminPayment | null> => {
  try {
    const { data, error } = await supabase
      .from('records_of_payment')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data as AdminPayment;
  } catch (error) {
    console.error('[adminPayments] Error getting payment:', error);
    return null;
  }
};

export const getPendingPayments = async (page: number = 1, limit: number = 20): Promise<{ payments: AdminPayment[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('records_of_payment')
      .select('*', { count: 'exact' })
      .eq('status', 'Pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { payments: (data as AdminPayment[]) || [], total: count || 0 };
  } catch (error) {
    console.error('[adminPayments] Error getting pending payments:', error);
    throw error;
  }
};

export interface ApprovePaymentRequest {
  // paymentId: string;
  userEmail: string;
  subscriptionMonths: number;
}


// export const approvePayment = async (paymentId: string): Promise<boolean> => {
//   try {
//     const { data, error } = await supabase
//       .from('records_of_payment')
//       .update({
//         status: 'Approved',
//         updated_at: new Date().toISOString(),
//       })
//       .eq('id', paymentId)
//       .select(); // 👈 IMPORTANT

//     // console.log("UPDATED ROW:", data);

//     if (error) throw error;

//     if (!data || data.length === 0) {
//       throw new Error("No row updated — ID mismatch");
//     }

//     return true;
//   } catch (error) {
//     console.error('[approvePayment] Error:', error);
//     throw error;
//   }
// };

export const approvePaymentWithProPeriod = async (
  paymentId: string,
  userEmail: string,
  proStart: string,
  proEnd: string
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();

    // 1️⃣ Update the payment record in records_of_payment
    const { data: paymentData, error: paymentError } = await supabase
      .from("records_of_payment")
      .update({
        status: "Approved",
        pro_period_start_date: proStart,
        pro_period_end_date: proEnd,
        updated_at: now,
      })
      .eq("id", paymentId)
      .select();

    if (paymentError) {
      console.error("[approvePayment] Error updating payment record:", paymentError);
      throw paymentError;
    }

    if (!paymentData || paymentData.length === 0) {
      const msg = "Payment ID not found in records_of_payment";
      console.error("[approvePayment] " + msg);
      throw new Error(msg);
    }


    // 2️⃣ Update the user record in users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .update({
        time_period_start: proStart,
        time_period_end: proEnd,
        last_updated_at: now,
      })
      .eq("email", userEmail)
      .select();

    if (userError) {
      console.error("[approvePayment] Error updating user record:", userError);
      throw userError;
    }

    if (!userData || userData.length === 0) {
      const msg = "User not found in users table";
      console.error("[approvePayment] " + msg);
      throw new Error(msg);
    }


    return true;
  } catch (error) {
    return false; // returning false instead of throwing to prevent unhandled rejection
  }
};

export const rejectPayment = async (paymentId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('records_of_payment')
      .update({
        status: 'Rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select(); // 👈 important for debugging

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error('No row updated — ID mismatch or RLS issue');
    }

    // console.log('[rejectPayment] Updated row:', data);

    return true;
  } catch (error) {
    console.error('[rejectPayment] Error:', error);
    throw error;
  }
};

export const getPaymentStats = async (): Promise<{ totalPayments: number; totalRevenue: number; pendingCount: number; approvedCount: number }> => {
  try {
    const { data, error } = await supabase.from('records_of_payment').select('amount, status');

    if (error) throw error;

   const payments = data || [];
    const totalRevenue = payments
      .filter((p) => p.status === 'Approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingCount = payments.filter((p) => p.status === 'Pending').length;
    const approvedCount = payments.filter((p) => p.status === 'Approved').length;

    return { totalPayments: payments.length, totalRevenue, pendingCount, approvedCount };
  } catch (error) {
    console.error('[adminPayments] Error getting payment stats:', error);
    return { totalPayments: 0, totalRevenue: 0, pendingCount: 0, approvedCount: 0 };
  }
};

export const getUniquePaymentMethods = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('records_of_payment')
      .select('payment_method')
      .returns<{ payment_method: string }[]>();

    if (error) throw error;
    const methods = [...new Set(data?.map((d) => d.payment_method) || [])];
    return methods.sort();
  } catch (error) {
    console.error('[adminPayments] Error getting payment methods:', error);
    return [];
  }
};
