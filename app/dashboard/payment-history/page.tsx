'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { RootState } from '@/store/store';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { getPayments } from '@/lib/supabase-service';
import { selectUserEmail } from '@/store/UserLoggedInSlice';

interface Payment {
  id: string;
  date: string;
  amount: number;
  payment_method: string;
  sender_number: string;
  receiver_number: string;
  months: number;
  name: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Draft';
  screenshot_url?: string;
}

interface SupabasePayment {
  id: string;
  created_at: string;
  amount: number;
  payment_method: string;
  sender_number: string;
  receiver_number: string;
  months: number;
  name: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Draft';
  screenshot_url?: string | null;
}

const STATUS_COLORS: Record<Payment['status'], string> = {
  Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
  Approved: 'bg-green-500/10 text-green-400 border-green-500/50',
  Rejected: 'bg-red-500/10 text-red-400 border-red-500/50',
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/50',
};

export default function PaymentHistoryPage() {
  const userEmail = useSelector(selectUserEmail);

  return (
    <DashboardLayout
      title="Payment History"
      subtitle="View all your payment transactions"
    >
      <PageContent userEmail={userEmail} />
    </DashboardLayout>
  );
}

function PageContent({ userEmail }: { userEmail: string | null }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      if (!userEmail) return;

      try {
        setIsLoading(true);

        const data: SupabasePayment[] = await getPayments(userEmail);

      const formattedData: Payment[] = data.map((payment) => ({
  ...payment,
  screenshot_url: payment.screenshot_url ?? undefined,
  date: new Date(payment.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }),
}));

        setPayments(formattedData);
      } catch (err) {
        setError('Failed to load payment history');
        console.error('Payment history error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [userEmail]);


  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16 md:py-20">
            <motion.div
              className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        ) : error ? (
          <div className="bg-danger/10 border border-danger/50 rounded-lg p-4 md:p-6 text-danger text-center text-sm md:text-base">
            {error}
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 md:p-12 text-center">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
              No payments found yet
            </h3>
            <p className="text-muted-foreground text-sm md:text-base">
              Upgrade your account to get started.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-lg">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Sender
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Receiver
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Months
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      className="border-b border-gray-700/30 hover:bg-blue-500/5 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 text-sm text-white">
                        {payment.date}
                      </td>

                      <td className="px-6 py-4 text-sm text-white font-semibold">
                        Rs {payment.amount}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {payment.payment_method}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {payment.sender_number}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {payment.receiver_number}
                      </td>

                      <td className="px-6 py-4 text-sm text-white">
                        {payment.months}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${
                            STATUS_COLORS[payment.status]
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {payment.screenshot_url ? (
                          <a
                            href={payment.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Eye size={16} />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-6">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  className="bg-[#0a0a0f] border border-gray-700/50 rounded-lg p-4 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Date</span>
                    <span className="text-white font-semibold">
                      {payment.date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Amount</span>
                    <span className="text-white font-semibold">
                      Rs {payment.amount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Method</span>
                    <span className="text-white">
                      {payment.payment_method}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Months</span>
                    <span className="text-white">{payment.months}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                        STATUS_COLORS[payment.status]
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  {payment.screenshot_url && (
                    <a
                      href={payment.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors pt-3 border-t border-gray-700/50"
                    >
                      <Eye size={16} />
                      View Screenshot
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}