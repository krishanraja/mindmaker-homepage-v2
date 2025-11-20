import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TrustSection from "@/components/TrustSection";
import ProblemSection from "@/components/ProblemSection";
import MindmakerSystemSection from "@/components/MindmakerSystemSection";
import DifferenceSection from "@/components/DifferenceSection";
import WhatThisIsNotSection from "@/components/WhatThisIsNotSection";
import AssessmentPreviewSection from "@/components/AssessmentPreviewSection";
import SimplifiedPathwaysSection from "@/components/SimplifiedPathwaysSection";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";

// Lazy load below-the-fold components
const ContentHubSection = lazy(() => import("@/components/ContentHubSection"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navigation />
      {/* SEO-optimized structure */}
      <header>
        <Hero />
      </header>

      <TrustSection />
      <ProblemSection />
      <MindmakerSystemSection />
      <DifferenceSection />
      <WhatThisIsNotSection />
      <AssessmentPreviewSection />
      <SimplifiedPathwaysSection />
      
      <Suspense fallback={<div className="min-h-[300px]" />}>
        <ContentHubSection />
      </Suspense>

      <section aria-label="Founder Credentials and System">
        <StatsSection />
      </section>

      <section aria-label="Call to Action">
        <CTASection />
      </section>
      
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;
