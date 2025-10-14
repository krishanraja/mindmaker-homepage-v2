import { useState } from 'react';
import { ChatButton } from './ChatButton';
import { ChatPanel } from './ChatPanel';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && <ChatButton onClick={() => setIsOpen(true)} />}
      {isOpen && <ChatPanel onClose={() => setIsOpen(false)} />}
    </>
  );
};
