import { supabase } from "../supabaseClient";


export interface AdminDashboardStats {
  totalUsers: number;
  totalProUsers: number;
  totalFreeUsers: number;
  totalTrades: number;
  pendingPayments: number;
  totalSupportRequests: number;
  pendingSupportRequests: number; // ✅ add this
  totalEarnings: number;
  totalNotifications: number;
}
export interface RevenueChartData {
  date: string;
  revenue: number;
  trades: number;
}

export const getTotalUsers = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting total users:', error);
    return 0;
  }
};

export const getTotalProUsers = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'pro');

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting pro users:', error);
    return 0;
  }
};

export const getTotalFreeUsers = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'free');

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting free users:', error);
    return 0;
  }
};

export const getTotalTrades = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting total trades:', error);
    return 0;
  }
};

export const getPendingPayments = async (): Promise<number> => {
  try {
    const { count, error } = await supabase.from('records_of_payment').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting pending payments:', error);
    return 0;
  }
};

export const getTotalNotifications = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting notifications:', error);
    return 0;
  }
};

export const getTotalSupportRequests = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('support_requests')
      .select('*', { count: 'exact', head: true });
      

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting support requests:', error);
    return 0;
  }
};

// Fetch total suggestions
// Fetch total pending support requests
export const getPendingSupportRequests = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('support_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Open'); // only count pending requests



    if (error) throw error;

 
    return count || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting pending support requests:', error);
    return 0;
  }
};

// Fetch total earnings (sum of all approved payments)
export const getTotalEarnings = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('records_of_payment')
      .select('amount')
      .eq('status', 'Approved');

    if (error) throw error;

   return data?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
  } catch (error) {
    console.error('[AdminDashboardService] Error getting total earnings:', error);
    return 0;
  }
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
  const [
      totalUsers,
      totalProUsers,
      totalFreeUsers,
      totalTrades,
      pendingPayments,
      totalNotifications,
      totalSupportRequests,
      pendingSupportRequests, // <- new
      totalEarnings
    ] = await Promise.all([
      getTotalUsers(),
      getTotalProUsers(),
      getTotalFreeUsers(),
      getTotalTrades(),
      getPendingPayments(),
      getTotalNotifications(),
      getTotalSupportRequests(),
      getPendingSupportRequests(), // <- use new function here
      getTotalEarnings()
    ]);

    return {
      totalUsers,
      totalProUsers,
      totalFreeUsers,
      totalTrades,
      pendingPayments,
      totalNotifications,
      totalSupportRequests,
      pendingSupportRequests, // map it to dashboard field
      totalEarnings
    };
  } catch (error) {
    console.error('[AdminDashboardService] Error getting dashboard stats:', error);
    throw error;
  }
};
const getLastNDays = (n: number): string[] => {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return days;
};

export const getRevenueChartData = async (daysCount = 30): Promise<RevenueChartData[]> => {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysCount);

    // Fetch payments
    const { data: payments, error: paymentsError } = await supabase
      .from('records_of_payment')
      .select('created_at, amount')
      .eq('status', 'Approved')
      .gte('created_at', fromDate.toISOString());

    if (paymentsError) throw paymentsError;


    // Fetch trades (optional, not needed for revenue only)
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('created_at')
      .gte('created_at', fromDate.toISOString());

    if (tradesError) throw tradesError;

    // Prepare chart days
    const chartDays = getLastNDays(daysCount);
    const grouped: Record<string, { revenue: number; trades: number }> = {};
    chartDays.forEach((d) => (grouped[d] = { revenue: 0, trades: 0 }));

    // Aggregate payments
    payments?.forEach((p) => {
      const date = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (grouped[date]) grouped[date].revenue += Number(p.amount) || 0;
    });

    // Return as array
    return chartDays.map((date) => ({
      date,
      revenue: grouped[date].revenue,
      trades: grouped[date].trades,
    }));

  } catch (error) {
    console.error('[AdminDashboardService] Error getting revenue chart data:', error);
    return [];
  }
};



export async function getTradesChartData(days = 30) {
  const { data, error } = await supabase
    .from('trades')
    .select('id, created_at')
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching trades:', error);
    return [];
  }

  // Group trades by day
  const grouped: Record<string, number> = {};

  data.forEach(trade => {
    const date = new Date(trade.created_at).toISOString().split('T')[0]; // yyyy-mm-dd
    grouped[date] = (grouped[date] || 0) + 1;
  });

  // Convert to array sorted by date
  return Object.keys(grouped)
    .sort()
    .map(date => ({ date, trades: grouped[date] }));
}