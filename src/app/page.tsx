'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { File, MessageSquare, Plus, Send, UploadCloud, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAIResponse } from './actions';
import { ChatMessage } from '@/components/chat-message';
import { Logo } from '@/components/logo';
import { extractRawText } from '@/lib/docx-extractor';
import * as pdfjs from 'pdfjs-dist';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { downloadCode } from '@/lib/download-code';


// Set up the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Message = {
  role: 'user' | 'ai';
  content: string;
};

type ChatSession = {
  id: string;
  fileName: string;
  documentText: string;
  messages: Message[];
}

export default function Home() {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setChatHistory(parsedHistory);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeChatId, isLoading, chatHistory]);


  const handleNewChat = () => {
    setActiveChatId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      setIsLoading(true);

      const processText = (text: string) => {
        const newChatId = Date.now().toString();
        const newChat: ChatSession = {
          id: newChatId,
          fileName,
          documentText: text,
          messages: [
            { role: 'ai', content: `I've finished reading "${fileName}". Ask me anything!` },
          ],
        };
        setChatHistory(prev => [newChat, ...prev]);
        setActiveChatId(newChatId);
        setIsLoading(false);
      }

      const handleError = (error?: any) => {
        console.error('File reading error:', error);
        toast({
          variant: 'destructive',
          title: 'Error reading file',
          description: 'There was a problem reading your document. Please try another file.',
        });
        setIsLoading(false);
      }

      try {
        if (file.name.endsWith('.docx')) {
          const text = await extractRawText(file);
          processText(text);
        } else if (file.name.endsWith('.pdf')) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map((item: any) => 'str' in item ? item.str : '').join(' ') + '\n';
              }
              processText(fullText);
            } catch (error) {
              handleError(error);
            }
          };
          reader.onerror = handleError;
          reader.readAsArrayBuffer(file);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => processText(e.target?.result as string);
          reader.onerror = handleError;
          reader.readAsText(file);
        }
      } catch (error) {
        handleError(error);
      }
    }
  };
  
  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const message = formData.get('message') as string;
  
    const activeChat = chatHistory.find(c => c.id === activeChatId);
    if (!message.trim() || !activeChat) return;
  
    form.reset();
  
    const userMessage: Message = { role: 'user', content: message };
  
    setChatHistory(prevHistory =>
      prevHistory.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );
  
    setIsLoading(true);
  
    try {
      const response = await getAIResponse({ documentText: activeChat.documentText, question: message });
      const aiMessage: Message = { role: 'ai', content: response.answer };
  
      setChatHistory(prevHistory =>
        prevHistory.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Sorry, I couldn\'t process that. Please try again.',
      });
      setChatHistory(prevHistory =>
        prevHistory.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: chat.messages.slice(0, -1) }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const activeChat = chatHistory.find(c => c.id === activeChatId);

  const FileUploadView = () => (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center shadow-lg animate-in fade-in zoom-in-95">
        <CardHeader className="p-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <UploadCloud className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Upload Your Document</CardTitle>
          <CardDescription>
            Drop a file here or click the button to start chatting with your document.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <Button size="lg" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="mr-2 h-5 w-5" />
            Select File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.md,.docx,.pdf"
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Supports .txt, .md, .docx and .pdf files.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const ChatInterface = () => (
    <div className="flex h-full flex-col">
       <div className="flex items-center gap-2 border-b p-4">
        <SidebarTrigger className="flex md:hidden" />
        <File className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold truncate">{activeChat?.fileName}</h2>
      </div>
       <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl w-full space-y-6">
            {activeChat?.messages.map((msg, index) => (
            <ChatMessage key={index} {...msg} />
            ))}
            {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && <ChatMessage role="ai" content="" isLoading />}
        </div>
      </div>
      <div className="border-t bg-background/95 p-4">
        <div className="mx-auto w-full max-w-3xl">
          <form onSubmit={handleSendMessage}>
            <div className="relative">
              <Input
                name="message"
                placeholder="Ask a question about your document..."
                className="pr-12"
                autoComplete="off"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
  const messages = activeChat?.messages || [];
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="border-b p-3 flex justify-between items-center">
            <Logo />
            <SidebarTrigger className="hidden md:flex" />
        </SidebarHeader>
          <SidebarContent className="p-2 flex flex-col">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleNewChat}>
                  <Plus />
                  New Chat
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className='flex-1 overflow-y-auto'>
            <SidebarMenu>
              {chatHistory.map(chat => (
                <SidebarMenuItem key={chat.id} className="relative group/item">
                  <SidebarMenuButton 
                    onClick={() => setActiveChatId(chat.id)}
                    isActive={activeChatId === chat.id}
                  >
                    <MessageSquare />
                    <span className="truncate">{chat.fileName}</span>
                  </SidebarMenuButton>
                  <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover/item:opacity-100"
                      onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            </div>
            <SidebarFooter className='mt-auto p-2'>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={downloadCode}>
                    <Download />
                    Download Code
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <main className="h-full">
            {activeChatId ? <ChatInterface /> : <FileUploadView />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
