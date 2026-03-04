'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Cloud, Database, Shield } from 'lucide-react';

export default function SecuritySection() {
  const securityPoints = [
    {
      icon: Lock,
      title: 'Encrypted Authentication',
      description: 'Enterprise-grade encryption for all authentication',
    },
    {
      icon: Cloud,
      title: 'Secure Cloud Storage',
      description: 'Your data stored on secure, redundant servers',
    },
    {
      icon: Database,
      title: 'Private Trade Records',
      description: 'Only you can access your trading history',
    },
    {
      icon: Shield,
      title: 'Protected Sessions',
      description: 'Automatic session timeouts and security checks',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
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
            Your Data. Fully Secure.
          </h2>
          <p className="text-xl text-gray-400">
            Bank-level security for your trading information
          </p>
        </motion.div>

        {/* Security points grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {securityPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={index}
                className="p-8 rounded-xl bg-gradient-to-br from-[#0f0f1e]/60 to-[#1a1a2e]/40 backdrop-blur-xl border border-gray-700/50 hover:border-green-500/50 transition-all"
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  borderColor: 'rgb(16, 185, 129)',
                }}
              >
                <Icon className="text-green-500 mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">{point.title}</h3>
                <p className="text-gray-400">{point.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
