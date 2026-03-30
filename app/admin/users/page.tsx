// 'use client';

// import React, { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Search, Mail, Phone, Crown, X, AlertCircle } from 'lucide-react';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// import { toast } from 'sonner';
// import {
//   getAllUsers,
//   getUserDetailStats,
//   upgradeUserToPro,
//   deleteUser,
//   searchUsers,
//   type AdminUser,
//   type UserDetailStats
// } from '@/lib/admin/adminUsersService';

// export default function AdminUsersPage() {
//   const [users, setUsers] = useState<AdminUser[]>([]);
//   const [total, setTotal] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [search, setSearch] = useState('');
//  const [stats, setStats] = useState({ totalUsers: 0, freeUsers: 0, proUsers: 0 });

//   // Modal states
//   const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
//   const [userDetails, setUserDetails] = useState<UserDetailStats | null>(null);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [showProModal, setShowProModal] = useState(false);
//   const [proStart, setProStart] = useState(new Date().toISOString().split('T')[0]);
//   const [proEnd, setProEnd] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
//   const [isProcessing, setIsProcessing] = useState(false);

// useEffect(() => {

//     const loadUsers = async () => {

//       try {

//         setIsLoading(true);

//         const usersData = search
//           ? await searchUsers(search, page, limit)
//           : await getAllUsers(page, limit);

//         setUsers(usersData.users);
//         setTotal(usersData.total);

//         const freeUsers = usersData.users.filter(u => u.user_type === 'free').length;
//         const proUsers = usersData.users.filter(u => u.user_type === 'pro').length;

//         setStats({
//           totalUsers: usersData.total,
//           freeUsers,
//           proUsers
//         });

//       } catch (error) {

//         console.error('[Admin Users] Error loading users:', error);
//         toast.error('Failed to load users');

//       } finally {

//         setIsLoading(false);

//       }
//     };

//     loadUsers();

//   }, [search, page, limit]);

// const handleViewDetails = async (user: AdminUser) => {
//   try {
//     // Store selected user first
//     setSelectedUser(user);

//     // Fetch user details from Supabase
//     const details = await getUserDetailStats(user.email);

//     // Handle case where details are not found
//     if (!details) {
//       toast.error('User details not found');
//       return;
//     }

//     // Set details and open modal
//     setUserDetails(details);
//     setShowDetailModal(true);

//   } catch (error) {
//     console.error('[Admin Users] Error loading user details:', error);
//     toast.error('Failed to load user details');
//   }
// };


//  const handleUpgradePro = async () => {

//     if (!selectedUser) return;

//     try {

//       setIsProcessing(true);

//       await upgradeUserToPro(selectedUser.email, proStart, proEnd);

//       toast.success(`${selectedUser.username} upgraded to Pro successfully!`);

//       setShowProModal(false);
//       setShowDetailModal(false);
//       setSelectedUser(null);

//       const usersData = search
//         ? await searchUsers(search, page, limit)
//         : await getAllUsers(page, limit);

//       setUsers(usersData.users);

//     } catch (error) {

//       console.error('[Admin Users] Error upgrading user:', error);
//       toast.error('Failed to upgrade user');

//     } finally {

//       setIsProcessing(false);

//     }
//   };

//   // const handleBlockUser = async (email: string) => {
//   //   if (!window.confirm('Are you sure you want to block this user?')) return;

//   //   try {
//   //     await blockUser(email);
//   //     toast.success('User blocked successfully');
//   //     setUsers((prev) => prev.filter((u) => u.email !== email));
//   //   } catch (error) {
//   //     console.error('[Admin Users] Error blocking user:', error);
//   //     toast.error('Failed to block user');
//   //   }
//   // };

//     const handleDeleteUser = async (email: string) => {

//     if (!window.confirm('This will permanently delete the user and all their data. Are you sure?')) return;

//     try {

//       await deleteUser(email);

//       toast.success('User deleted successfully');

//       setUsers((prev) => prev.filter((u) => u.email !== email));

//     } catch (error) {

//       console.error('[Admin Users] Error deleting user:', error);
//       toast.error('Failed to delete user');

//     }
//   };

//   const totalPages = Math.ceil(total / limit);

//   return (
//     <AdminLayout>
//       <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
//         <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
//         <p className="text-muted-foreground">Manage platform users and subscriptions</p>
//       </motion.div>

