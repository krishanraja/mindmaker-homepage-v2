import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, User, Lightbulb, GraduationCap } from "lucide-react";

const PathwaysSection = () => {
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6 text-foreground">Choose Your AI Literacy Pathway</h2>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-4xl mx-auto">
            End-to-end modular advisory capabilities that transform your organization from AI-confused to AI-confident. 
            Our literacy-first approach builds internal champions and sustainable competitive advantage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Executive Leadership - Business */}
          <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group h-full">
            <div className="flex items-start gap-4 h-full flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">FOR BUSINESSES</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-primary mb-3">1A: EXECUTIVE LEADERSHIP</h4>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Strategic advisory sprints that deliver clear AI product strategy and confident decision-making frameworks for boardroom leadership
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Board-ready AI strategy</span>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">LEARN→DECIDE→ALIGN→SELL</span>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Competitive advantage</span>
                </div>
                <Button variant="outline" className="group w-full">
                  Strategic Advisory Sprint
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>

          {/* Enterprise Teams - Business */}
          <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group h-full">
            <div className="flex items-start gap-4 h-full flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">FOR BUSINESSES</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-primary mb-3">1B: ENTERPRISE TEAMS</h4>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Executive seminars, market shift briefings, and strategic planning sessions that prepare leadership teams for 2030's AI-driven landscape
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Executive seminars</span>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Market briefings</span>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Strategic planning</span>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Team literacy</span>
                </div>
                <Button variant="outline" className="group w-full">
                  Executive Seminar Program
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>

          {/* Ideas to Blueprints - Individual */}
          <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group h-full">
            <div className="flex items-start gap-4 h-full flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">FOR INDIVIDUALS</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-accent mb-3">2A: IDEAS-TO-BLUEPRINTS</h4>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Hands-on coaching modules, workflow redesign sessions, and practical AI tool implementation for operational teams
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">Workflow redesign</span>
                  <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">Agent opportunities</span>
                  <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">Tool implementation</span>
                </div>
                <Button variant="outline" className="group w-full">
                  Operational Coaching
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>

          {/* AI Literacy Mastery - Individual */}
          <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group h-full">
            <div className="flex items-start gap-4 h-full flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">FOR INDIVIDUALS</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-accent mb-3">2B: AI LITERACY MASTERY</h4>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Newsletter programs and gamified learning for ongoing development. Build internal AI champions and power users
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">Coach the coaches</span>
                  <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">Modular learning</span>
                  <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">Sustained engagement</span>
                </div>
                <Button variant="outline" className="group w-full">
                  Literacy Development
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PathwaysSection;