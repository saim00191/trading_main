import { supabase } from "../supabaseClient";

export interface Notification {
  id: string;
  username: string;
  email: string;
  message: string;
  status: 'pending' | 'seen';
  created_at: string;
  updated_at: string;
}

export interface NotificationSendRequest {
  recipients: string[]; // array of email addresses
  message: string;
}

export const getAllNotifications = async (page: number = 1, limit: number = 20): Promise<{ notifications: Notification[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { notifications: (data as Notification[]) || [], total: count || 0 };
  } catch (error) {
    console.error('[adminNotifications] Error getting all notifications:', error);
    throw error;
  }
};

export const getNotificationsByStatus = async (status: 'pending' | 'seen', page: number = 1, limit: number = 20): Promise<{ notifications: Notification[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { notifications: (data as Notification[]) || [], total: count || 0 };
  } catch (error) {
    console.error('[adminNotifications] Error getting notifications by status:', error);
    throw error;
  }
};

export const sendNotificationToUser = async (email: string, message: string): Promise<boolean> => {
  try {
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('username, email')
      .eq('email', email)
      .single();

    if (userError) throw userError;

    // Insert notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert([
        {
          username: user.username,
          email: user.email,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (notifError) throw notifError;
    return true;
  } catch (error) {
    console.error('[adminNotifications] Error sending notification to user:', error);
    throw error;
  }
};

export const sendNotificationsToMultiple = async (emails: string[], message: string): Promise<boolean> => {
  try {
    // Get user details for all emails
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('username, email')
      .in('email', emails);

    if (usersError) throw usersError;

    // Prepare notifications
   const notifications = (users || []).map((user: { username: string; email: string }) => ({
  username: user.username,
  email: user.email,
  message,
  status: 'pending',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));
    // Insert all notifications
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;
    return true;
  } catch (error) {
    console.error('[adminNotifications] Error sending notifications to multiple users:', error);
    throw error;
  }
};

export const sendNotificationToAll = async (message: string): Promise<boolean> => {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('username, email');

    if (usersError) throw usersError;

    // Prepare notifications
   const notifications = (users || []).map((user: { username: string; email: string }) => ({
  username: user.username,
  email: user.email,
  message,
  status: 'pending',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

    // Insert all notifications
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;
    return true;
  } catch (error) {
    console.error('[adminNotifications] Error sending notifications to all users:', error);
    throw error;
  }
};

export const markNotificationAsSeen = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'seen', updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[adminNotifications] Error marking notification as seen:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[adminNotifications] Error deleting notification:', error);
    throw error;
  }
};

export const getNotificationStats = async (): Promise<{ total: number; pending: number; seen: number }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('status');

    if (error) throw error;

    const notifications = data || [];
   const notificationsTyped = notifications as Notification[];
const pending = notificationsTyped.filter((n) => n.status === 'pending').length;
const seen = notificationsTyped.filter((n) => n.status === 'seen').length;

    return { total: notifications.length, pending, seen };
  } catch (error) {
    console.error('[adminNotifications] Error getting notification stats:', error);
    return { total: 0, pending: 0, seen: 0 };
  }
};

export const getAllUsers = async (): Promise<{ username: string; email: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username, email')
      .order('username', { ascending: true });

    if (error) throw error;
    return (data as { username: string; email: string }[]) || [];
  } catch (error) {
    console.error('[adminNotifications] Error getting all users:', error);
    return [];
  }
};
