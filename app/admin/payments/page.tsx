'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';

interface Payment {
  id: number;
  userEmail: string;
  amount: string;
  months: number;
  paymentMethod: string;
  senderNumber: string;
  accountHolderName: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const mockPayments: Payment[] = [
  {
    id: 1,
    userEmail: 'john@example.com',
    amount: '₹1000',
    months: 1,
    paymentMethod: 'JazzCash',
    senderNumber: '0300-1234567',
    accountHolderName: 'John Doe',
    date: '2024-03-05',
    status: 'Pending',
  },
  {
    id: 2,
    userEmail: 'alice@example.com',
    amount: '₹2000',
    months: 2,
    paymentMethod: 'EasyPaisa',
    senderNumber: '0321-9876543',
    accountHolderName: 'Alice Smith',
    date: '2024-03-04',
    status: 'Approved',
  },
  {
    id: 3,
    userEmail: 'bob@example.com',
    amount: '₹1000',
    months: 1,
    paymentMethod: 'JazzCash',
    senderNumber: '0300-5555555',
    accountHolderName: 'Bob Wilson',
    date: '2024-03-03',
    status: 'Rejected',
  },
];

export default function AdminPaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 size={18} className="text-success" />;
      case 'Rejected':
        return <XCircle size={18} className="text-danger" />;
      case 'Pending':
        return <Clock size={18} className="text-warning" />;
      default:
        return null;
    }
  };

  const handleApprovePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsApproveModalOpen(true);
  };

  const confirmApproval = () => {
    // Approval logic here
    setIsApproveModalOpen(false);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Payments Management</h1>
        <p className="text-muted-foreground">Review and approve user payments</p>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdminTable<Payment>
          columns={[
            { key: 'userEmail', label: 'User Email' },
            { key: 'amount', label: 'Amount' },
            { key: 'months', label: 'Months' },
            { key: 'paymentMethod', label: 'Method' },
            { key: 'date', label: 'Date' },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <div className="flex items-center gap-2">
                  {getStatusIcon(value)}
                  <span className={`text-xs font-semibold ${
                    value === 'Approved' ? 'text-success' :
                    value === 'Rejected' ? 'text-danger' :
                    'text-warning'
                  }`}>
                    {value}
                  </span>
                </div>
              ),
            },
          ]}
          data={mockPayments}
          actions={(payment) => (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => {
                  setSelectedPayment(payment);
                  setIsViewModalOpen(true);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="View Details"
              >
                <Eye size={18} className="text-primary" />
              </motion.button>
              {payment.status === 'Pending' && (
                <>
                  <motion.button
                    onClick={() => handleApprovePayment(payment)}
                    className="px-3 py-1 bg-success/20 text-success text-xs font-semibold rounded-lg hover:bg-success/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Approve
                  </motion.button>
                  <motion.button
                    className="px-3 py-1 bg-danger/20 text-danger text-xs font-semibold rounded-lg hover:bg-danger/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reject
                  </motion.button>
                </>
              )}
            </div>
          )}
        />
      </motion.div>

      {/* View Payment Modal  */}
      {/* <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Payment Details"
        size="md"
      >
        <>
        {selectedPayment && (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">User Email</p>
              <p className="text-foreground font-medium">{selectedPayment.userEmail}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Amount</p>
                <p className="text-foreground font-medium">{selectedPayment.amount}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Months</p>
                <p className="text-foreground font-medium">{selectedPayment.months}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Payment Method</p>
              <p className="text-foreground font-medium">{selectedPayment.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Sender Number</p>
              <p className="text-foreground font-medium">{selectedPayment.senderNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Account Holder Name</p>
              <p className="text-foreground font-medium">{selectedPayment.accountHolderName}</p>
            </div>
          </div>
        )}
        </>
        actions={
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
          >
            Close
          </button>
        }
      /> */}

       {/* View Payment Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Payment Details"
        size="md"
        actions={
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
          >
            Close
          </button>
        }
      >
        {selectedPayment ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">User Email</p>
              <p className="text-foreground font-medium">{selectedPayment.userEmail}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Amount</p>
                <p className="text-foreground font-medium">{selectedPayment.amount}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Months</p>
                <p className="text-foreground font-medium">{selectedPayment.months}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Payment Method</p>
              <p className="text-foreground font-medium">{selectedPayment.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Sender Number</p>
              <p className="text-foreground font-medium">{selectedPayment.senderNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Account Holder Name</p>
              <p className="text-foreground font-medium">{selectedPayment.accountHolderName}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No payment selected.</p>
        )}
      </AdminModal>

      {/* Approve Confirmation Modal */}
      <AdminModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Payment?"
        size="sm"
      >
        <p className="text-muted-foreground mb-6">
          Approve payment of {selectedPayment?.amount} from {selectedPayment?.userEmail}? This will upgrade their account to Pro.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsApproveModalOpen(false)}
            className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmApproval}
            className="flex-1 px-4 py-2 rounded-lg bg-success text-foreground font-medium hover:bg-success/80 transition-colors"
          >
            Approve Payment
          </button>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
