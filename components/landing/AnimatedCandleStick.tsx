// 'use client';

// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';

// interface Candle {
//   id: number;
//   x: number;
//   height: number;
//   duration: number;
//   delay: number;
//   direction: 'up' | 'down';
// }

// export default function AnimatedCandlesticks() {
//   const [candles, setCandles] = useState<Candle[]>([]);

//   useEffect(() => {
//     const generateCandles = () => {
//       const newCandles: Candle[] = Array.from({ length: 20 }, (_, i) => {
//         const isUp = Math.random() > 0.5;
//         return {
//           id: i,
//           x: i * 6 + Math.random() * 2,
//           height: Math.random() * 60 + 20,
//           duration: Math.random() * 3 + 2,
//           delay: Math.random() * 0.5,
//           direction: isUp ? 'up' : 'down',
//         };
//       });

//       setCandles(newCandles);
//     };

//     generateCandles();
//   }, []);

//   return (
//     <div className="absolute inset-0 overflow-hidden opacity-20">
//       <svg
//         viewBox="0 0 1200 600"
//         className="w-full h-full"
//         preserveAspectRatio="xMidYMid slice"
//       >
//         <defs>
//           <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
//             <path
//               d="M 60 0 L 0 0 0 60"
//               fill="none"
//               stroke="rgba(37, 99, 235, 0.1)"
//               strokeWidth="0.5"
//             />
//           </pattern>

//           <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop offset="0%" stopColor="rgb(34, 197, 94)" />
//             <stop offset="100%" stopColor="rgb(5, 150, 105)" />
//           </linearGradient>

//           <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop offset="0%" stopColor="rgb(239, 68, 68)" />
//             <stop offset="100%" stopColor="rgb(185, 28, 28)" />
//           </linearGradient>
//         </defs>

//         <rect width="1200" height="600" fill="url(#grid)" />

//         {candles.map((candle) => {
//           const gradientId =
//             candle.direction === 'up' ? 'greenGradient' : 'redGradient';

//           const wickColor =
//             candle.direction === 'up'
//               ? 'rgba(34, 197, 94, 0.3)'
//               : 'rgba(239, 68, 68, 0.3)';

//           return (
//             <motion.g key={candle.id}>
//               <motion.line
//                 x1={candle.x * 60 + 30}
//                 y1="100"
//                 x2={candle.x * 60 + 30}
//                 y2={500}
//                 stroke={wickColor}
//                 strokeWidth="1"
//                 animate={{
//                   y1: [100, 100 - candle.height * 0.5, 100],
//                   y2: [500, 500 - candle.height, 500],
//                 }}
//                 transition={{
//                   duration: candle.duration,
//                   delay: candle.delay,
//                   repeat: Infinity,
//                   ease: 'easeInOut', // ✅ FIXED
//                 }}
//               />

//               <motion.rect
//                 x={candle.x * 60 + 20}
//                 y={400}
//                 width="20"
//                 height={candle.height}
//                 fill={`url(#${gradientId})`}
//                 animate={{
//                   y: [400, 400 - candle.height * 0.7, 400],
//                   height: [
//                     candle.height,
//                     candle.height * 1.2,
//                     candle.height,
//                   ],
//                 }}
//                 transition={{
//                   duration: candle.duration,
//                   delay: candle.delay,
//                   repeat: Infinity,
//                   ease: 'easeInOut', // ✅ FIXED
//                 }}
//                 rx="2"
//               />
//             </motion.g>
//           );
//         })}
//       </svg>

//       <div className="absolute inset-0 from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
//     </div>
//   );
// }