
import { supabase } from './supabaseClient';


export interface Notification {
  id: string;
  username: string;
  email: string;
  message: string;
  status: 'pending' | 'seen';
  created_at: string;
  updated_at: string;
}

/**
 * Get all notifications for a user
 */
export const getNotifications = async (email: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return (data || []) as Notification[];
  } catch (error) {
    console.error('[Notification Service] Fetch error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch notifications');
  }
};

/**
 * Get a single notification by ID
 */
export const getNotificationById = async (notificationId: string): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw new Error(`Failed to fetch notification: ${error.message}`);
    }

    return (data || null) as Notification | null;
  } catch (error) {
    console.error('[Notification Service] Fetch single error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch notification');
  }
};

/**
 * Mark notification as seen
 */
export const markNotificationAsSeen = async (notificationId: string): Promise<Notification> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'seen', updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select();

    if (error) {
      throw new Error(`Failed to update notification: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Notification not found');
    }

    return (data[0] as unknown) as Notification;
  } catch (error) {
    console.error('[Notification Service] Update error:', error);
    throw error instanceof Error ? error : new Error('Failed to update notification');
  }
};

/**
 * Mark all notifications as seen for a user
 */
export const markAllNotificationsAsSeen = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'seen', updated_at: new Date().toISOString() })
      .eq('email', email)
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Failed to update notifications: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('[Notification Service] Update all error:', error);
    throw error instanceof Error ? error : new Error('Failed to update notifications');
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('[Notification Service] Delete error:', error);
    throw error instanceof Error ? error : new Error('Failed to delete notification');
  }
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (email: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Failed to count notifications: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    console.error('[Notification Service] Count error:', error);
    throw error instanceof Error ? error : new Error('Failed to count notifications');
  }
};

/**
 * Create a notification (admin only, for server-side)
 */
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>
): Promise<Notification> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          ...notification,
          status: notification.status || 'pending',
        },
      ])
      .select();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from server');
    }

    return (data[0] as unknown) as Notification;
  } catch (error) {
    console.error('[Notification Service] Create error:', error);
    throw error instanceof Error ? error : new Error('Failed to create notification');
  }
};
