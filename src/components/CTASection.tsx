import { Button } from "@/components/ui/button";
import { ArrowUp, Mail } from "lucide-react";

const CTASection = () => {
  const scrollToOutcomes = () => {
    const outcomesSection = document.getElementById('outcomes');
    if (outcomesSection) {
      outcomesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="section-padding relative overflow-hidden bg-brand-gradient">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_70%)]" />
      </div>

      <div className="container-width relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6">
              ⚡ Limited Availability • Q1 2025 Cohorts Filling Fast
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
              Don't Let Your Competition<br />
              <span className="text-white/80">Leave You Behind</span>
            </h2>
          </div>
          
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-sm">
              <p className="text-white font-medium text-lg leading-relaxed">
                "Businesses that master AI literacy at each level will transform rapidly.<br />
                Those that don't will be forced to fight the ones that do."
              </p>
              <p className="text-white/70 font-semibold text-base mt-4">— Krish</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-8 max-w-md mx-auto">
            <Button asChild className="bg-gradient-to-r from-white to-white/95 text-primary hover:from-white/95 hover:to-white font-bold px-8 py-5 text-lg group w-full shadow-[0_8px_30px_rgb(255,255,255,0.12)] transform hover:scale-[1.02] hover:shadow-[0_12px_40px_rgb(255,255,255,0.16)] transition-all duration-300 rounded-xl">
              <a href="https://calendly.com/krish-raja/mindmaker-meeting" target="_blank" rel="noopener noreferrer">
                <Mail className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Secure Your Competitive Edge
              </a>
            </Button>
            
            <Button 
              onClick={scrollToOutcomes}
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-medium px-8 py-4 text-base group w-full backdrop-blur-sm rounded-xl transition-all duration-300"
            >
              <ArrowUp className="mr-2 h-4 w-4 group-hover:-translate-y-1 transition-transform duration-200" />
              Or Choose a Pathway Above
            </Button>
          </div>
          
          <div className="text-center border-t border-white/20 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">16+</div>
                <div className="text-sm text-white/80">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-white/80">Leaders Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$50M+</div>
                <div className="text-sm text-white/80">Value Created</div>
              </div>
            </div>
            <p className="text-base text-white/80">
              Join industry leaders who've already secured their competitive edge
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;