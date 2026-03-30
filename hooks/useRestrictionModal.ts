'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export interface DashboardUser {
  id: string;
  firebase_uid: string;
  username: string;
  email: string;
  phone: string;
  created_at: string;
  trial_start: string | null;
  trial_end: string | null;
  user_type: 'free' | 'pro';
  trades_left_free_trial: number;
  is_blocked: boolean;
  inserted_at: string;
}

export type RestrictionModalType = 'blocked' | 'trial' | 'trade_limit' | null;


interface UseRestrictionModalReturn {
  user: DashboardUser | null;
  modalType: RestrictionModalType;
  isLoading: boolean;
  showModal: boolean;
}

export function useRestrictionModal(firebaseUid: string | null): UseRestrictionModalReturn {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [modalType, setModalType] = useState<RestrictionModalType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUid) {
      setIsLoading(false);
      return;
    }

    const fetchUserAndCheckRestrictions = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', firebaseUid)
          .single();

        if (error || !data) {
          console.error('[v0] Error fetching user:', error);
          setIsLoading(false);
          return;
        }

        const userData = data as DashboardUser;
        setUser(userData);

        // Determine modal type based on priority
        const now = new Date();

        if (userData.is_blocked) {
          setModalType('blocked');
        } else if (
          now > new Date(userData.trial_end || '') &&
          userData.user_type === 'free'
        ) {
          setModalType('trial');
        } else if (
          userData.user_type === 'free' &&
          userData.trades_left_free_trial <= 0
        ) {
          setModalType('trade_limit');
        } else {
          setModalType(null);
        }
      } catch (err) {
        console.error('[v0] Error in useRestrictionModal:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndCheckRestrictions();
  }, [firebaseUid]);

  return {
    user,
    modalType,
    isLoading,
    showModal: modalType !== null,
  };
}
