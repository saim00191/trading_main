'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RootState } from '@/store/store';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import HowItWorksSection from '@/components/landing/HowItWorks';
import FeaturesSection from '@/components/landing/FeaturesSection';
import AICoachSection from '@/components/landing/AICoachSection';
import SecuritySection from '@/components/landing/SecuritySection';
import TestimonialsSection from '@/components/landing/TestiomonialsSection';
import FinalCTASection from '@/components/landing/FinalCTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <div className="bg-[#0a0a0f]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Navigation bar */}
      <nav className="relative z-10 max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <motion.h1
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Stark Trading Journal
        </motion.h1>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Go to App
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500  to-blue-600 cursor-pointer text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AICoachSection />
        <SecuritySection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}
