import { Message } from './useChatBot';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import krishHeadshot from '@/assets/krish-headshot.png';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'} fade-in-up`}>
      <Avatar className="h-8 w-8 shrink-0">
        {isAssistant ? (
          <>
            <AvatarImage src={krishHeadshot} alt="Krish" />
            <AvatarFallback>K</AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
        )}
      </Avatar>
      
      <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} max-w-[80%]`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isAssistant
              ? 'bg-muted text-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
