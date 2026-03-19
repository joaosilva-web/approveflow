"use client";

import { LangProvider } from "@/lib/lang-context";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/features/marketing/components/Hero";
import HowItWorks from "@/features/marketing/components/HowItWorks";
import Features from "@/features/marketing/components/Features";
import Pricing from "@/features/marketing/components/Pricing";
import CTA from "@/features/marketing/components/CTA";

export default function LandingPage() {
  return (
    <LangProvider>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </LangProvider>
  );
}
