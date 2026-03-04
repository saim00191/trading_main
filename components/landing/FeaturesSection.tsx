'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  BarChart3,
  Calculator,
  TrendingUp,
  Sparkles,
  Shield,
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: 'Trade Journal',
      description: 'Document every trade with complete details and context',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Deep dive into your trading metrics and statistics',
    },
    {
      icon: Calculator,
      title: 'Risk Calculator',
      description: 'Precise position sizing and risk management tools',
    },
    {
      icon: TrendingUp,
      title: 'Growth Simulation',
      description: 'Visualize your potential growth with different strategies',
    },
    {
      icon: Sparkles,
      title: 'AI Coach',
      description: 'Get personalized feedback and improvement suggestions',
    },
    {
      icon: Shield,
      title: 'Protocol System',
      description: 'Build and monitor your trading rules and protocols',
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-[#0a0a0f] px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section headline */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to Trade With Structure
          </h2>
          <p className="text-xl text-gray-400">
            Comprehensive tools built for professional traders
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="p-8 rounded-xl bg-gradient-to-br from-[#0f0f1e]/60 to-[#1a1a2e]/40 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 transition-all group cursor-pointer"
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 40px rgba(37, 99, 235, 0.1)',
                  borderColor: 'rgb(37, 99, 235)',
                }}
              >
                <Icon className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
