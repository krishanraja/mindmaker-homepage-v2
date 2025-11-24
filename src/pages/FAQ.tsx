import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FAQ - Mindmaker";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Frequently asked questions about Mindmaker—turn non-technical leaders into no-code AI builders.");
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    });
    document.head.appendChild(script);

    return () => {
      document.title = "Mindmaker";
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const faqItems = [
    {
      question: "What is Mindmaker?",
      answer: "Mindmaker turns non-technical leaders into no-code AI builders. We help CEOs, GMs, and executives build working AI systems around their real work—without writing code or waiting for IT."
    },
    {
      question: "Who is this for?",
      answer: "CEO, GM, CCO, CPO, CMO, CRO, COO—leaders with P&L responsibility who need to design the future, not delegate it. If you're tired of vendor theatre and want to build real systems, this is for you."
    },
    {
      question: "What's a Builder Session?",
      answer: "A 60-minute live session with Krish where you bring one real leadership problem. You leave with an AI friction map, 1-2 draft systems, and a written follow-up with prompts you can use immediately."
    },
    {
      question: "What's the 30-Day Builder Sprint?",
      answer: "A structured 4-week program where you build 3-5 working AI systems around your actual work. Includes intake mapping, live sessions, a Builder Dossier, metrics dashboard, and optional clips for your team. Investment: $5-8K USD."
    },
    {
      question: "How is the AI Leadership Lab different?",
      answer: "The Lab is for executive teams (6-12 people). It's a 4-hour intensive where you run 2 real decisions: old way vs AI-enabled way. You leave with a 90-day pilot charter, exec summary deck, and team snapshot. Investment: $10-20K USD."
    },
    {
      question: "What's the Partner Program?",
      answer: "For VCs, advisors, and consultants managing portfolios. We run a phased implementation: portfolio scan → first wave (3-5 companies) → standing program → benchmark rollout. Pricing is retainer or revenue share, custom to your portfolio."
    },
    {
      question: "What's The Builder Economy?",
      answer: "The Builder Economy is our community flywheel: podcast episodes, live sessions, and weekly briefings. It's how we share what's working in real portfolios, not vendor hype. Join at mindmaker.ai/builder-economy."
    },
    {
      question: "How is this different from AI training?",
      answer: "Training fades. Consulting tells you what to do. Tools do it for you. We build the system so you can think for yourself—design systems, run decisions, and stop wasting money on vendor theatre."
    },
    {
      question: "What do I actually get?",
      answer: "Working systems you can use tomorrow. Not slides, not theory—prompts, workflows, and frameworks built around your real work. Plus ongoing access to The Builder Economy for as long as you need it."
    },
    {
      question: "How do I start?",
      answer: "Book a Builder Session. Bring one real problem, leave with systems. If you want the full 30-Day Sprint or Leadership Lab after that, we'll map it out together. No pressure, just clarity."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-width py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8 p-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12 fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about turning leaders into no-code AI builders.
            </p>
          </header>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="editorial-card fade-in-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline group">
                  <span className="font-semibold text-foreground group-hover:text-mint transition-colors">
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="editorial-card p-8 md:p-12 text-center mt-16 fade-in-up">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Book a Builder Session to talk through your situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="default" 
                size="lg"
                onClick={() => window.open('https://calendly.com/krish-raja/mindmaker-meeting', '_blank')}
              >
                Book a Builder Session
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = 'mailto:krish@themindmaker.ai?subject=FAQ Inquiry'}
              >
                Email Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
