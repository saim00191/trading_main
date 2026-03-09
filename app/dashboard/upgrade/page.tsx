'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { RootState } from '@/store/store';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { fetchUserName, submitPayment, uploadPaymentScreenshot } from '@/lib/supabase-service';
// import { submitPayment, uploadPaymentScreenshot } from '@/lib/supabase-service';

const FEATURES = [
  'Advanced Analytics Dashboard',
  'AI Trading Coach',
  'Risk Management Tools',
  'Performance Tracking',
  'Unlimited Trade Logs',
  'Priority Support',
];

const PAYMENT_OPTIONS = [
  { name: 'JazzCash', number: '03XXXXXXXX', holder: 'Saim Raza' },
  { name: 'Easypaisa', number: '03XXXXXXXX', holder: 'Saim Raza' },
];


// Props type for PageContent
interface PageContentProps {
  userEmail: string | null;
  showPaymentModal: boolean;
  showAgreementModal: boolean;
  isAgreed: boolean;
  isSubmitting: boolean;
  successMessage: string;
  setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAgreementModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAgreed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
}

export default function UpgradePage() {
 const userEmail = useSelector(selectUserEmail);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  return (
    <DashboardLayout title="Upgrade to Pro" subtitle="Unlock premium features">
      <PageContent 
        
        userEmail={userEmail}
        showPaymentModal={showPaymentModal}
        showAgreementModal={showAgreementModal}
        isAgreed={isAgreed}
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        setShowPaymentModal={setShowPaymentModal}
        setShowAgreementModal={setShowAgreementModal}
        setIsAgreed={setIsAgreed}
        setIsSubmitting={setIsSubmitting}
        setSuccessMessage={setSuccessMessage}
      />
    </DashboardLayout>
  );
}

function PageContent({
  userEmail,
  showPaymentModal,
  showAgreementModal,
  isAgreed,
  isSubmitting,
  successMessage,
  setShowPaymentModal,
  setShowAgreementModal,
  setIsAgreed,
  setIsSubmitting,
  setSuccessMessage,
}: PageContentProps) {

  const [formData, setFormData] = useState({
    amountPaid: '',
    senderNumber: '',
    accountHolder: '',
    paymentMethod: 'JazzCash',
    paidTo: 'JazzCash',
    monthsPurchased: '1',
    screenshot: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, screenshot: e.target.files![0] }));
    }
  };

  const handlePaymentProceed = async () => {
    if (!formData.amountPaid || !formData.senderNumber || !formData.accountHolder) {
      alert('Please fill in all required fields');
      return;
    }
    setShowAgreementModal(true);
  };

