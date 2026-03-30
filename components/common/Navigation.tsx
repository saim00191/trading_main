"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, // Dashboard
  BookOpen, // Trade Journal & Trading Plan
  TrendingUp, // Analytics
  Brain, // AI Coach
  Shield, // Risk Management
  Calendar, // Calendar
  CreditCard, // Payment History
  Bell, // Notifications
  ArrowUp, // Upgrade
  LifeBuoy, // Support
  Menu, // Hamburger Menu
  X, // Close icon
  Crown, // Settings icon
  LogOut, // Logout icon
} from "lucide-react";
import { logout } from "@/store/authSlice";
import { supabase } from "@/lib/supabaseClient";
import {
  selectUserEmail,
  clearEmail,
  loadEmailFromStorage,
} from "@/store/UserLoggedInSlice";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Trade Journal", href: "/dashboard/trades", icon: BookOpen },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "AI Coach", href: "/dashboard/ai-coach", icon: Brain },
  {
    label: "Risk Management",
    href: "/dashboard/risk-management",
    icon: Shield,
  },
  { label: "Trading Plan", href: "/dashboard/trading-plan", icon: BookOpen },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  {
    label: "Payment History",
    href: "/dashboard/payment-history",
    icon: CreditCard,
  },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Upgrade", href: "/dashboard/upgrade", icon: ArrowUp },
  { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
];

type User = {
  id: string;
  firebase_uid: string;
  username: string;
  email: string;
  phone: string;
  created_at: string;
  time_period_start: string;
  time_period_end: string;
  user_type: string;
  last_updated_at: string;
};

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const userEmail = useSelector(selectUserEmail);
  // console.log("User Email:", userEmail); // ✅ Redux only has email
  const [userData, setUserData] = useState<User | null>(null); // Supabase user data
  const [countdown, setCountdown] = useState("");
  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    dispatch(loadEmailFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!userEmail) return;

    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from("users") // ✅ your Supabase table name
        .select("*")
        .eq("email", userEmail)
        .single();

      setUserData(data);
    };

    fetchUserData();
  }, [userEmail]);

  // Countdown timer effect
  useEffect(() => {
    if (!userData?.time_period_end) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(userData.time_period_end).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setCountdown("Expired");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [userData?.time_period_end]);


  useEffect(() => {
  if (!userEmail) return;

  const fetchUnreadNotifications = async () => {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true }) 
      .eq("email", userEmail)
      .eq("status", "pending"); // 

    if (!error) {
      setUnreadCount(count || 0);
    }
  };

  fetchUnreadNotifications();
}, [userEmail]);

  // Format date helper
  const formatDate = (date?: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle logout
  const handleLogout = () => {
    // 1️⃣ Clear email from your Redux slice
    dispatch(clearEmail()); // <-- action from your userEmailSlice
    dispatch(logout());

    // 2️⃣ Optionally remove from localStorage if you saved it there
    localStorage.removeItem("userEmail");

    // 3️⃣ Close settings modal
    setIsSettingsOpen(false);

    // 4️⃣ Redirect to login
    router.push("/login");
  };
  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed right-4 top-4 z-50 rounded-lg bg-primary p-2 text-primary-foreground md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar transition-transform duration-300
          transform md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          border-r border-sidebar-border overflow-y-auto
        `}
      >
        <div className="p-6">
          {/* Logo/Title */}
          <div className="mb-8 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">TradeLab</h1>
          </div>

          {/* Navigation items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300
                    ${
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                    }
                  `}
                >
                  <Icon size={20} />
                  <div className="flex items-center justify-between w-full">
  <span className="font-medium">{item.label}</span>

  {/* Notification Badge */}
  {item.label === "Notifications" && unreadCount > 0 && (
    <span className="ml-2 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
      {unreadCount}
    </span>
  )}
</div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border bg-sidebar p-4">
          <div
            onClick={() => setIsSettingsOpen(true)}
            className="cursor-pointer rounded-lg px-4 py-3 hover:bg-sidebar-accent/10 transition-all duration-300"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">
                {userData?.username || "User"}
              </span>

              {/* Badge */}
              <span
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  userData?.user_type === "pro"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {userData?.user_type === "pro" && <Crown size={12} />}
                {userData?.user_type === "pro" ? "PRO" : "FREE"}
              </span>
            </div>

            {/* Countdown Section */}
            {countdown && (
              <div className="mt-2 text-xs flex items-center gap-1">
                {/* Label */}
                <span className="text-gray-400 font-medium">Time Left:</span>

                {/* Countdown Value */}
                <span
                  className={`font-semibold ${
                    countdown === "Expired" ? "text-red-400" : "text-blue-400"
                  }`}
                >
                  {countdown === "Expired" ? "Expired" : countdown}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              transition={{ duration: 0.2 }}
            />

            {/* Modal Card */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSettingsOpen(false)}
            >
              <motion.div
                className="bg-[#0f0f1e] border border-gray-700/50 rounded-xl p-6 w-full max-w-[90%] md:max-w-[400px] shadow-2xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    User Settings
                  </h2>
                  <motion.button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                {/* User Information */}
                <div className="space-y-4 mb-6">
                  {/* Username */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <span className="text-sm text-gray-400 font-medium">
                      Username
                    </span>
                    <span className="text-white font-semibold">
                      {userData?.username || "N/A"}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <span className="text-sm text-gray-400 font-medium">
                      Email
                    </span>
                    <span className="text-white font-semibold break-all">
                      {userData?.email || "N/A"}
                    </span>
                  </div>
                  {/* Phone */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <span className="text-sm text-gray-400 font-medium">
                      Phone
                    </span>
                    <span className="text-white font-semibold break-all">
                      {userData?.phone || "N/A"}
                    </span>
                  </div>

                  {/* User Type */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <span className="text-sm text-gray-400 font-medium">
                      User Type
                    </span>

                    <span
                      className={`flex items-center gap-1 font-semibold capitalize ${
                        userData?.user_type === "pro"
                          ? "text-green-400"
                          : "text-white"
                      }`}
                    >
                      {userData?.user_type === "pro" && (
                        <Crown size={14} className="text-yellow-400" />
                      )}

                      {userData?.user_type || "N/A"}
                    </span>
                  </div>

                  {/* Time Period Start */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <span className="text-sm text-gray-400 font-medium">
                      Period Start
                    </span>
                    <span className="text-white font-semibold">
                      {formatDate(userData?.time_period_start)}
                    </span>
                  </div>

                  {/* Time Period End */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <span className="text-sm text-gray-400 font-medium">
                      Period End
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {userData?.time_period_end
                          ? formatDate(userData?.time_period_end)
                          : "N/A"}
                      </span>
                      {countdown && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            countdown === "Expired"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {countdown}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={18} />
                  Logout
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
