'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, CheckCircle2, MessageCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getAllSupportRequests, getSupportStats, markSupportAsResponded, markSupportAsResolved, type AdminSupportRequest } from '@/lib/admin/adminSupportService';
import { toast } from 'sonner';

interface SupportStats {
  totalRequests: number;
  pendingCount: number;
  respondedCount: number;
  resolvedCount: number;
}

export default function AdminSupportPage() {
  const [requests, setRequests] = useState<AdminSupportRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
 const [stats, setStats] = useState<SupportStats>({
    totalRequests: 0,
    pendingCount: 0,
    respondedCount: 0,
    resolvedCount: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'pending' | 'responded' | 'resolved' | ''>('');

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<AdminSupportRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [requestsData, statsData] = await Promise.all([
          getAllSupportRequests(statusFilter ? { status: statusFilter } : {}, page, 20),
          getSupportStats(),
        ]);
        setRequests(requestsData.requests);
        setTotal(requestsData.total);
        setStats(statsData);
      } catch (error) {
        console.error('[Admin Support] Error loading data:', error);
        toast.error('Failed to load support requests');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [page, statusFilter]);

  const handleMarkResponded = async (request: AdminSupportRequest) => {
    try {
      setIsProcessing(true);
      await markSupportAsResponded(request.id);
      toast.success('Marked as responded');
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'responded' } : r))
      );
      setStats((prev) => ({
        ...prev,
        pendingCount: Math.max(0, prev.pendingCount - 1),
        respondedCount: prev.respondedCount + 1,
      }));
    } catch (error) {
      console.error('[Admin Support] Error marking as responded:', error);
      toast.error('Failed to update status');
    } finally {
      setIsProcessing(false);
    }
  };

const handleMarkResolved = async (request: AdminSupportRequest) => {
  try {
    setIsProcessing(true);
    await markSupportAsResolved(request.id);
    toast.success('Marked as resolved');

    // Update requests array
    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id ? { ...r, status: 'resolved' } : r
      )
    );

    // Update stats correctly
    setStats((prev) => {
      let pendingDelta = 0;
      let respondedDelta = 0;

      if (request.status === 'pending') pendingDelta = -1;
      if (request.status === 'responded') respondedDelta = -1;

      return {
        ...prev,
        pendingCount: Math.max(0, prev.pendingCount + pendingDelta),
        respondedCount: Math.max(0, prev.respondedCount + respondedDelta),
        resolvedCount: prev.resolvedCount + 1,
      };
    });
  } catch (error) {
    console.error('[Admin Support] Error marking as resolved:', error);
    toast.error('Failed to resolve request');
  } finally {
    setIsProcessing(false);
  }
};

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-foreground mb-2">Support Requests</h1>
        <p className="text-muted-foreground">Manage customer support tickets</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div className="bg-card border border-border rounded-lg p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-sm text-muted-foreground mb-2">Total Requests</p>
          <p className="text-3xl font-bold text-primary">{stats.totalRequests}</p>
        </motion.div>
        <motion.div className="bg-card border border-border rounded-lg p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-sm text-muted-foreground mb-2">Pending</p>
          <p className="text-3xl font-bold text-warning">{stats.pendingCount}</p>
        </motion.div>
        <motion.div className="bg-card border border-border rounded-lg p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p className="text-sm text-muted-foreground mb-2">Responded</p>
          <p className="text-3xl font-bold text-info">{stats.respondedCount}</p>
        </motion.div>
        <motion.div className="bg-card border border-border rounded-lg p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p className="text-sm text-muted-foreground mb-2">Resolved</p>
          <p className="text-3xl font-bold text-success">{stats.resolvedCount}</p>
        </motion.div>
      </div>

      {/* Filter */}
      <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'pending' | 'responded' | 'resolved' | '');
            setPage(1);
          }}
          className="px-4 py-2 bg-card border border-border rounded-lg text-foreground"
        >
          <option value="">All Requests</option>
          <option value="pending">Pending</option>
          <option value="responded">Responded</option>
          <option value="resolved">Resolved</option>
        </select>
      </motion.div>

      {/* Support Requests Table */}
      <motion.div className="bg-card border border-border rounded-lg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No support requests found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">{request.user_name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{request.user_email}</td>
                      <td className="px-4 py-3 text-sm text-foreground truncate max-w-xs">{request.subject}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            request.status === 'resolved'
                              ? 'bg-success/20 text-success'
                              : request.status === 'responded'
                                ? 'bg-info/20 text-info'
                                : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                            className="px-2 py-1 bg-info/20 text-info rounded text-xs font-semibold hover:bg-info/30 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleMarkResponded(request)}
                              disabled={isProcessing}
                              className="px-2 py-1 bg-info/20 text-info rounded text-xs font-semibold hover:bg-info/30 transition-colors disabled:opacity-50"
                            >
                              <MessageCircle size={14} />
                            </button>
                          )}
                          {request.status !== 'resolved' && (
                            <button
                              onClick={() => handleMarkResolved(request)}
                              disabled={isProcessing}
                              className="px-2 py-1 bg-success/20 text-success rounded text-xs font-semibold hover:bg-success/30 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} />
                            </button>
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
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRequest && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border border-border rounded-lg max-w-2xl w-full p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Support Request Details</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">From</p>
                  <p className="text-foreground font-medium">{selectedRequest.user_name} ({selectedRequest.user_email})</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Subject</p>
                  <p className="text-foreground font-medium">{selectedRequest.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Message</p>
                  <p className="text-foreground bg-background/50 p-4 rounded-lg whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Date</p>
                    <p className="text-foreground font-medium">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedRequest.status === 'resolved'
                        ? 'bg-success/20 text-success'
                        : selectedRequest.status === 'responded'
                          ? 'bg-info/20 text-info'
                          : 'bg-warning/20 text-warning'
                    }`}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
                {selectedRequest.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      handleMarkResolved(selectedRequest);
                      setShowDetailModal(false);
                    }}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 rounded-lg bg-success text-foreground font-medium hover:bg-success/80 transition-colors disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
