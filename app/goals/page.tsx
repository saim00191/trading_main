'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ChartContainer } from '@/components/common/ChartContainer';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { Modal } from '@/components/common/Modal';
import { MetricCard } from '@/components/common/MetricCard';
import { Plus, Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { mockGoals } from '@/lib/mock-data';
import { Goal } from '@/lib/types';
import { toast } from 'sonner';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetValue: '',
    currentValue: '',
    type: 'PROFIT',
    period: 'MONTHLY',
  });

  const goalTypes = [
    { value: 'PROFIT', label: 'Profit Target' },
    { value: 'TRADES', label: 'Number of Trades' },
    { value: 'WIN_RATE', label: 'Win Rate %' },
    { value: 'RISK_LIMIT', label: 'Risk Limit %' },
  ];

  const periods = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
  ];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      name: formData.name,
      targetValue: parseFloat(formData.targetValue),
      currentValue: parseFloat(formData.currentValue),
      type: formData.type as any,
      period: formData.period as any,
      dateStart: new Date(),
      dateEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    };

    setGoals([...goals, newGoal]);
    toast.success('Goal added successfully!');
    setFormData({
      name: '',
      targetValue: '',
      currentValue: '',
      type: 'PROFIT',
      period: 'MONTHLY',
    });
    setIsModalOpen(false);
  };

  const getGoalProgress = (goal: Goal) => {
    return (goal.currentValue / goal.targetValue) * 100;
  };

  const getGoalStatus = (goal: Goal) => {
    const progress = getGoalProgress(goal);
    if (progress >= 100) return 'COMPLETED';
    if (progress >= 75) return 'ON_TRACK';
    if (progress >= 50) return 'IN_PROGRESS';
    return 'BEHIND';
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success/10 border-success/30 text-success';
      case 'ON_TRACK':
        return 'bg-info/10 border-info/30 text-info';
      case 'IN_PROGRESS':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'BEHIND':
        return 'bg-danger/10 border-danger/30 text-danger';
      default:
        return 'bg-muted/10 border-muted/30 text-muted-foreground';
    }
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'PROFIT':
        return <TrendingUp size={20} />;
      case 'TRADES':
        return <Target size={20} />;
      case 'WIN_RATE':
        return <AlertCircle size={20} />;
      case 'RISK_LIMIT':
        return <Calendar size={20} />;
      default:
        return <Target size={20} />;
    }
  };

  const getGoalTypeLabel = (type: string) => {
    const found = goalTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const activeGoals = goals.filter((g) => g.status === 'ACTIVE');
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');

  return (
    <DashboardLayout title="Goals & Targets" subtitle="Set and track your trading objectives">
      {/* Overview */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Active Goals" value={activeGoals.length} color="primary" icon={<Target size={20} />} />
        <MetricCard label="Completed Goals" value={completedGoals.length} color="success" icon={<TrendingUp size={20} />} />
        <MetricCard
          label="On Track"
          value={activeGoals.filter((g) => ['ON_TRACK', 'COMPLETED'].includes(getGoalStatus(g))).length}
          color="info"
          icon={<Calendar size={20} />}
        />
      </section>

      {/* Add Goal Button */}
      <section className="mb-8">
        <AnimatedButton
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus size={18} />}
        >
          Add New Goal
        </AnimatedButton>
      </section>

      {/* Active Goals */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">Active Goals</h2>

        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = getGoalProgress(goal);
              const status = getGoalStatus(goal);

              return (
                <div
                  key={goal.id}
                  className={`
                    animate-fade-in rounded-lg border p-6 transition-all duration-300
                    ${getGoalStatusColor(status)}
                  `}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-2xl">{getGoalIcon(goal.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">{getGoalTypeLabel(goal.type)}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getGoalStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-semibold text-foreground">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={`h-full transition-all ${
                          status === 'COMPLETED'
                            ? 'bg-success'
                            : status === 'ON_TRACK'
                            ? 'bg-info'
                            : status === 'IN_PROGRESS'
                            ? 'bg-warning'
                            : 'bg-danger'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {goal.type === 'WIN_RATE' || goal.type === 'RISK_LIMIT' ? `${goal.currentValue.toFixed(1)}%` : goal.currentValue.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {goal.type === 'WIN_RATE' || goal.type === 'RISK_LIMIT' ? `${goal.targetValue.toFixed(1)}%` : goal.targetValue.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Period</p>
                      <p className="mt-1 text-lg font-bold text-foreground">{goal.period}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/50 p-12 text-center">
            <Target size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No active goals yet. Create one to get started!</p>
          </div>
        )}
      </section>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">Completed Goals</h2>

          <div className="space-y-4">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="animate-fade-in rounded-lg border border-success/30 bg-success/5 p-6 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground">{getGoalTypeLabel(goal.type)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-success">✓</div>
                    <p className="text-sm text-muted-foreground">
                      {goal.type === 'WIN_RATE' || goal.type === 'RISK_LIMIT'
                        ? `${goal.currentValue.toFixed(1)}%`
                        : goal.currentValue.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Goal">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Goal Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Monthly Profit Target"
              required
              className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Goal Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {goalTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Target Value *</label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                placeholder="1000"
                step="0.01"
                required
                className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current Value *</label>
              <input
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                placeholder="500"
                step="0.01"
                required
                className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Period *</label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <AnimatedButton type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </AnimatedButton>
            <AnimatedButton type="submit" variant="primary">
              Add Goal
            </AnimatedButton>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