const handleAgreementSubmit = async () => {
  if (!isAgreed) {
    alert('Please accept the agreement to continue');
    return;
  }

  if (!userEmail) {
    alert('User email not found!');
    return;
  }

  setIsSubmitting(true);

  try {
    const username = await fetchUserName(userEmail);

    let screenshotUrl = '';
    if (formData.screenshot) {
      screenshotUrl = await uploadPaymentScreenshot(formData.screenshot, userEmail);
    }

    await submitPayment({
      user_email: userEmail,
      name: username,
      amount: parseFloat(formData.amountPaid),
      months: parseInt(formData.monthsPurchased),
      payment_method: formData.paymentMethod,
      sender_number: formData.senderNumber,
      receiver_number: PAYMENT_OPTIONS.find(o => o.name === formData.paidTo)?.number || '',
      account_holder_name: formData.accountHolder,
      screenshot_url: screenshotUrl,
    });

    setSuccessMessage('Payment Submitted Successfully');
    setShowPaymentModal(false);
    setShowAgreementModal(false);

    setFormData({
      amountPaid: '',
      senderNumber: '',
      accountHolder: '',
      paymentMethod: 'JazzCash',
      paidTo: 'JazzCash',
      monthsPurchased: '1',
      screenshot: null,
    });
    setIsAgreed(false);

    setTimeout(() => setSuccessMessage(''), 4000);
  }  catch (err: unknown) {
  console.error('Payment error:', err);

  if (err instanceof Error) {
    alert(err.message);
  } else {
    alert('Failed to submit payment. Please try again.');
  }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
    <div className="max-w-5xl mx-auto">
      {successMessage && (
        <motion.div
          className="mb-6 p-4 md:p-5 bg-success/20 border border-success/50 rounded-lg flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <CheckCircle2 size={20} className="text-success flex-shrink-0" />
          <p className="text-success font-semibold text-sm md:text-base">{successMessage}</p>
        </motion.div>
      )}

      {/* Pricing Card */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="bg-card border border-primary/30 rounded-xl p-4 md:p-8 shadow-lg hover:border-primary/50 transition-colors">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Side */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Pro Trader Plan</h2>
            <div className="mb-6 md:mb-8">
              <span className="text-4xl md:text-5xl font-bold text-primary">Rs 1000</span>
              <span className="text-muted-foreground ml-2 text-sm md:text-base">/ Month</span>
            </div>

            <div className="space-y-3 md:space-y-4">
              {FEATURES.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Check size={20} className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Side - Payment Info */}
              <div className="bg-[#0a0a0f]/50 rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Payment Instructions</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    To upgrade your account, please complete the manual payment process below. Once verified, your account will be upgraded within 6–12 hours.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Payment Options:</h4>
                  {PAYMENT_OPTIONS.map((option) => (
                    <div key={option.name} className="bg-[#0F1729]/50 rounded p-4 border border-gray-700/50">
                      <p className="text-white font-semibold">{option.name}</p>
                      <p className="text-gray-400 text-sm">{option.number}</p>
                      <p className="text-gray-400 text-sm">Account Holder: {option.holder}</p>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Pay Now
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
    
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                className="bg-[#0F1729] border border-gray-700/50 rounded-xl p-8 w-full max-w-md shadow-2xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Payment Details</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
               

                  {/* Editable Fields */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Amount Paid *</label>
                    <input
                      type="number"
                      name="amountPaid"
                      value={formData.amountPaid}
                      onChange={handleInputChange}
                      placeholder="e.g., 1000"
                      className="w-full bg-[#0a0a0f] border border-gray-700/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Sender Number *</label>
                    <input
                      type="text"
                      name="senderNumber"
                      value={formData.senderNumber}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      className="w-full bg-[#0a0a0f] border border-gray-700/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Account Holder Name *</label>
                    <input
                      type="text"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      placeholder="Name on the account"
                      className="w-full bg-[#0a0a0f] border border-gray-700/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0f] border border-gray-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option>JazzCash</option>
                      <option>Easypaisa</option>
                      <option>Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Paid To</label>
                    <select
                      name="paidTo"
                      value={formData.paidTo}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0f] border border-gray-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    >
                      {PAYMENT_OPTIONS.map((option) => (
                        <option key={option.name}>{option.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Months Purchased</label>
                    <select
                      name="monthsPurchased"
                      value={formData.monthsPurchased}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0f] border border-gray-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    >
                      {[1, 3, 6, 12].map((month) => (
                        <option key={month} value={month}>
                          {month} month{month > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Upload Screenshot</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full bg-[#0a0a0f] border border-gray-700/50 rounded-lg px-4 py-2 text-gray-400 file:text-blue-400 file:bg-blue-500/10 file:border-0 file:rounded file:px-3 file:py-1"
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handlePaymentProceed}
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Agreement Modal */}
      <AnimatePresence>
        {showAgreementModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgreementModal(false)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgreementModal(false)}
            >
              <motion.div
                className="bg-[#0F1729] border border-gray-700/50 rounded-xl p-8 w-full max-w-md shadow-2xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Confirm Payment</h2>

                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-400 text-sm">
                    I confirm that all information provided is accurate. I understand that submitting fake payment details may result in permanent account suspension and loss of all trading data.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-700/50 bg-[#0a0a0f] cursor-pointer accent-blue-500"
                  />
                  <span className="text-white">I agree to the terms and conditions</span>
                </label>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setShowAgreementModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-700/50 text-white font-semibold rounded-lg hover:bg-[#0a0a0f] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleAgreementSubmit}
                    disabled={!isAgreed || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Payment'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
    
  );
}
