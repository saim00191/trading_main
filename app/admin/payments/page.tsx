'use client';

import  { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Check, XCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getAllPayments, getPaymentStats, approvePaymentWithProPeriod, rejectPayment, type AdminPayment } from '@/lib/admin/adminPaymentsService';
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
 const [stats, setStats] = useState({ totalPayments: 0, totalRevenue: 0, pendingCount: 0, approvedCount: 0 });
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('');
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [proStart, setProStart] = useState<string>('');
  const [proEnd, setProEnd] = useState<string>('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const statusMap: Record<string, 'Pending' | 'Approved' | 'Rejected'> = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
      };
      const filters = statusFilter ? { status: statusMap[statusFilter] } : {};
      const [paymentsData, statsData] = await Promise.all([getAllPayments(filters, page, 20), getPaymentStats()]);
      setPayments(paymentsData.payments);
      setTotal(paymentsData.total);
      setStats(statsData);
    } catch (error) {
      console.error('[AdminPayments] Error loading data:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [page, statusFilter]);

  const handleApprove = async (payment: AdminPayment) => {
    if (!proStart || !proEnd) return toast.error('Please select Pro Start and End dates');
    if (!window.confirm('Approve this payment?')) return;

    try {
      setIsProcessing(true);
      const success = await approvePaymentWithProPeriod(payment.id, payment.user_email, proStart, proEnd);
      if (success) {
        toast.success('Payment approved successfully');
        setPayments(prev => prev.filter(p => p.id !== payment.id));
        setStats(prev => ({ ...prev, pendingCount: Math.max(0, prev.pendingCount - 1), approvedCount: prev.approvedCount + 1 }));
      } else {
        toast.error('Failed to approve payment');
      }
    } catch (error) {
      console.error('[AdminPayments] Error approving payment:', error);
      toast.error('Failed to approve payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!window.confirm('Reject this payment?')) return;
    try {
      setIsProcessing(true);
      const success = await rejectPayment(paymentId);
      if (success) {
        toast.success('Payment rejected');
        setPayments(prev => prev.filter(p => p.id !== paymentId));
        setStats(prev => ({ ...prev, pendingCount: Math.max(0, prev.pendingCount - 1) }));
      } else {
        toast.error('Failed to reject payment');
      }
    } catch (error) {
      console.error('[AdminPayments] Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    } finally { setIsProcessing(false); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      {/* HEADER */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-foreground mb-2">Payments Management</h1>
        <p className="text-muted-foreground">Approve or reject payment requests</p>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {['Total Payments','Total Revenue','Pending','Approved'].map((label,i)=>(
          <motion.div key={i} className="bg-card border border-border rounded-lg p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1*(i+1) }}>
            <p className="text-sm text-muted-foreground mb-2">{label}</p>
            <p className={`text-3xl font-bold ${label==='Total Revenue'?'text-success':label==='Pending'?'text-warning':'text-info'}`}>{label==='Total Payments'?stats.totalPayments:label==='Total Revenue'?`₹${stats.totalRevenue.toLocaleString()}`:label==='Pending'?stats.pendingCount:stats.approvedCount}</p>
          </motion.div>
        ))}
      </div>

      {/* FILTER */}
      <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <select value={statusFilter} 
        onChange={(e) => {
  setStatusFilter(e.target.value as 'pending' | 'approved' | 'rejected' | '');
  setPage(1);
}}
         className="px-4 py-2 bg-card border border-border rounded-lg text-foreground">
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </motion.div>

      {/* PAYMENTS TABLE */}
      <motion.div className="bg-card border border-border rounded-lg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No payments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Months</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Pro Start</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Pro End</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">{payment.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{payment.user_email}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{payment.payment_method}</td>
                      <td className="px-4 py-3 text-sm font-bold text-success">₹{payment.amount}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{payment.months}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{payment.pro_period_start_date || '-'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{payment.pro_period_end_date || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${payment.status==='Approved'?'bg-success/20 text-success':payment.status==='Rejected'?'bg-danger/20 text-danger':'bg-warning/20 text-warning'}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          {payment.screenshot_url && (
                            <button onClick={() => { setSelectedPayment(payment); setShowScreenshot(true); }} className="px-2 py-1 bg-info/20 text-info rounded text-xs font-semibold hover:bg-info/30 transition-colors">
                              <Eye size={14}/>
                            </button>
                          )}
                          {payment.status.toLowerCase() === 'pending' && (
                            <>
                              <input type="date" value={proStart} onChange={e=>setProStart(e.target.value)} className="px-2 py-1 border rounded text-xs"/>
                              <input type="date" value={proEnd} onChange={e=>setProEnd(e.target.value)} className="px-2 py-1 border rounded text-xs"/>
                              <button onClick={() => handleApprove(payment)} disabled={isProcessing} className="px-2 py-1 bg-success/20 text-success rounded text-xs font-semibold hover:bg-success/30 transition-colors disabled:opacity-50">
                                <Check size={14}/>
                              </button>
                              <button onClick={() => handleReject(payment.id)} disabled={isProcessing} className="px-2 py-1 bg-danger/20 text-danger rounded text-xs font-semibold hover:bg-danger/30 transition-colors disabled:opacity-50">
                                <XCircle size={14}/>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-muted/50 px-4 py-4 flex items-center justify-between border-t border-border">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1} className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors">Previous</button>
                <button onClick={()=>setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors">Next</button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {showScreenshot && selectedPayment && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-card border border-border rounded-lg max-w-2xl w-full p-6" initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Payment Screenshot</h3>
                <button onClick={()=>setShowScreenshot(false)}><X size={20}/></button>
              </div>
              <img src={selectedPayment.screenshot_url!} alt="Screenshot" className="w-full rounded" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}