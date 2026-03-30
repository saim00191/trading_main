'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, ChevronDown } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { Navigation } from '@/components/common/Navigation';
import { supabase } from '@/lib/supabaseClient';


type RuleCategory = 'PERSONAL' | 'RISK' | 'STRATEGY' | 'PSYCHOLOGY';
type FilterStatus = 'active' | 'closed' | 'all';

interface TradingRule {
  id: string;
  user_email: string;
  category: RuleCategory;
  title: string;
  description: string;
  is_active: boolean;
  breaks: number;
  created_at: string;
}

interface RuleFormData {
  category: RuleCategory;
  title: string;
  description: string;
  is_active: boolean;
}

export default function TradingPlanPage() {
    const loggedInUserEmail = useSelector(selectUserEmail);
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; ruleId: string | null }>({
    isOpen: false,
    ruleId: null,
  });
  const [formData, setFormData] = useState<RuleFormData>({
    category: 'PERSONAL',
    title: '',
    description: '',
    is_active: true,
  });
  const [editingRule, setEditingRule] = useState<TradingRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const categories: RuleCategory[] = ['PERSONAL', 'RISK', 'STRATEGY', 'PSYCHOLOGY'];

  const categoryColors = {
    PERSONAL: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    RISK: 'bg-red-500/10 border-red-500/30 text-red-400',
    STRATEGY: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    PSYCHOLOGY: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  };

  useEffect(() => {
    if (!loggedInUserEmail) return; 
    const fetchUserAndRules = async () => {
      console.log("Fetching Data for", loggedInUserEmail);
      try {
        // Get current user email
        const { data: { user } } = await supabase.auth.getUser();
      

        // Fetch rules from Supabase
        const { data, error: fetchError } = await supabase
          .from('trading_rules')
          .select('*')
          .eq('user_email', loggedInUserEmail)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('[v0] Error fetching rules:', fetchError);
          setError('Failed to load trading rules');
        } else {
          setRules((data || []) as TradingRule[]);
        }
      } catch (err) {
        console.error('[v0] Error in fetchUserAndRules:', err);
        setError('An error occurred while loading rules');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRules();
  }, []);

const handleAddRule = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    if (editingRule) {
      // ✅ Optimistic UI update (instant)
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? {
                ...r,
                category: formData.category,
                title: formData.title,
                description: formData.description,
                is_active: formData.is_active,
              }
            : r
        )
      );

      // ✅ Backend update (faster - only ID filter)
      const { error } = await supabase
        .from('trading_rules')
        .update({
          category: formData.category,
          title: formData.title,
          description: formData.description,
          is_active: formData.is_active,
        })
        .eq('id', editingRule.id);

      if (error) {
        console.error('[v0] Error updating rule:', error);
        setError('Failed to update rule');
      }
    } else {
      // ✅ Add new rule
      const { data, error: insertError } = await supabase
        .from('trading_rules')
        .insert([
          {
            user_email: loggedInUserEmail,
            category: formData.category,
            title: formData.title,
            description: formData.description,
            is_active: true,
            breaks: 0,
          },
        ])
        .select();

      if (insertError) {
        console.error('[v0] Error inserting rule:', insertError);
        setError('Failed to add rule');
      } else {
        // ✅ Instant add to UI
        setRules((prev) => [...(data as TradingRule[]), ...prev]);
      }
    }

    // ✅ Reset form
    setFormData({
      category: 'PERSONAL',
      title: '',
      description: '',
      is_active: true,
    });

    setEditingRule(null);
    setIsModalOpen(false);
  } catch (err) {
    console.error('[v0] Error in handleAddRule:', err);
    setError('An error occurred while saving the rule');
  } finally {
    setSubmitting(false);
  }
};

  const handleEditRule = (rule: TradingRule) => {
    setEditingRule(rule);
    setFormData({
      category: rule.category,
      title: rule.title,
      description: rule.description,
      is_active: rule.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDeleteRule = async () => {
    if (!deleteConfirmModal.ruleId) return;

    try {
      const { error: deleteError } = await supabase
        .from('trading_rules')
        .delete()
        .eq('id', deleteConfirmModal.ruleId)
        .eq('user_email', loggedInUserEmail);

      if (deleteError) {
        console.error('[v0] Error deleting rule:', deleteError);
        setError('Failed to delete rule');
      } else {
        setRules(rules.filter((r) => r.id !== deleteConfirmModal.ruleId));
        setDeleteConfirmModal({ isOpen: false, ruleId: null });
      }
    } catch (err) {
      console.error('[v0] Error in handleDeleteRule:', err);
      setError('An error occurred while deleting the rule');
    }
  };

  const handleToggleRule = async (id: string, currentState: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('trading_rules')
        .update({ is_active: !currentState })
        .eq('id', id)
        .eq('user_email', loggedInUserEmail);

      if (updateError) {
        console.error('[v0] Error toggling rule:', updateError);
        setError('Failed to toggle rule');
      } else {
        setRules(
          rules.map((r) => (r.id === id ? { ...r, is_active: !currentState } : r))
        );
      }
    } catch (err) {
      console.error('[v0] Error in handleToggleRule:', err);
      setError('An error occurred while toggling the rule');
    }
  };

  const handleIncrementBreaks = async (id: string, currentBreaks: number) => {
    try {
      const { error: updateError } = await supabase
        .from('trading_rules')
        .update({ breaks: currentBreaks + 1 })
        .eq('id', id)
        .eq('user_email', loggedInUserEmail);

      if (updateError) {
        console.error('[v0] Error incrementing breaks:', updateError);
        setError('Failed to increment breaks');
      } else {
        setRules(
          rules.map((r) => (r.id === id ? { ...r, breaks: currentBreaks + 1 } : r))
        );
      }
    } catch (err) {
      console.error('[v0] Error in handleIncrementBreaks:', err);
      setError('An error occurred while updating breaks');
    }
  };

  const getFilteredRules = () => {
    return rules.filter((r) => {
      if (filterStatus === 'active') return r.is_active;
      if (filterStatus === 'closed') return !r.is_active;
      return true;
    });
  };

  const filteredRules = getFilteredRules();

  const groupedRules = {
    PERSONAL: filteredRules.filter((r) => r.category === 'PERSONAL'),
    RISK: filteredRules.filter((r) => r.category === 'RISK'),
    STRATEGY: filteredRules.filter((r) => r.category === 'STRATEGY'),
    PSYCHOLOGY: filteredRules.filter((r) => r.category === 'PSYCHOLOGY'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading trading rules...</p>
        </div>
      </div>
    );
  }
   const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <main className="min-h-screen bg-gray-950">
       <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Plan & Protocol</h1>
          <p className="text-gray-400">Define and manage your trading rules</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Overview Statistics */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm font-medium text-gray-400">Total Rules</p>
            <p className="mt-2 text-3xl font-bold text-white">{rules.length}</p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm font-medium text-gray-400">Active Rules</p>
            <p className="mt-2 text-3xl font-bold text-green-400">{rules.filter((r) => r.is_active).length}</p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm font-medium text-gray-400">Total Violations</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">{rules.reduce((sum, r) => sum + r.breaks, 0)}</p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm font-medium text-gray-400">Compliance Rate</p>
            <p className="mt-2 text-3xl font-bold text-blue-400">
              {rules.length > 0 ? (((rules.length - rules.filter((r) => r.breaks > 0).length) / rules.length) * 100).toFixed(0) : '0'}%
            </p>
          </div>
        </section>

        {/* Add Rule Button and Filter Dropdown */}
        <section className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => {
              setEditingRule(null);
              setFormData({ category: 'PERSONAL', title: '', description: '', is_active: true });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add New Rule
          </button>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700"
            >
              {filterStatus === 'active' ? 'Active Rules' : filterStatus === 'closed' ? 'Closed Rules' : 'All Rules'}
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${filterDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {filterDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-40"
                >
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors first:rounded-t-lg ${
                      filterStatus === 'all' ? 'text-blue-400 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    All Rules
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('active');
                      setFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors border-t border-gray-700 ${
                      filterStatus === 'active' ? 'text-blue-400 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    Active Rules
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('closed');
                      setFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors border-t border-gray-700 last:rounded-b-lg ${
                      filterStatus === 'closed' ? 'text-blue-400 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    Closed Rules
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Rules by Category */}
        {categories.map((category) => (
          <section key={category} className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-white capitalize">{category.toLowerCase()} Rules</h2>

            {groupedRules[category].length > 0 ? (
              <div className="space-y-3">
                {groupedRules[category].map((rule) => (
                  <div
                    key={rule.id}
                    className={`
                      rounded-lg border p-4 transition-all duration-300
                      ${
                        rule.is_active
                          ? `${categoryColors[rule.category]}`
                          : 'border-gray-700 bg-gray-900/50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white">{rule.title}</h3>
                          <button
                            onClick={() => handleToggleRule(rule.id, rule.is_active)}
                            className={`
                              inline-block rounded-full px-2 py-1 text-xs font-semibold
                              ${rule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/20 text-gray-400'}
                            `}
                          >
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{formatDateTime(rule.created_at)}</p>
                        <p className="mt-2 text-sm text-gray-300">{rule.description}</p>

                        {/* Violation indicator */}
                        {rule.breaks > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-700">
                              <div
                                className="h-full bg-yellow-500 transition-all"
                                style={{
                                  width: `${Math.min((rule.breaks / 10) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-yellow-400">{rule.breaks} violations</span>
                            <button
                              onClick={() => handleIncrementBreaks(rule.id, rule.breaks)}
                              className="ml-2 text-xs text-gray-400 hover:text-gray-300"
                              title="Increment violation count"
                            >
                              +1
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="rounded-lg p-2 transition-colors hover:bg-gray-700 hover:text-white text-gray-400"
                          title="Edit rule"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmModal({ isOpen: true, ruleId: rule.id })}
                          className="rounded-lg p-2 transition-colors hover:bg-red-500/10 hover:text-red-400 text-gray-400"
                          title="Delete rule"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-700 p-6 text-center">
                <p className="text-gray-500">No {category.toLowerCase()} rules yet</p>
              </div>
            )}
          </section>
        ))}

        {/* Add/Edit Rule Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setIsModalOpen(false);
                setEditingRule(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-white mb-4">
                  {editingRule ? 'Edit Rule' : 'Add New Rule'}
                </h2>

                <form onSubmit={handleAddRule} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as RuleCategory })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-600 focus:outline-none transition-colors"
                    >
                      <option value="PERSONAL">Personal</option>
                      <option value="RISK">Risk Management</option>
                      <option value="STRATEGY">Strategy</option>
                      <option value="PSYCHOLOGY">Psychology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rule Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Max 2% Risk Per Trade"
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Explain the rule and why it matters..."
                      required
                      rows={3}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
                    <select
                      value={formData.is_active ? 'active' : 'closed'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-600 focus:outline-none transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingRule(null);
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium transition-colors"
                    >
                      {submitting ? 'Saving...' : editingRule ? 'Update Rule' : 'Add Rule'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteConfirmModal({ isOpen: false, ruleId: null })}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-900 border border-gray-800 rounded-lg max-w-sm w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 mx-auto">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 text-center">Delete Rule?</h2>
                <p className="text-gray-400 text-center mb-6">
                  Are you sure you want to delete this rule? This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirmModal({ isOpen: false, ruleId: null })}
                    className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteRule}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
