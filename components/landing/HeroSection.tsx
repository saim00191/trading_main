'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Play } from 'lucide-react';
// import AnimatedCandlesticks from './AnimatedCandlesticks';

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Animated background */}
      {/* <AnimatedCandlesticks /> */}

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main headline */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          // variants={itemVariants}
        >
          Master Your Trading
          <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Performance With Precision
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-xl md:text-2xl text-gray-400 mb-4"
          // variants={itemVariants}
        >
          Track. Analyze. Improve. Grow.
        </motion.p>

        {/* Supporting line */}
        <motion.p
          className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto"
          // variants={itemVariants}
        >
          Built for serious traders who demand structure and consistency.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          // variants={itemVariants}
        >
          {/* Primary button */}
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Free Trial
          </motion.button>

          {/* Secondary button */}
          <motion.button
            className="px-8 py-4 border-2 border-blue-500 text-blue-400 font-bold rounded-lg hover:bg-blue-500/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Access Terminal
          </motion.button>

          {/* Tertiary button */}
          <motion.button
            className="px-8 py-4 text-gray-400 font-bold rounded-lg hover:text-white transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={18} />
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="flex justify-center"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={32} className="text-blue-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
