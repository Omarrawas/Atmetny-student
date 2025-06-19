
'use client';

import { supabase } from '@/lib/supabaseClient';
import type { UserNotification, UserNotificationType } from './types';

/**
 * Fetches notifications for a given user.
 * @param userId - The ID of the user.
 * @param options - Optional parameters like limit and unreadOnly.
 * @returns A promise that resolves to an array of UserNotification.
 */
export const getUserNotifications = async (
  userId: string,
  options?: { limit?: number; unreadOnly?: boolean }
): Promise<UserNotification[]> => {
  if (!userId) {
    console.warn('getUserNotifications called without userId');
    return [];
  }
  try {
    let query = supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (options?.limit && options.limit > 0) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
    return (data || []) as UserNotification[];
  } catch (error) {
    console.error('Failed to get user notifications:', error);
    throw error;
  }
};

/**
 * Marks a specific notification as read.
 * @param notificationId - The ID of the notification to mark as read.
 * @returns A promise that resolves when the operation is complete.
 */
export const markUserNotificationAsRead = async (notificationId: string): Promise<void> => {
  if (!notificationId) {
    console.warn('markUserNotificationAsRead called without notificationId');
    return;
  }
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

/**
 * Marks all unread notifications for a user as read.
 * @param userId - The ID of the user.
 * @returns A promise that resolves when the operation is complete.
 */
export const markAllUserNotificationsAsRead = async (userId: string): Promise<void> => {
  if (!userId) {
    console.warn('markAllUserNotificationsAsRead called without userId');
    return;
  }
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};

/**
 * Gets the count of unread notifications for a user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the number of unread notifications.
 */
export const getUnreadUserNotificationsCount = async (userId: string): Promise<number> => {
  if (!userId) {
    console.warn('getUnreadUserNotificationsCount called without userId');
    return 0;
  }
  try {
    const { count, error } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting unread notifications count:', error);
      throw error;
    }
    return count ?? 0;
  } catch (error) {
    console.error('Failed to get unread notifications count:', error);
    throw error;
  }
};
