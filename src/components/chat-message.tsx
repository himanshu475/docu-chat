'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
}

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-2 w-2 animate-pulse rounded-full bg-current [animation-delay:-0.3s]"></span>
      <span className="h-2 w-2 animate-pulse rounded-full bg-current [animation-delay:-0.15s]"></span>
      <span className="h-2 w-2 animate-pulse rounded-full bg-current"></span>
    </div>
  );
}

export function ChatMessage({ role, content, isLoading = false }: ChatMessageProps) {
  return (
    <div className={cn('flex items-start gap-3', role === 'user' && 'justify-end')}>
      {role === 'ai' && (
        <Avatar className="h-9 w-9 border">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-xl p-3 px-4 text-sm shadow-sm',
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground',
          isLoading ? 'flex items-center' : 'whitespace-pre-wrap'
        )}
      >
        {isLoading ? <LoadingDots /> : content}
      </div>
      {role === 'user' && (
        <Avatar className="h-9 w-9 border">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