//       {/* User Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <motion.div className="bg-card border border-border rounded-lg p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
//           <p className="text-sm text-muted-foreground mb-2">Total Users</p>
//           <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
//         </motion.div>
//         <motion.div className="bg-card border border-border rounded-lg p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
//           <p className="text-sm text-muted-foreground mb-2">Free Users</p>
//           <p className="text-3xl font-bold text-info">{stats.freeUsers}</p>
//         </motion.div>
//         <motion.div className="bg-card border border-border rounded-lg p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
//           <p className="text-sm text-muted-foreground mb-2">Pro Users</p>
//           <p className="text-3xl font-bold text-success">{stats.proUsers}</p>
//         </motion.div>
//       </div>

//       {/* Search */}
//       <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//         <label className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
//           <Search size={18} className="text-muted-foreground" />
//           <input
//             type="text"
//             placeholder="Search by username or email..."
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//             className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
//           />
//         </label>
//       </motion.div>

//       {/* Users Table */}
//       <motion.div className="bg-card border border-border rounded-lg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
//           </div>
//         ) : users.length === 0 ? (
//           <div className="p-12 text-center">
//             <p className="text-muted-foreground">No users found</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-muted/50 border-b border-border">
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Username</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Account Type</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Phone Number</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Join Date</th>
//                     {/* <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th> */}
//                     <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user) => (
//                     <tr key={user.email} className="border-b border-border hover:bg-muted/50 transition-colors">
//                       <td className="px-4 py-3 text-sm text-foreground font-medium">{user.username}</td>
//                       <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
//                       <td className="px-4 py-3 text-sm">
                      
//                         <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold w-fit ${
//                           user.user_type === 'pro'
//                             ? 'bg-success/20 text-success'
//                             : 'bg-info/20 text-info'
//                         }`}>

//                           {user.user_type === 'pro' && <Crown size={12} />}

//                           {user.user_type.toUpperCase()}

//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-sm text-foreground">{user.phone}</td>
//                       <td className="px-4 py-3 text-sm text-muted-foreground">  {new Date(user.created_at).toLocaleDateString()}</td>
//                       {/* <td className="px-4 py-3 text-sm">
//                         <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'Active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
//                           {user.status}
//                         </span>
//                       </td> */}
//                       <td className="px-4 py-3 text-sm text-right">
//                         <div className="flex gap-2 justify-end">
//                           <button
//                             onClick={() => handleViewDetails(user)}
//                             className="px-3 py-1 bg-primary/20 text-primary rounded text-xs font-semibold hover:bg-primary/30 transition-colors"
//                           >
//                             View
//                           </button>
//                           {user.user_type === 'free' && (
//                             <button
//                               onClick={() => {
//                                 setSelectedUser(user);
//                                 setShowProModal(true);
//                               }}
//                               className="px-3 py-1 bg-success/20 text-success rounded text-xs font-semibold hover:bg-success/30 transition-colors"
//                             >
//                               Pro
//                             </button>
//                           )}
//                           {/* <button
//                             onClick={() => handleBlockUser(user.email)}
//                             className="px-3 py-1 bg-warning/20 text-warning rounded text-xs font-semibold hover:bg-warning/30 transition-colors"
//                           >
//                             Block
//                           </button> */}
//                           <button
//                             onClick={() => handleDeleteUser(user.email)}
//                             className="px-3 py-1 bg-danger/20 text-danger rounded text-xs font-semibold hover:bg-danger/30 transition-colors"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             <div className="bg-muted/50 px-4 py-4 flex items-center justify-between border-t border-border">
//               <p className="text-sm text-muted-foreground">
//                 Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
//               </p>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(Math.max(1, page - 1))}
//                   disabled={page === 1}
//                   className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
//                 >
//                   Previous
//                 </button>
//                 <span className="px-3 py-1 text-sm text-muted-foreground">
//                   {page} / {totalPages}
//                 </span>
//                 <button
//                   onClick={() => setPage(Math.min(totalPages, page + 1))}
//                   disabled={page === totalPages}
//                   className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </motion.div>

