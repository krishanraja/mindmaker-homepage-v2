import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionData } from "@/contexts/SessionDataContext";

interface InitialConsultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedProgram?: string;
}

export const InitialConsultModal = ({ open, onOpenChange, preselectedProgram }: InitialConsultModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(preselectedProgram || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { sessionData } = useSessionData();

  const programs = [
    { 
      value: "for-you", 
      label: "For You", 
      subtitle: "Individual leadership development",
      originalPrice: "$250",
      currentPrice: "$150",
      priceNote: "Holiday rate until Jan 1"
    },
    { 
      value: "for-team", 
      label: "For Your Leadership Team", 
      subtitle: "Executive team transformation",
      currentPrice: "Scope call"
    },
    { 
      value: "for-portfolio", 
      label: "For Your Business Portfolio", 
      subtitle: "Multi-company enablement"
    },
    { 
      value: "not-sure", 
      label: "Not sure yet - help me decide", 
      subtitle: "Exploration call"
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !jobTitle || !selectedProgram) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const selectedProgramData = programs.find(p => p.value === selectedProgram);
      
      // Send enriched lead email
      const { error: emailError } = await supabase.functions.invoke('send-lead-email', {
        body: {
          name,
          email,
          jobTitle,
          selectedProgram,
          sessionData
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't block the booking flow if email fails
      }
      
      // For partner program, go directly to Calendly
      if (selectedProgram === 'for-portfolio') {
        const calendlyUrl = `https://calendly.com/krish-raja/mindmaker-meeting?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&prefill_email=${encodeURIComponent(email)}&prefill_name=${encodeURIComponent(name)}&a1=${encodeURIComponent(selectedProgram)}`;
        window.open(calendlyUrl, '_blank');
        onOpenChange(false);
        toast({
          title: "Opening Calendly",
          description: "Booking your consultation...",
        });
        return;
      }

      console.log('Invoking edge function with:', { name, email, selectedProgram });
      
      const { data, error } = await supabase.functions.invoke('create-consultation-hold', {
        body: { 
          name, 
          email, 
          selectedProgram
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        window.open(data.url, '_blank');
        onOpenChange(false);
        toast({
          title: "Redirecting to checkout",
          description: "Opening Stripe checkout in a new tab...",
        });
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Booking error",
        description: error instanceof Error ? error.message : "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      {/* Program Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">What are you most interested in?</Label>
        <RadioGroup value={selectedProgram} onValueChange={setSelectedProgram}>
          {programs.map((program) => (
            <div key={program.value} className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value={program.value} id={program.value} className="mt-1" />
              <Label 
                htmlFor={program.value} 
                className="font-normal cursor-pointer flex-1 leading-tight"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold block">{program.label}</span>
                    <span className="text-xs text-muted-foreground">{program.subtitle}</span>
                  </div>
                  {program.currentPrice && (
                    <div className="text-right flex-shrink-0">
                      {program.originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          {program.originalPrice}
                        </div>
                      )}
                      <div className="text-sm font-bold text-mint">
                        {program.currentPrice}
                      </div>
                      {program.priceNote && (
                        <div className="text-[10px] text-muted-foreground">
                          {program.priceNote}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Name, Job Title & Email */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. CEO, VP of Operations"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>
      </div>

      {/* Value Props */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border/50">
        {selectedProgram === 'for-portfolio' ? (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg">🎯</span>
            <div>
              <span className="font-semibold">Portfolio Program</span>
              <span className="text-muted-foreground"> • Free consultation • Direct booking</span>
            </div>
          </div>
        ) : selectedProgram === 'for-team' || selectedProgram === 'not-sure' ? (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg">📞</span>
            <div>
              <span className="font-semibold">Scope call required</span>
              <span className="text-muted-foreground"> • Free consultation to understand your needs • Custom pricing based on scope</span>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg">🔒</span>
            <div>
              <span className="font-semibold">$50 hold</span>
              <span className="text-muted-foreground"> • Fully refundable if not satisfied • Deducted from any program you choose</span>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full bg-mint text-ink hover:bg-mint/90 font-semibold text-base py-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Reserve My Spot
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] px-4">
          <DrawerHeader className="text-left pb-4">
            <DrawerTitle className="text-xl font-bold">Book Your Initial Consult</DrawerTitle>
            <DrawerDescription className="text-sm">
              45 minutes to map your outcomes • Zero pressure • Real conversation
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto pb-safe-bottom">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Your Initial Consult</DialogTitle>
          <DialogDescription className="text-base">
            45 minutes to map your outcomes • Zero pressure • Real conversation
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};
