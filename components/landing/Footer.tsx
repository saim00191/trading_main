'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-gray-700/50 py-12 px-4">
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="text-gray-500 text-sm">
          © 2026 Stark Trading Journal. All rights reserved.
        </p>
      </motion.div>
    </footer>
  );
}