//       {/* User Details Modal */}
//       <AnimatePresence>
//         {showDetailModal && selectedUser && userDetails && (
//           <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <motion.div
//               className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//             >
//               {/* Header */}
//               <div className="flex items-start justify-between mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
//                     {userDetails.username}
//                    {userDetails.user_type === 'pro' && <Crown size={24} className="text-success" />}
//                   </h2>
//                   <p className="text-sm text-muted-foreground mt-1">{userDetails.email}</p>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowDetailModal(false);
//                     setSelectedUser(null);
//                     setUserDetails(null);
//                   }}
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* Details Grid */}
//               <div className="grid grid-cols-2 gap-6 mb-8">
//                 <div>
//                   <p className="text-xs text-muted-foreground mb-2">Email</p>
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} className="text-muted-foreground" />
//                     <p className="text-sm text-foreground">{userDetails.email}</p>
//                   </div>
//                 </div>
//                 {userDetails.phone && (
//                   <div>
//                     <p className="text-xs text-muted-foreground mb-2">Phone</p>
//                     <div className="flex items-center gap-2">
//                       <Phone size={16} className="text-muted-foreground" />
//                       <p className="text-sm text-foreground">{userDetails.phone}</p>
//                     </div>
//                   </div>
//                 )}
//                 <div>
//                   <p className="text-xs text-muted-foreground mb-2">Account Type</p>
//                   <p className={`text-sm font-semibold ${userDetails.user_type === 'pro' ? 'text-success' : 'text-info'}`}>{userDetails.user_type.toUpperCase()}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-muted-foreground mb-2">Join Date</p>
//                   <p className="text-sm text-foreground">{userDetails.join_date}</p>
//                 </div>
//                 {/* <div>
//                   <p className="text-xs text-muted-foreground mb-2">Total Trades</p>
//                   <p className="text-sm text-foreground font-semibold">{userDetails.total_trades}</p>
//                 </div> */}
//                 {/* <div>
//                   <p className="text-xs text-muted-foreground mb-2">Win Rate</p>
//                   <p className="text-sm text-foreground font-semibold">{userDetails.win_rate}%</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-muted-foreground mb-2">Total Profit</p>
//                   <p className="text-sm text-success font-semibold">₹{userDetails.total_profit.toFixed(2)}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-muted-foreground mb-2">Total Loss</p>
//                   <p className="text-sm text-danger font-semibold">₹{userDetails.total_loss.toFixed(2)}</p>
//                 </div> */}
//                 {userDetails.trial_period && (
//     <div className="col-span-2">
//       <p className="text-xs text-muted-foreground mb-2">Trial Period</p>
//       <p className="text-sm text-foreground">{userDetails.trial_period}</p>
//     </div>
//   )}
//               </div>

//               {/* Actions */}
//               <div className="flex gap-4 border-t border-border pt-6">
//                 {selectedUser?.user_type === 'free' && (
//                   <button
//                     onClick={() => {
//                       setShowDetailModal(false);
//                       setShowProModal(true);
//                     }}
//                     className="flex-1 px-4 py-2 bg-success/20 text-success rounded-lg font-semibold hover:bg-success/30 transition-colors flex items-center justify-center gap-2"
//                   >
//                     <Crown size={18} />
//                     Upgrade to Pro
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setShowDetailModal(false)}
//                   className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Pro Upgrade Modal */}
//       <AnimatePresence>
//         {showProModal && selectedUser && (
//           <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <motion.div
//               className="bg-card border border-border rounded-lg max-w-md w-full p-6"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//             >
//               <h2 className="text-2xl font-bold text-foreground mb-2">Upgrade to Pro</h2>
//               <p className="text-sm text-muted-foreground mb-6">Manage subscription period for {selectedUser.username}</p>

//               <div className="space-y-4 mb-8">
//                 <div>
//                   <label className="block text-sm font-semibold text-foreground mb-2">Start Date</label>
//                   <input
//                     type="date"
//                     value={proStart}
//                     onChange={(e) => setProStart(e.target.value)}
//                     className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-foreground mb-2">End Date</label>
//                   <input
//                     type="date"
//                     value={proEnd}
//                     onChange={(e) => setProEnd(e.target.value)}
//                     className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
//                   />
//                 </div>
//               </div>

//               {/* Confirmation Alert */}
//               <div className="bg-warning/10 border border-warning/50 rounded-lg p-4 mb-8">
//                 <div className="flex gap-3">
//                   <AlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
//                   <div>
//                     <p className="text-sm font-semibold text-foreground mb-1">Confirmation</p>
//                     <p className="text-xs text-muted-foreground">
//                       <strong>{selectedUser.username}</strong> will be upgraded to PRO from <strong>{new Date(proStart).toLocaleDateString()}</strong> to{' '}
//                       <strong>{new Date(proEnd).toLocaleDateString()}</strong>
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-4">
//                 <button
//                   onClick={() => setShowProModal(false)}
//                   className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
//                   disabled={isProcessing}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleUpgradePro}
//                   disabled={isProcessing}
//                   className="flex-1 px-4 py-2 bg-success text-success-foreground rounded-lg font-semibold hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {isProcessing ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-success-foreground border-t-transparent rounded-full animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <Crown size={18} />
//                       Confirm Upgrade
//                     </>
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </AdminLayout>
//   );
// }














