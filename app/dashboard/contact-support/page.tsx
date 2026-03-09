"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { selectUserEmail } from "@/store/UserLoggedInSlice";
import { submitSupportRequest } from "@/lib/supabase-service";

type SupportFormData = {
  subject: string;
  category: string;
  message: string;
  priority: string;
};


type PageContentProps = {
  userEmail: string | null;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string;
  formData: SupportFormData;
  setFormData: React.Dispatch<React.SetStateAction<SupportFormData>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

export default function ContactSupportPage() {


  const userEmail = useSelector(selectUserEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<SupportFormData>({
    subject: "",
    category: "Technical Issue",
    message: "",
    priority: "Medium",
  });



  return (
    <DashboardLayout
      title="Contact Support"
      subtitle="Get help from our support team"
    >
      <PageContent
     
        userEmail={userEmail}
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
        error={error}
        formData={formData}
        setFormData={setFormData}
        setIsSubmitting={setIsSubmitting}
        setIsSuccess={setIsSuccess}
        setError={setError}
      />
    </DashboardLayout>
  );
}

function PageContent({
  isSubmitting,
  userEmail,
  isSuccess,
  error,
  formData,
  setFormData,
  setIsSubmitting,
  setIsSuccess,
  setError,
}: PageContentProps) {

  

  const handleInputChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) => {
  const { name, value } = e.target as {
    name: keyof SupportFormData;
    value: string;
  };

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!userEmail) {
      setError("User email not found. Please log in again.");
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSupportRequest({
        user_email: userEmail,
        subject: formData.subject,
        category: formData.category,
        message: formData.message,
        priority: formData.priority,
      });

      setIsSuccess(true);
      setFormData({
        subject: "",
        category: "Technical Issue",
        message: "",
        priority: "Medium",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to submit support request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form or Success State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {!isSuccess ? (
          // Form Card
          <div className="bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-lg hover:border-primary/30 transition-colors">
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-400">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-foreground mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your issue"
                  className="w-full bg-input border border-border rounded-lg px-3 md:px-4 py-2 md:py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm md:text-base"
                  disabled={isSubmitting}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-foreground mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-input border border-border rounded-lg px-3 md:px-4 py-2 md:py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm md:text-base"
                  disabled={isSubmitting}
                >
                  <option>Technical Issue</option>
                  <option>Billing</option>
                  <option>Upgrade</option>
                  <option>Account</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-foreground mb-2">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full bg-input border border-border rounded-lg px-3 md:px-4 py-2 md:py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm md:text-base"
                  disabled={isSubmitting}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please provide detailed information about your issue..."
                  rows={5}
                  className="w-full bg-input border border-border rounded-lg px-3 md:px-4 py-2 md:py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none text-sm md:text-base"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-primary hover:shadow-lg hover:shadow-primary/50 text-primary-foreground font-semibold py-2 md:py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    Submitting...
                  </>
                ) : (
                  "Submit Support Request"
                )}
              </motion.button>
            </form>
          </div>
        ) : (
          // Success State
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 rounded-full bg-success/20 border border-success/50 mb-4 md:mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle2
                size={32}
                className="md:!size-[40px] text-success"
              />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
              Submitted Successfully!
            </h2>
            <div className="bg-card border border-border/50 rounded-xl p-4 md:p-6 text-muted-foreground space-y-3 md:space-y-4">
              <p className="text-sm md:text-base">
                Thank you for reaching out. Our support team will review your
                request shortly.
              </p>
              <p className="text-sm md:text-base">
                We will contact you directly at{" "}
                <span className="text-primary font-semibold">{userEmail}</span>{" "}
                as soon as possible.
              </p>
              <p className="text-xs md:text-sm">
                Your trading journey matters to us.
              </p>
            </div>

            <motion.button
              onClick={() => setIsSuccess(false)}
              className="mt-6 md:mt-8 px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-primary to-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Another Request
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
