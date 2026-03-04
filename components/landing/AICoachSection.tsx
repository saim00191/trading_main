'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  AlertTriangle,
  BarChart3,
  TrendingDown,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

export default function AICoachSection() {
  const benefits = [
    {
      icon: Brain,
      text: 'Detects behavioral mistakes',
    },
    {
      icon: AlertTriangle,
      text: 'Flags rule violations',
    },
    {
      icon: BarChart3,
      text: 'Weekly performance reports',
    },
    {
      icon: TrendingDown,
      text: 'Identifies weak sessions',
    },
    {
      icon: Lightbulb,
      text: 'Suggests discipline improvements',
    },
  ];

  const benefitVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a0f] to-[#0f0f1e] px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section headline */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your Personal AI Trading Coach
          </h2>
          <p className="text-xl text-gray-400">
            Real-time guidance to improve your trading discipline
          </p>
        </motion.div>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Benefits list */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-[#0f0f1e]/50 border border-gray-700/50 hover:border-blue-500/50 transition-all"
                  variants={benefitVariants}
                  whileHover={{ x: 10, borderColor: 'rgb(37, 99, 235)' }}
                >
                  <Icon className="text-blue-500 flex-shrink-0" size={24} />
                  <span className="text-gray-300 font-medium">{benefit.text}</span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right: Mock dashboard */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#0f0f1e]/80 to-[#1a1a2e]/40 backdrop-blur-xl border border-blue-500/30 overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 blur-3xl" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-400">AI Analysis Live</span>
                </div>

                {/* Mock chart */}
                <div className="space-y-6 mb-8">
                  {/* Weekly stats */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-gray-400 text-sm">Win Rate</span>
                      <span className="text-green-400 font-bold">68%</span>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '68%' }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>

                  {/* Risk metric */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-gray-400 text-sm">Risk/Reward Ratio</span>
                      <span className="text-blue-400 font-bold">1.8:1</span>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '72%' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  See AI in Action
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