"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mail, Phone, Crown, X, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import {
  getAllUsers,
  getUserDetailStats,
  // upgradeUserToPro,
  // deleteUser,
  searchUsers,
  type AdminUser,
  type UserDetailStats,
  toggleBlockUser,
} from "@/lib/admin/adminUsersService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
  });

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetailStats | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  // const [proStart, setProStart] = useState(new Date().toISOString().split('T')[0]);
  // const [proEnd, setProEnd] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  // const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);

        const usersData = search
          ? await searchUsers(search, page, limit)
          : await getAllUsers(page, limit);

        setUsers(usersData.users);
        setTotal(usersData.total);

        const freeUsers = usersData.users.filter(
          (u) => u.user_type === "free",
        ).length;
        const proUsers = usersData.users.filter(
          (u) => u.user_type === "pro",
        ).length;

        setStats({
          totalUsers: usersData.total,
          freeUsers,
          proUsers,
        });
      } catch (error) {
        console.error("[Admin Users] Error loading users:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [search, page, limit]);

  const handleViewDetails = async (user: AdminUser) => {
    try {
      // Store selected user first
      setSelectedUser(user);

      // Fetch user details from Supabase
      const details = await getUserDetailStats(user.email);

      // Handle case where details are not found
      if (!details) {
        toast.error("User details not found");
        return;
      }

      // Set details and open modal
      setUserDetails(details);
      setShowDetailModal(true);
    } catch (error) {
      console.error("[Admin Users] Error loading user details:", error);
      toast.error("Failed to load user details");
    }
  };

  //  const handleUpgradePro = async () => {

  //     if (!selectedUser) return;

  //     try {

  //       setIsProcessing(true);

  //       await upgradeUserToPro(selectedUser.email, proStart, proEnd);

  //       toast.success(`${selectedUser.username} upgraded to Pro successfully!`);

  //       setShowProModal(false);
  //       setShowDetailModal(false);
  //       setSelectedUser(null);

  //       const usersData = search
  //         ? await searchUsers(search, page, limit)
  //         : await getAllUsers(page, limit);

  //       setUsers(usersData.users);

  //     } catch (error) {

  //       console.error('[Admin Users] Error upgrading user:', error);
  //       toast.error('Failed to upgrade user');

  //     } finally {

  //       setIsProcessing(false);

  //     }
  //   };

  // const handleBlockUser = async (email: string) => {
  //   if (!window.confirm('Are you sure you want to block this user?')) return;

  //   try {
  //     await blockUser(email);
  //     toast.success('User blocked successfully');
  //     setUsers((prev) => prev.filter((u) => u.email !== email));
  //   } catch (error) {
  //     console.error('[Admin Users] Error blocking user:', error);
  //     toast.error('Failed to block user');
  //   }
  // };

  //   const handleDeleteUser = async (email: string) => {

  //   if (!window.confirm('This will permanently delete the user and all their data. Are you sure?')) return;

  //   try {

  //     await deleteUser(email);

  //     toast.success('User deleted successfully');

  //     setUsers((prev) => prev.filter((u) => u.email !== email));

  //   } catch (error) {

  //     console.error('[Admin Users] Error deleting user:', error);
  //     toast.error('Failed to delete user');

  //   }
  // };

  const handleToggleBlock = async (user: AdminUser) => {
    const action = user.is_blocked ? "unblock" : "block";

    if (!window.confirm(`Are you sure you want to ${action} this user?`))
      return;

    try {
      await toggleBlockUser(user.email, !user.is_blocked);

      toast.success(`User ${action}ed successfully`);

      setUsers((prev) =>
        prev.map((u) =>
          u.email === user.email ? { ...u, is_blocked: !u.is_blocked } : u,
        ),
      );
    } catch (error) {
      console.error("[Admin Users] Error blocking/unblocking user:", error);
      toast.error("Failed to update user");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage platform users and subscriptions
        </p>
      </motion.div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-card border border-border rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-sm text-muted-foreground mb-2">Total Users</p>
          <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
        </motion.div>
        <motion.div
          className="bg-card border border-border rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-muted-foreground mb-2">Free Users</p>
          <p className="text-3xl font-bold text-info">{stats.freeUsers}</p>
        </motion.div>
        <motion.div
          className="bg-card border border-border rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground mb-2">Pro Users</p>
          <p className="text-3xl font-bold text-success">{stats.proUsers}</p>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <label className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
          />
        </label>
      </motion.div>

      {/* Users Table */}
      <motion.div
        className="bg-card border border-border rounded-lg "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <>
          <div className="w-full overflow-x-auto">

          <div className="min-w-[800px]">

  <table className="w-full ">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Account Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Join Date
                    </th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th> */}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.email}
                      className={`border-b border-border transition-colors ${
                        user.is_blocked
                          ? "bg-red-500/10 hover:bg-red-500/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-foreground font-medium">
                        {user.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold w-fit ${
                            user.user_type === "pro"
                              ? "bg-success/20 text-success"
                              : "bg-info/20 text-info"
                          }`}
                        >
                          {user.user_type === "pro" && <Crown size={12} />}

                          {user.user_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      {/* <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'Active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                          {user.status}
                        </span>
                      </td> */}
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="px-3 py-1 bg-primary/20 text-primary rounded text-xs font-semibold hover:bg-primary/30 transition-colors"
                          >
                            View
                          </button>
                          {/* {user.user_type === "free" && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowProModal(true);
                              }}
                              className="px-3 py-1 bg-success/20 text-success rounded text-xs font-semibold hover:bg-success/30 transition-colors"
                            >
                              Pro
                            </button>
                          )} */}

                          {/* BLOCK BUTTON */}
                          <button
                            onClick={() => handleToggleBlock(user)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                              user.is_blocked
                                ? "bg-success/20 text-success hover:bg-success/30"
                                : "bg-warning/20 text-warning hover:bg-warning/30"
                            }`}
                          >
                            {user.is_blocked ? "Unblock" : "Block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                  </div>
            {/* Pagination */}
            <div className="bg-muted/50 px-4 py-4 flex items-center justify-between border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, total)} of {total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
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

      {/* User Details Modal */}
      <AnimatePresence>
        {showDetailModal && selectedUser && userDetails && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {userDetails.username}
                    {userDetails.user_type === "pro" && (
                      <Crown size={24} className="text-success" />
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userDetails.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                    setUserDetails(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    <p className="text-sm text-foreground">
                      {userDetails.email}
                    </p>
                  </div>
                </div>
                {userDetails.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" />
                      <p className="text-sm text-foreground">
                        {userDetails.phone}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Account Type
                  </p>
                  <p
                    className={`text-sm font-semibold ${userDetails.user_type === "pro" ? "text-success" : "text-info"}`}
                  >
                    {userDetails.user_type.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Join Date
                  </p>
                  <p className="text-sm text-foreground">
                    {userDetails.join_date}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Pro Start Date
                  </p>
                  <p className="text-sm text-foreground">
                    {userDetails.pro_start}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Pro End Date
                  </p>
                  <p className="text-sm text-foreground">
                    {userDetails.pro_end}
                  </p>
                </div>
                {/* <div>
                  <p className="text-xs text-muted-foreground mb-2">Total Trades</p>
                  <p className="text-sm text-foreground font-semibold">{userDetails.total_trades}</p>
                </div> */}
                {/* <div>
                  <p className="text-xs text-muted-foreground mb-2">Win Rate</p>
                  <p className="text-sm text-foreground font-semibold">{userDetails.win_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Total Profit</p>
                  <p className="text-sm text-success font-semibold">₹{userDetails.total_profit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Total Loss</p>
                  <p className="text-sm text-danger font-semibold">₹{userDetails.total_loss.toFixed(2)}</p>
                </div> */}
                {userDetails.trial_period && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Trial Period
                    </p>
                    <p className="text-sm text-foreground">
                      {userDetails.trial_period}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 border-t border-border pt-6">
                {selectedUser?.user_type === "free" && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowProModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-success/20 text-success rounded-lg font-semibold hover:bg-success/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Crown size={18} />
                    Upgrade to Pro
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro Upgrade Modal */}
    </AdminLayout>
  );
}
