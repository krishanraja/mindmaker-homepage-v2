import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ToolsDrawer } from "./ToolsDrawer";

type DialogType = 'quiz' | 'decision' | 'friction' | 'portfolio' | null;

interface ToolsDrawerButtonProps {
  onToolClick: (toolId: DialogType) => void;
}

export const ToolsDrawerButton = ({ onToolClick }: ToolsDrawerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className="fixed right-6 bottom-6 z-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-mint to-mint-dark hover:from-mint-dark hover:to-mint"
                aria-label="Open AI Tools"
              >
                <Sparkles className="h-6 w-6" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2">
            <p>AI Tools</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ToolsDrawer 
        open={isOpen} 
        onOpenChange={setIsOpen}
        onToolClick={onToolClick}
      />
    </>
  );
};

