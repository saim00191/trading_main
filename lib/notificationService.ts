import { supabase } from './supabaseClient'
import { Notification, User } from './types'

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email')

  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }

  return (data || []).map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email
  }))
}

export function getUserById(userId: string, users: User[]): User | undefined {
  return users.find((user) => user.id === userId)
}

export function getUserByEmail(email: string, users: User[]): User | undefined {
  return users.find((user) => user.email === email)
}

export async function getUserNotifications(email: string ): Promise<Notification[]> {

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }

  return data || []
}

export async function getUnreadCount(email: string): Promise<number> {

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .eq('status', 'pending')

  if (error) {
    console.error('Error fetching unread count:', error)
    throw error
  }

  return count || 0
}

export async function sendNotificationToUser(
  user: User,
  subject: string,
  message: string
): Promise<Notification> {

  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        username: user.username,
        email: user.email,
        subject,
        message,
        status: 'pending'
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error sending notification:', error)
    throw error
  }

  return data
}

export async function sendNotificationToMultipleUsers(
  users: User[],
  subject: string,
  message: string
): Promise<Notification[]> {

  const payload = users.map((user) => ({
    username: user.username,
    email: user.email,
    subject,
    message,
    status: 'pending'
  }))

  const { data, error } = await supabase
    .from('notifications')
    .insert(payload)
    .select()

  if (error) {
    console.error('Error sending notifications:', error)
    throw error
  }

  return data || []
}

export async function sendNotificationToAllUsers(
  subject: string,
  message: string
): Promise<Notification[]> {

  const users = await getAllUsers()

  return sendNotificationToMultipleUsers(users, subject, message)
}

export async function markNotificationAsSeen(
  notificationId: string
): Promise<Notification | null> {

  const { data, error } = await supabase
    .from('notifications')
    .update({
      status: 'seen',
      updated_at: new Date().toISOString()
    })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating notification:', error)
    throw error
  }

  return data
}