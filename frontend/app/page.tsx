'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { PlatformShowcase } from '@/components/landing/PlatformShowcase';
import { PracticeAreas } from '@/components/landing/PracticeAreas';
import { RoiCalculator } from '@/components/landing/RoiCalculator';
import { AuthoritySection } from '@/components/landing/AuthoritySection';
import { LeadContactForm } from '@/components/landing/LeadContactForm';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function DavinoNevesLandingPage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <LandingNavbar />

      {/* Main Content Flow */}
      <main id="main-content" className="relative">
        {/* 1. Hero with Authority Badges, Display Headlines and Trust Tickers */}
        <LandingHero />

        {/* 2. Live Interactive Platform Showcase (DataJud, Gemini AI, Prazos Fatais, Controladoria) */}
        <PlatformShowcase />

        {/* 3. Core Practice Areas (Corporate, Tax, M&A, LGPD, Asset Recovery, Legal Ops) */}
        <PracticeAreas />

        {/* 4. Interactive Legal Efficiency & ROI Simulator */}
        <RoiCalculator />

        {/* 5. Institutional Authority, Security Standards & Testimonials */}
        <AuthoritySection />

        {/* 6. High-Conversion Strategic Diagnosis Contact Form */}
        <LeadContactForm />
      </main>

      {/* Institutional Footer */}
      <LandingFooter />
    </div>
  );
}
