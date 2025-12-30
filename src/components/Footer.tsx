const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8 sm:py-12">
      <div className="container-width">
        <div className="flex flex-col gap-6">
          {/* Main Footer Content */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                © 2025 Mindmaker LLC. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center gap-8 flex-wrap justify-center">
              {/* AI Literacy Sprints */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  AI Literacy Sprints
                </h4>
                <div className="flex flex-col gap-2">
                  <a 
                    href="/builder-session" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Builder Session
                  </a>
                  <a 
                    href="/builder-sprint" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    AI Literacy-to-Influence
                  </a>
                  <a 
                    href="/leadership-lab" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Leadership Lab
                  </a>
                  <a 
                    href="/portfolio-program" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Portfolio Heatmap
                  </a>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Content
                </h4>
                <div className="flex flex-col gap-2">
                  <a 
                    href="https://content.themindmaker.ai" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                  <a 
                    href="https://content.themindmaker.ai/podcast" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Podcast
                  </a>
                </div>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Company
                </h4>
                <div className="flex flex-col gap-2">
                  <a 
                    href="/faq" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </a>
                  <a 
                    href="/privacy" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                  <a 
                    href="/terms" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms
                  </a>
                  <a 
                    href="/contact" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
