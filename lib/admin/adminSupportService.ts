import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface AdminSupportRequest {
  id: string;
  user_email: string;
  user_name: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface SupportFilters {
  status?: 'pending' | 'responded' | 'resolved';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getAllSupportRequests = async (filters?: SupportFilters, page: number = 1, limit: number = 20): Promise<{ requests: AdminSupportRequest[]; total: number }> => {
  try {
    let query = supabase.from('support_requests').select('*', { count: 'exact' });

    if (filters?.status) query = query.eq('status', filters.status);

    if (filters?.search) {
      query = query.or(`user_name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
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
    return { requests: (data as AdminSupportRequest[]) || [], total: count || 0 };
  } catch (error) {
    console.error('[adminSupport] Error getting all support requests:', error);
    throw error;
  }
};

export const getSupportRequestById = async (requestId: string): Promise<AdminSupportRequest | null> => {
  try {
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) throw error;
    return data as AdminSupportRequest;
  } catch (error) {
    console.error('[adminSupport] Error getting support request:', error);
    return null;
  }
};

export const getPendingSupportRequests = async (page: number = 1, limit: number = 20): Promise<{ requests: AdminSupportRequest[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('support_requests')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { requests: (data as AdminSupportRequest[]) || [], total: count || 0 };
  } catch (error) {
    console.error('[adminSupport] Error getting pending support requests:', error);
    throw error;
  }
};

export const markSupportAsResponded = async (requestId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('support_requests')
      .update({ status: 'responded', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[adminSupport] Error marking support request as responded:', error);
    throw error;
  }
};

export const markSupportAsResolved = async (requestId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('support_requests')
      .update({ status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[adminSupport] Error marking support request as resolved:', error);
    throw error;
  }
};

export const getSupportStats = async (): Promise<{ totalRequests: number; pendingCount: number; respondedCount: number; resolvedCount: number }> => {
  try {
    const { data, error } = await supabase.from('support_requests').select('status');

    if (error) throw error;

    const requests = data || [];
    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    const respondedCount = requests.filter((r) => r.status === 'responded').length;
    const resolvedCount = requests.filter((r) => r.status === 'resolved').length;


    return { totalRequests: requests.length, pendingCount, respondedCount, resolvedCount };
  } catch (error) {
    console.error('[adminSupport] Error getting support stats:', error);
    return { totalRequests: 0, pendingCount: 0, respondedCount: 0, resolvedCount: 0 };
  }
};
