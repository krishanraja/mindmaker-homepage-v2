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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* For Businesses */}
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-4">FOR BUSINESSES</h3>
              <p className="text-lg text-readable-secondary">
                Escape pilot purgatory. Build AI-first competitive advantages that create sustainable revenue growth.
              </p>
            </div>

            <div className="space-y-6">
              {/* Executive Leaders */}
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-primary mb-2">1A: EXECUTIVE LEADERSHIP</h4>
                    <p className="text-muted-foreground mb-4">
                      Strategic advisory sprints that deliver clear AI product strategy and confident decision-making frameworks for boardroom leadership
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">Board-ready AI strategy</span>
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">LEARN→DECIDE→ALIGN→SELL</span>
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">Competitive advantage</span>
                    </div>
                    <Button variant="outline" className="group">
                      Strategic Advisory Sprint
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enterprise Teams */}
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-primary mb-2">1B: ENTERPRISE TEAMS</h4>
                    <p className="text-muted-foreground mb-4">
                      Executive seminars, market shift briefings, and strategic planning sessions that prepare leadership teams for 2030's AI-driven landscape
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">Executive seminars</span>
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">Market briefings</span>
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">Strategic planning</span>
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">Team literacy</span>
                    </div>
                    <Button variant="outline" className="group">
                      Executive Seminar Program
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* For Individuals */}
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-3xl font-bold text-accent mb-4">FOR INDIVIDUALS</h3>
              <p className="text-lg text-readable-secondary">
                Future-proof your career and become indispensable in the AI-first economy
              </p>
            </div>

            <div className="space-y-6">
              {/* Ideas to Blueprints */}
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-accent mb-2">2A: IDEAS-TO-BLUEPRINTS</h4>
                    <p className="text-muted-foreground mb-4">
                      Hands-on coaching modules, workflow redesign sessions, and practical AI tool implementation for operational teams
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full">Workflow redesign</span>
                      <span className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full">Agent opportunities</span>
                      <span className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full">Tool implementation</span>
                    </div>
                    <Button variant="outline" className="group">
                      Operational Coaching
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Literacy Mastery */}
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-accent mb-2">2B: AI LITERACY MASTERY</h4>
                    <p className="text-muted-foreground mb-4">
                      Newsletter programs and gamified learning for ongoing development. Build internal AI champions and power users
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full">Coach the coaches</span>
                      <span className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full">Modular learning</span>
                      <span className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full">Sustained engagement</span>
                    </div>
                    <Button variant="outline" className="group">
                      Literacy Development
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PathwaysSection;