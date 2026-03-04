'use client'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadEmailFromStorage } from '@/store/UserLoggedInSlice';

export function InitializeAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadEmailFromStorage()); // hydrate Redux from localStorage
    // const email = localStorage.getItem('userEmail');
    // console.log('InitializeAuth: loaded email from localStorage ->', email); // ✅ log email
  }, [dispatch]);

  return null;
}