import Navigation from "@/components/Navigation";
import NewHero from "@/components/NewHero";
import WhoThisIsFor from "@/components/WhoThisIsFor";
import TheProblem from "@/components/TheProblem";
import ProductLadder from "@/components/ProductLadder";
import HowItsDifferent from "@/components/HowItsDifferent";
import BuilderEconomyConnection from "@/components/BuilderEconomyConnection";
import SimpleCTA from "@/components/SimpleCTA";
import Footer from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <NewHero />
      
      {/* Who This Is For */}
      <WhoThisIsFor />
      
      {/* The Problem */}
      <TheProblem />
      
      {/* Product Ladder */}
      <ProductLadder />
      
      {/* How It's Different */}
      <HowItsDifferent />
      
      {/* Builder Economy Connection */}
      <BuilderEconomyConnection />
      
      {/* Simple CTA */}
      <SimpleCTA />
      
      {/* Footer */}
      <Footer />
      
      {/* ChatBot */}
      <ChatBot />
    </main>
  );
};

export default Index;
