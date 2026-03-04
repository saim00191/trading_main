'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'This platform transformed my trading completely. The journal structure keeps me accountable and the AI insights are incredibly valuable.',
      name: 'Alex Chen',
      role: 'Forex Trader',
      rating: 5,
    },
    {
      quote: 'Finally, a tool built for serious traders. The risk calculator and analytics have helped me 3x my profitability in 3 months.',
      name: 'Sarah Johnson',
      role: 'Crypto Trader',
      rating: 5,
    },
    {
      quote: 'The discipline this platform enforces is game-changing. Every trade is documented, every metric is tracked. No more guessing.',
      name: 'Marcus Williams',
      role: 'Options Trader',
      rating: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
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
            Trusted by Serious Traders
          </h2>
          <p className="text-xl text-gray-400">
            Real results from real traders
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="p-8 rounded-xl bg-[#0f0f1e]/80 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 transition-all flex flex-col justify-between"
              variants={cardVariants}
              whileHover={{
                y: -8,
                borderColor: 'rgb(37, 99, 235)',
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 mb-6 flex-grow italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div>
                <p className="text-white font-bold">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
