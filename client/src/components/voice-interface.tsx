import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  isConfigured?: boolean;
}

export function VoiceInterface({
  onTranscription,
  isProcessing,
  isSpeaking,
  onStopSpeaking,
  isConfigured = true,
}: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(12).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const getStatus = () => {
    if (!isConfigured) return "API key required";
    if (isSpeaking) return "Speaking...";
    if (isProcessing) return "Processing...";
    if (isRecording) return "Listening...";
    return "Press to speak";
  };

  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const bars = 12;
    const step = Math.floor(dataArray.length / bars);
    const levels = [];
    
    for (let i = 0; i < bars; i++) {
      const start = i * step;
      let sum = 0;
      for (let j = start; j < start + step; j++) {
        sum += dataArray[j];
      }
      const avg = sum / step;
      levels.push(avg / 255);
    }
    
    setAudioLevel(levels);
    animationFrameRef.current = requestAnimationFrame(visualizeAudio);
  }, []);

  const startRecording = async () => {
    if (!isConfigured) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your OpenAI API key to use voice features.",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }

        setAudioLevel(new Array(12).fill(0));

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        
        if (audioBlob.size > 0) {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          
          try {
            const response = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.text) {
                onTranscription(data.text);
              }
            } else {
              const error = await response.json();
              toast({
                variant: "destructive",
                title: "Transcription Failed",
                description: error.error || "Could not transcribe audio. Please try again.",
              });
            }
          } catch (error) {
            console.error("Transcription error:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to transcribe audio. Please try again.",
            });
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      visualizeAudio();
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isSpeaking) {
      onStopSpeaking();
      return;
    }
    
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <Button
          size="icon"
          variant={isRecording ? "destructive" : isSpeaking ? "secondary" : "default"}
          className={cn(
            "w-24 h-24 rounded-full transition-all duration-300",
            isRecording && "animate-pulse",
            !isConfigured && "opacity-50"
          )}
          onClick={handleMicClick}
          disabled={isProcessing || (!isConfigured && !isSpeaking)}
          data-testid="button-microphone"
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isSpeaking ? (
            <Volume2 className="w-10 h-10" />
          ) : isRecording ? (
            <Square className="w-8 h-8" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </Button>
        
        {(isRecording || isSpeaking) && (
          <div className="absolute inset-0 -z-10 rounded-full animate-ping bg-primary/20" />
        )}
      </div>

      <div className="flex items-end justify-center gap-1 h-16 w-48" data-testid="container-waveform">
        {audioLevel.map((level, index) => (
          <div
            key={index}
            className={cn(
              "w-3 rounded-full transition-all duration-75",
              isRecording ? "bg-primary" : isSpeaking ? "bg-secondary-foreground" : "bg-muted"
            )}
            style={{
              height: `${Math.max(8, (isRecording || isSpeaking ? level * 64 : 8))}px`,
            }}
            data-testid={`waveform-bar-${index}`}
          />
        ))}
      </div>

      <p
        className={cn(
          "text-sm font-medium transition-colors",
          isRecording ? "text-destructive" : 
          !isConfigured ? "text-muted-foreground" :
          isSpeaking ? "text-foreground" : "text-muted-foreground"
        )}
        data-testid="text-voice-status"
      >
        {getStatus()}
      </p>
    </div>
  );
}
