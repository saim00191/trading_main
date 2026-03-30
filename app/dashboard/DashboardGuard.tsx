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

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const userEmail = useSelector(selectUserEmail);
  const router = useRouter();
  const pathname = usePathname();

  const [userData, setUserData] = useState<User | null>(null);
  const [modalType, setModalType] = useState<RestrictionModalType | null>(null);
  const [loading, setLoading] = useState(true);

  // Pages where modal should not block the view
  const hideModalPages = ['/dashboard/upgrade', '/dashboard/contact-support'];

  useEffect(() => {
    if (!userEmail) {
      router.push('/login'); // ✅ safe in useEffect
    }
  }, [userEmail, router]);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false); // not logged in, stop loading
      setModalType(null);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error || !data) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        return;
      }

      setUserData(data);
      setLoading(false);
    };

    fetchUserData();
  }, [userEmail]);

  // Determine restriction after data is fetched
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

  // Determine if modal should be displayed
  const shouldShowModal = modalType && !hideModalPages.includes(pathname);

  // Show nothing while loading
  if (loading) return null;

//   // If user is not logged in → redirect to login
//   if (!userEmail) {
//     router.push('/login');
//     return null;
//   }

  return (
    <>
      <AnimatePresence>
        {shouldShowModal && (
          <RestrictionModal
            isOpen={true}
            modalType={modalType!}
          />
        )}
      </AnimatePresence>

      {/* Render dashboard only if no modal is blocking */}
      {!shouldShowModal && children}
    </>
  );
}