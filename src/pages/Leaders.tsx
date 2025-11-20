import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  company: z.string().trim().min(2, "Company name required").max(100),
  role: z.string().trim().min(2, "Role required").max(100),
  aiMaturity: z.string().min(1, "Please select your AI maturity level"),
  primaryChallenge: z.string().min(1, "Please select your primary challenge"),
  decisionSpeed: z.string().min(1, "Please rate your decision speed"),
});

type FormData = z.infer<typeof formSchema>;

const Leaders = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const calculateScore = (data: FormData) => {
    let points = 0;
    if (data.aiMaturity === "exploring") points += 20;
    else if (data.aiMaturity === "piloting") points += 40;
    else if (data.aiMaturity === "scaling") points += 60;
    else if (data.aiMaturity === "leading") points += 80;

    if (data.decisionSpeed === "slow") points += 10;
    else if (data.decisionSpeed === "moderate") points += 20;
    else if (data.decisionSpeed === "fast") points += 30;

    return Math.min(points, 100);
  };

  const onSubmit = (data: FormData) => {
    const calculatedScore = calculateScore(data);
    setScore(calculatedScore);
    setIsSubmitted(true);
    
    toast({
      title: "Assessment Complete!",
      description: "Your AI Leadership baseline has been calculated.",
    });

    // Here you would typically send data to backend
    console.log("Leaders Benchmark Submission:", { ...data, score: calculatedScore });
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <section className="section-padding pt-safe-area-top">
          <div className="container-width max-w-2xl">
            <Card className="glass-card">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Your AI Literacy Profile</CardTitle>
                <CardDescription className="text-lg mt-4">
                  This isn't a quiz. It's a map of how you think about AI right now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Key Tensions Identified:</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">Cognitive Scaffolding</p>
                      <p className="text-sm text-muted-foreground">
                        {score < 40 && "You're operating primarily from vendor claims and media hype. Building mental models for evaluation is the first step."}
                        {score >= 40 && score < 70 && "You have baseline awareness but need sharper frameworks to separate theatre from substance in AI conversations."}
                        {score >= 70 && "You're thinking clearly about AI, but may benefit from structured practice to compound this into daily decision-making."}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">Decision Infrastructure</p>
                      <p className="text-sm text-muted-foreground">Most leaders lack the vocabulary to challenge AI claims confidently. You need practice evaluating vendors and pilots.</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">Mental Models</p>
                      <p className="text-sm text-muted-foreground">Understanding how to work alongside AI—not just use tools—will be crucial as agents reshape work structures.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    Ready to build the cognitive infrastructure? The Sprint gives you practice on real scenarios until it's instinct.
                  </p>
                  <Button 
                    variant="hero-primary" 
                    size="lg" 
                    className="w-full group mb-3"
                    onClick={() => window.open('https://calendly.com/krish-raja/mindmaker-meeting', '_blank')}
                  >
                    Book Strategy Call
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.location.href = '/'}
                  >
                    Return to Homepage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="section-padding pt-safe-area-top bg-muted/30">
        <div className="container-width max-w-3xl">
          <div className="text-center mb-12 fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              AI Literacy Diagnostic for Leaders
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A structured diagnostic to map how you currently think and decide when AI is involved. Surfaces tensions, blind spots, and leverage points in 5 minutes.
            </p>
          </div>

          <Card className="glass-card fade-in-up">
            <CardHeader>
              <CardTitle>Cognitive Baseline Diagnostic</CardTitle>
              <CardDescription>This isn't a quiz. It's a map of how you think about AI right now.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" {...register("name")} placeholder="John Smith" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="john@company.com" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input id="company" {...register("company")} placeholder="Acme Corp" />
                  {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Your Role *</Label>
                  <Input id="role" {...register("role")} placeholder="CEO, VP Product, etc." />
                  {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiMaturity">How do you currently engage with AI in your work? *</Label>
                  <select 
                    id="aiMaturity" 
                    {...register("aiMaturity")} 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="exploring">Observing - Following trends, not yet hands-on</option>
                    <option value="piloting">Experimenting - Using tools occasionally</option>
                    <option value="scaling">Practicing - Regular use for specific tasks</option>
                    <option value="leading">Integrating - AI is part of my decision-making process</option>
                  </select>
                  {errors.aiMaturity && <p className="text-sm text-destructive">{errors.aiMaturity.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryChallenge">What's your biggest AI decision-making challenge? *</Label>
                  <select 
                    id="primaryChallenge" 
                    {...register("primaryChallenge")} 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="literacy">Can't separate hype from real value</option>
                    <option value="alignment">Lack vocabulary to challenge vendor claims</option>
                    <option value="roi">Unsure how AI will impact my role long-term</option>
                    <option value="scaling">Don't know how to evaluate AI pilots</option>
                    <option value="confidence">Worried about outsourcing judgment to AI</option>
                  </select>
                  {errors.primaryChallenge && <p className="text-sm text-destructive">{errors.primaryChallenge.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decisionSpeed">Confidence level when AI is part of strategic conversations? *</Label>
                  <select 
                    id="decisionSpeed" 
                    {...register("decisionSpeed")} 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="slow">Low - I often defer to others</option>
                    <option value="moderate">Moderate - I contribute but not confidently</option>
                    <option value="fast">High - I can challenge assumptions and ask sharp questions</option>
                  </select>
                  {errors.decisionSpeed && <p className="text-sm text-destructive">{errors.decisionSpeed.message}</p>}
                </div>

                <Button type="submit" variant="hero-primary" size="lg" className="w-full group">
                  Complete Diagnostic
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Leaders;
