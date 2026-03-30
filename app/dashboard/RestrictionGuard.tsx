'use client';

import { useSelector } from 'react-redux';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RestrictionModal } from '@/components/common/RestrictionModal';
import { RestrictionModalType } from '@/hooks/useRestrictionModal';
import { supabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  email: string;
  username?: string;
  user_type?: 'free' | 'pro';
  is_blocked?: boolean;
  time_period_start?: string | null;
  time_period_end?: string | null;
  trade_left_free_trial?: number | null;

}


export function RestrictionGuard({ children }: { children: React.ReactNode }) {
  const userEmail = useSelector(selectUserEmail);
  const router = useRouter();
  const pathname = usePathname();

  const [modalType, setModalType] = useState<RestrictionModalType | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    if (!userEmail) return;

    const fetchUserData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        return;
      }

      setUserData(data);
      setLoading(false);
    };

    fetchUserData();
  }, [userEmail]);

  // Check restrictions
  useEffect(() => {
    if (!userData) return;

    const now = new Date();

    if (userData.is_blocked) {
      setModalType('blocked');
      return;
    }

    if (userData.time_period_end && new Date(userData.time_period_end) < now) {
      setModalType('trial');
      return;
    }

    if (
      userData.trade_left_free_trial !== undefined &&
      Number(userData.trade_left_free_trial) <= 0
    ) {
      setModalType('trade_limit');
      return;
    }

    setModalType(null);
  }, [userData]);

  // Do not show modal on upgrade/support
  const hideModalPages = ['/dashboard/upgrade', '/dashboard/support'];
  const shouldShowModal = modalType && !hideModalPages.includes(pathname);

  if (loading) return null;

  return (
    <>
      <AnimatePresence>
        {shouldShowModal && (
          <RestrictionModal isOpen={true} modalType={modalType!} />
        )}
      </AnimatePresence>

      {!shouldShowModal && children}
    </>
  );
}