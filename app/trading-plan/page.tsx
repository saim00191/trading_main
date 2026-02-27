'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ChartContainer } from '@/components/common/ChartContainer';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { Modal } from '@/components/common/Modal';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { mockTradingRules } from '@/lib/mock-data';
import { TradingRule } from '@/lib/types';
import { toast } from 'sonner';

export default function TradingPlanPage() {
  const [rules, setRules] = useState<TradingRule[]>(mockTradingRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TradingRule | null>(null);
  const [formData, setFormData] = useState({
    category: 'PERSONAL',
    title: '',
    description: '',
  });

  const categories = ['PERSONAL', 'RISK', 'STRATEGY', 'PSYCHOLOGY'];

  const categoryColors = {
    PERSONAL: 'bg-blue/10 border-blue/30 text-blue',
    RISK: 'bg-danger/10 border-danger/30 text-danger',
    STRATEGY: 'bg-primary/10 border-primary/30 text-primary',
    PSYCHOLOGY: 'bg-warning/10 border-warning/30 text-warning',
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRule) {
      // Update existing rule
      setRules(
        rules.map((r) =>
          r.id === editingRule.id
            ? {
                ...r,
                category: formData.category as any,
                title: formData.title,
                description: formData.description,
              }
            : r
        )
      );
      toast.success('Rule updated!');
    } else {
      // Add new rule
      const newRule: TradingRule = {
        id: `rule-${Date.now()}`,
        category: formData.category as any,
        title: formData.title,
        description: formData.description,
        isActive: true,
        breaks: 0,
      };
      setRules([...rules, newRule]);
      toast.success('Rule added!');
    }

    setFormData({ category: 'PERSONAL', title: '', description: '' });
    setEditingRule(null);
    setIsModalOpen(false);
  };

  const handleEditRule = (rule: TradingRule) => {
    setEditingRule(rule);
    setFormData({
      category: rule.category,
      title: rule.title,
      description: rule.description,
    });
    setIsModalOpen(true);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    toast.success('Rule deleted!');
  };

  const handleToggleRule = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const breakPercentage = (breaks: number, index: number) => {
    return rules.length > 0 ? ((breaks / (rules.length * 2)) * 100).toFixed(0) : '0';
  };

  const groupedRules = {
    PERSONAL: rules.filter((r) => r.category === 'PERSONAL'),
    RISK: rules.filter((r) => r.category === 'RISK'),
    STRATEGY: rules.filter((r) => r.category === 'STRATEGY'),
    PSYCHOLOGY: rules.filter((r) => r.category === 'PSYCHOLOGY'),
  };

  return (
    <DashboardLayout title="Trading Plan & Protocol" subtitle="Define and manage your trading rules">
      {/* Overview Statistics */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
          <p className="mt-2 text-3xl font-bold text-primary">{rules.length}</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
          <p className="mt-2 text-3xl font-bold text-success">{rules.filter((r) => r.isActive).length}</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Violations</p>
          <p className="mt-2 text-3xl font-bold text-warning">{rules.reduce((sum, r) => sum + r.breaks, 0)}</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
          <p className="mt-2 text-3xl font-bold text-info">
            {rules.length > 0 ? (((rules.length - rules.filter((r) => r.breaks > 0).length) / rules.length) * 100).toFixed(0) : '0'}%
          </p>
        </div>
      </section>

      {/* Add Rule Button */}
      <section className="mb-8">
        <AnimatedButton
          variant="primary"
          onClick={() => {
            setEditingRule(null);
            setFormData({ category: 'PERSONAL', title: '', description: '' });
            setIsModalOpen(true);
          }}
          icon={<Plus size={18} />}
        >
          Add New Rule
        </AnimatedButton>
      </section>

      {/* Rules by Category */}
      {categories.map((category) => (
        <section key={category} className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-foreground capitalize">{category.toLowerCase()} Rules</h2>

          {groupedRules[category as keyof typeof groupedRules].length > 0 ? (
            <div className="space-y-3">
              {groupedRules[category as keyof typeof groupedRules].map((rule) => (
                <div
                  key={rule.id}
                  className={`
                    animate-fade-in rounded-lg border p-4 transition-all duration-300
                    ${
                      rule.isActive
                        ? `${categoryColors[rule.category]}`
                        : 'border-muted/50 bg-muted/5'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{rule.title}</h3>
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`
                            inline-block rounded-full px-2 py-1 text-xs font-semibold
                            ${rule.isActive ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted-foreground'}
                          `}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{rule.description}</p>

                      {/* Violation indicator */}
                      {rule.breaks > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-warning transition-all"
                              style={{
                                width: `${Math.min(parseFloat(breakPercentage(rule.breaks, 0)), 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-warning">{rule.breaks} violations</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="rounded-lg p-2 transition-colors hover:bg-muted hover:text-foreground"
                        title="Edit rule"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="rounded-lg p-2 transition-colors hover:bg-danger/10 hover:text-danger"
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
            <div className="rounded-lg border border-dashed border-border/50 p-6 text-center">
              <p className="text-muted-foreground">No {category.toLowerCase()} rules yet</p>
            </div>
          )}
        </section>
      ))}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        title={editingRule ? 'Edit Rule' : 'Add New Rule'}
      >
        <form onSubmit={handleAddRule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="PERSONAL">Personal</option>
              <option value="RISK">Risk Management</option>
              <option value="STRATEGY">Strategy</option>
              <option value="PSYCHOLOGY">Psychology</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Rule Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Max 2% Risk Per Trade"
              required
              className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the rule and why it matters..."
              required
              rows={3}
              className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <AnimatedButton
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingRule(null);
              }}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton type="submit" variant="primary">
              {editingRule ? 'Update Rule' : 'Add Rule'}
            </AnimatedButton>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
