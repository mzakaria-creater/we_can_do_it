/**
 * Gold Palette Usage Examples for Press2pay
 * 
 * This file demonstrates how to use the new gold color palette
 * in your React components with Tailwind CSS
 */

import React from 'react';
import { goldColors, goldUtilities } from '../../styles/gold-palette';

// ============================================
// EXAMPLE 1: Using Gold Colors Directly
// ============================================

export const GoldButtonExample = () => {
  return (
    <button 
      className="px-6 py-3 rounded-xl font-bold text-[#0B0F14] bg-gradient-to-r from-[#F5D061] via-[#FFD700] to-[#E5C158] hover:shadow-[0_0_30px_rgba(245,208,97,0.5)] transition-all active:scale-95"
    >
      Premium Action
    </button>
  );
};

// ============================================
// EXAMPLE 2: Using Gradient Collections
// ============================================

export const GoldCardExample = () => {
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${goldColors.gradients.luxury} shadow-xl`}>
      <h3 className="text-[#0B0F14] font-bold text-xl mb-2">Luxury Card</h3>
      <p className="text-[#0B0F14]/80">Beautiful gold gradient background</p>
    </div>
  );
};

// ============================================
// EXAMPLE 3: Using Gold Borders
// ============================================

export const GoldBorderCard = () => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-2xl border-2 border-[#F5D061]/30 hover:border-[#F5D061]/50 transition-all">
      <h3 className="text-[#F5D061] font-bold text-xl mb-2">Bordered Card</h3>
      <p className="text-white/70">Elegant gold border effect</p>
    </div>
  );
};

// ============================================
// EXAMPLE 4: Using Gold Text
// ============================================

export const GoldTextExample = () => {
  return (
    <div className="space-y-4">
      {/* Solid gold text */}
      <h1 className="text-4xl font-black text-[#F5D061]">
        Press2pay
      </h1>
      
      {/* Gradient gold text */}
      <h2 className="text-3xl font-black bg-gradient-to-r from-[#F5D061] via-[#FFD700] to-[#FFED4E] bg-clip-text text-transparent">
        Premium Payment Gateway
      </h2>
      
      {/* Animated shimmer text */}
      <h3 className="gold-text text-2xl font-bold">
        Luxury Experience
      </h3>
    </div>
  );
};

// ============================================
// EXAMPLE 5: Using Gold Glow Effects
// ============================================

export const GoldGlowCard = () => {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-[#F5D061]/30 shadow-[0_0_30px_rgba(245,208,97,0.4),0_0_60px_rgba(245,208,97,0.2)] hover:shadow-[0_0_40px_rgba(245,208,97,0.6),0_0_80px_rgba(245,208,97,0.3)] transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#D4AF37] flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="text-[#F5D061] font-bold text-xl">Glowing Card</h3>
      </div>
      <p className="text-white/70">Beautiful gold glow effect on hover</p>
    </div>
  );
};

// ============================================
// EXAMPLE 6: Using Gold Backgrounds
// ============================================

export const GoldBackgroundSection = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl">
      {/* Subtle gold background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5D061]/5 to-transparent" />
      
      {/* Radial gold glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(245,208,97,0.15)_0%,transparent_70%)]" />
      
      <div className="relative z-10 p-12">
        <h2 className="text-3xl font-black text-[#F5D061] mb-4">
          Premium Section
        </h2>
        <p className="text-white/80 text-lg">
          Beautiful gold background with radial glow effect
        </p>
      </div>
    </section>
  );
};

// ============================================
// EXAMPLE 7: Gold Dashboard Stats Card
// ============================================

export const GoldStatsCard = () => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-[#F5D061]/20 rounded-2xl p-6 hover:border-[#F5D061]/40 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5D061] to-[#D4AF37] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(245,208,97,0.4)] transition-all">
          <svg className="w-6 h-6 text-[#0B0F14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-500">
          +12%
        </span>
      </div>
      
      <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
        Total Revenue
      </h3>
      
      <p className="text-3xl font-black text-white group-hover:text-[#F5D061] transition-colors">
        $124,500
      </p>
      
      <div className="mt-4 w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#F5D061] to-[#FFD700] w-3/4 rounded-full" />
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 8: Gold Button Variants
// ============================================

export const GoldButtonVariants = () => {
  return (
    <div className="space-y-4">
      {/* Primary Gold Button */}
      <button className="px-8 py-3 rounded-xl font-black bg-gradient-to-r from-[#F5D061] to-[#FFD700] text-[#0B0F14] shadow-xl shadow-[#F5D061]/20 hover:shadow-[#F5D061]/40 hover:scale-105 transition-all active:scale-95">
        Primary Action
      </button>
      
      {/* Outline Gold Button */}
      <button className="px-8 py-3 rounded-xl font-black bg-transparent border-2 border-[#F5D061] text-[#F5D061] hover:bg-[#F5D061] hover:text-[#0B0F14] transition-all active:scale-95">
        Outline Action
      </button>
      
      {/* Ghost Gold Button */}
      <button className="px-8 py-3 rounded-xl font-black bg-[#F5D061]/10 text-[#F5D061] hover:bg-[#F5D061]/20 transition-all active:scale-95">
        Ghost Action
      </button>
      
      {/* Glossy Gold Button (using utility class) */}
      <button className="glossy-button px-8 py-3 rounded-xl font-black text-[#0B0F14] active:scale-95">
        Glossy Action
      </button>
    </div>
  );
};

// ============================================
// EXAMPLE 9: Gold Transaction Row
// ============================================

export const GoldTransactionRow = () => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-[#F5D061]/30 transition-all group cursor-pointer">
      <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center group-hover:bg-[#F5D061]/10 transition-colors border border-slate-700/50">
        <svg className="w-6 h-6 text-slate-400 group-hover:text-[#F5D061] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-bold text-white group-hover:text-[#F5D061] transition-colors">
          Payment Received
        </p>
        <p className="text-xs text-slate-500 font-medium">
          Merchant ABC • 2h ago
        </p>
      </div>
      
      <div className="text-right">
        <p className="text-sm font-black text-green-500">
          +$1,250
        </p>
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
          EGP
        </p>
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 10: Gold Badge/Pill Components
// ============================================

export const GoldBadges = () => {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Gold status badge */}
      <span className="px-4 py-1.5 rounded-full bg-[#F5D061]/10 text-[#F5D061] text-xs font-bold border border-[#F5D061]/30">
        Premium
      </span>
      
      {/* Gold gradient badge */}
      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#F5D061] to-[#FFD700] text-[#0B0F14] text-xs font-bold">
        Featured
      </span>
      
      {/* Gold outline badge */}
      <span className="px-4 py-1.5 rounded-full bg-transparent border-2 border-[#F5D061] text-[#F5D061] text-xs font-bold">
        VIP
      </span>
      
      {/* Gold glow badge */}
      <span className="px-4 py-1.5 rounded-full bg-[#F5D061] text-[#0B0F14] text-xs font-bold shadow-[0_0_20px_rgba(245,208,97,0.5)]">
        New
      </span>
    </div>
  );
};

// ============================================
// Complete Usage Guide
// ============================================

/**
 * HOW TO USE THE GOLD PALETTE IN YOUR COMPONENTS:
 * 
 * 1. DIRECT COLOR VALUES:
 *    - Use hex codes directly in Tailwind classes: text-[#F5D061]
 *    - Or import from goldColors: goldColors.gold[500]
 * 
 * 2. GRADIENTS:
 *    - Use predefined gradients: bg-gradient-to-r ${goldColors.gradients.luxury}
 *    - Or create custom: from-[#F5D061] to-[#FFD700]
 * 
 * 3. OPACITY:
 *    - Add /XX for opacity: bg-[#F5D061]/10 (10% opacity)
 *    - Or use predefined: goldColors.opacity.gold10
 * 
 * 4. SHADOWS & GLOWS:
 *    - Use shadow utilities: shadow-[0_0_30px_rgba(245,208,97,0.5)]
 *    - Or use CSS classes: .gold-glow
 * 
 * 5. BORDERS:
 *    - Add borders with opacity: border-[#F5D061]/30
 *    - Or use predefined: goldColors.borders.light
 * 
 * 6. CSS UTILITY CLASSES:
 *    - .gold-gradient - Animated shimmer gradient
 *    - .gold-text - Gradient text with shimmer
 *    - .gold-glow - Glowing effect
 *    - .glossy-button - Premium glossy button
 *    - .glossy-card - Premium card with effects
 * 
 * 7. CSS VARIABLES (from theme.css):
 *    - var(--gold-500) - Primary gold
 *    - var(--gold-700) - Dark gold
 *    - var(--primary) - Theme primary (gold)
 */

export default {
  GoldButtonExample,
  GoldCardExample,
  GoldBorderCard,
  GoldTextExample,
  GoldGlowCard,
  GoldBackgroundSection,
  GoldStatsCard,
  GoldButtonVariants,
  GoldTransactionRow,
  GoldBadges,
};
