'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, CheckCircle2, Eye } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';

interface SupportRequest {
  id: number;
  userEmail: string;
  subject: string;
  message: string;
  date: string;
  status: 'Open' | 'Resolved';
}

const mockSupportRequests: SupportRequest[] = [
  {
    id: 1,
    userEmail: 'john@example.com',
    subject: 'Account Access Issue',
    message: 'Unable to login to my account. Getting error 403.',
    date: '2024-03-05',
    status: 'Open',
  },
  {
    id: 2,
    userEmail: 'alice@example.com',
    subject: 'Payment Not Credited',
    message: 'Sent payment 2 days ago but account not upgraded yet.',
    date: '2024-03-04',
    status: 'Open',
  },
  {
    id: 3,
    userEmail: 'bob@example.com',
    subject: 'Feature Request',
    message: 'Would like to see a mobile app version.',
    date: '2024-03-02',
    status: 'Resolved',
  },
];

export default function AdminSupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<SupportRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const handleReply = (ticket: SupportRequest) => {
    setSelectedTicket(ticket);
    setIsReplyModalOpen(true);
  };

  const handleMarkResolved = (ticket: SupportRequest) => {
    setSelectedTicket(ticket);
    // Mark as resolved logic here
  };

  const sendReply = () => {
    // Send reply logic here
    setIsReplyModalOpen(false);
    setReplyMessage('');
  };

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Support Requests</h1>
        <p className="text-muted-foreground">Manage customer support tickets</p>
      </motion.div>

      {/* Support Table */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdminTable<SupportRequest>
          columns={[
            { key: 'userEmail', label: 'User Email' },
            { key: 'subject', label: 'Subject' },
            { key: 'date', label: 'Date' },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  value === 'Resolved' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                }`}>
                  {value}
                </span>
              ),
            },
          ]}
          data={mockSupportRequests}
          actions={(ticket) => (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => {
                  setSelectedTicket(ticket);
                  setIsViewModalOpen(true);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="View Ticket"
              >
                <Eye size={18} className="text-primary" />
              </motion.button>
              {ticket.status === 'Open' && (
                <>
                  <motion.button
                    onClick={() => handleReply(ticket)}
                    className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-lg hover:bg-primary/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reply
                  </motion.button>
                  <motion.button
                    onClick={() => handleMarkResolved(ticket)}
                    className="px-3 py-1 bg-success/20 text-success text-xs font-semibold rounded-lg hover:bg-success/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Resolve
                  </motion.button>
                </>
              )}
            </div>
          )}
        />
      </motion.div>

      {/* View Ticket Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Support Ticket Details"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">User Email</p>
              <p className="text-foreground font-medium">{selectedTicket.userEmail}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Subject</p>
              <p className="text-foreground font-medium">{selectedTicket.subject}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Message</p>
              <p className="text-foreground bg-background/50 p-4 rounded-lg">{selectedTicket.message}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Date</p>
                <p className="text-foreground font-medium">{selectedTicket.date}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Status</p>
                <p className={selectedTicket.status === 'Resolved' ? 'text-success font-medium' : 'text-warning font-medium'}>
                  {selectedTicket.status}
                </p>
              </div>
            </div>
          </div>
        )}
        actions={
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
          >
            Close
          </button>
        }
      />

      {/* Reply Modal */}
      <AdminModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title="Reply to Ticket"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">To: {selectedTicket?.userEmail}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Your Reply</label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your response here..."
              rows={6}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setIsReplyModalOpen(false)}
            className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={sendReply}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
          >
            Send Reply
          </button>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
