import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Car as CarIcon, Trash2, Volume2, VolumeX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { VoiceInterface } from "@/components/voice-interface";
import { ConversationDisplay } from "@/components/conversation-display";
import { CarInventory } from "@/components/car-inventory";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message, Car } from "@shared/schema";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const { data: config } = useQuery<{ openaiConfigured: boolean }>({
    queryKey: ["/api/config"],
  });

  const { data: cars = [], isLoading: carsLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        messages,
        userMessage,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }
      return response.json();
    },
    onSuccess: async (data: { message: string; audioUrl?: string }) => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.audioUrl && !isMuted) {
        try {
          const audio = new Audio(data.audioUrl);
          audioRef.current = audio;
          
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };
          
          await audio.play();
        } catch (error) {
          console.error("Audio playback error:", error);
          setIsSpeaking(false);
        }
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleTranscription = useCallback((text: string) => {
    if (!config?.openaiConfigured) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your OpenAI API key to use the voice assistant.",
      });
      return;
    }
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(text);
  }, [chatMutation, config, toast]);

  const handleStopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const handleClearConversation = () => {
    setMessages([]);
    handleStopSpeaking();
  };

  const toggleMute = () => {
    if (isSpeaking) {
      handleStopSpeaking();
    }
    setIsMuted((prev) => !prev);
  };

  const isOpenAIConfigured = config?.openaiConfigured ?? false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-4 h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center" data-testid="logo-container">
              <CarIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight" data-testid="text-app-title">AutoVoice AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block" data-testid="text-app-subtitle">Voice-Driven Sales Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              data-testid="button-mute-toggle"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {config && !config.openaiConfigured && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3" data-testid="banner-api-warning">
          <div className="max-w-7xl mx-auto flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive-foreground">
              <span className="font-medium">OpenAI API key not configured.</span>{" "}
              Voice features are disabled. Add your OPENAI_API_KEY to enable the AI assistant.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full" data-testid="main-content">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
          <div className="flex flex-col lg:w-[45%] border-r" data-testid="panel-voice">
            <div className="flex-1 overflow-hidden">
              <ConversationDisplay
                messages={messages}
                isLoading={chatMutation.isPending}
              />
            </div>
            
            <Separator />
            
            <Card className="m-4 p-6 border-card-border" data-testid="card-voice-controls">
              <VoiceInterface
                onTranscription={handleTranscription}
                isProcessing={chatMutation.isPending}
                isSpeaking={isSpeaking}
                onStopSpeaking={handleStopSpeaking}
                isConfigured={isOpenAIConfigured}
              />
              
              {messages.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearConversation}
                    className="text-muted-foreground"
                    data-testid="button-clear-conversation"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear conversation
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="flex-1 lg:w-[55%] overflow-hidden bg-muted/30" data-testid="panel-inventory">
            <CarInventory cars={cars} isLoading={carsLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
