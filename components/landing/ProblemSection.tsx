'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  TrendingDown,
  Zap,
  Eye,
  RotateCcw,
} from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: AlertCircle,
      text: 'No structured tracking',
    },
    {
      icon: TrendingDown,
      text: 'Emotional decision making',
    },
    {
      icon: Zap,
      text: 'Inconsistent risk management',
    },
    {
      icon: Eye,
      text: 'No performance clarity',
    },
    {
      icon: RotateCcw,
      text: 'Overtrading behavior',
    },
  ];

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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-[#0a0a0f] px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section headline */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Most Traders Stay Inconsistent
          </h2>
          <p className="text-xl text-gray-400">
            Without a system, you're destined to repeat the same mistakes
          </p>
        </motion.div>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Description */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-300 text-lg leading-relaxed">
              Most traders lack the discipline and structure needed to succeed. They trade on emotion,
              skip risk management, and never analyze their performance systematically.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              The result? Consistent losses, missed opportunities, and a cycle of frustration.
            </p>
          </motion.div>

          {/* Right: Problems list */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-[#0f0f1e]/50 border border-gray-700/50 hover:border-blue-500/50 transition-all"
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                >
                  <Icon className="text-blue-500 flex-shrink-0" size={24} />
                  <span className="text-gray-300 font-medium">{problem.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
