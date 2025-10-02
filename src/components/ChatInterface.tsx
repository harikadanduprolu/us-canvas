import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Heart, 
  Smile, 
  Camera, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "me" | "partner";
  timestamp: Date;
  type: "text" | "emoji" | "image";
  reactions?: string[];
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Good morning beautiful! ☀️ Hope you have an amazing day!",
    sender: "partner",
    timestamp: new Date(Date.now() - 3600000),
    type: "text",
  },
  {
    id: "2", 
    text: "Good morning love! 💕 Already missing you",
    sender: "me",
    timestamp: new Date(Date.now() - 3540000),
    type: "text",
    reactions: ["❤️"],
  },
  {
    id: "3",
    text: "Can't wait to see you tonight! I made dinner reservations at that place you wanted to try 🍝",
    sender: "partner", 
    timestamp: new Date(Date.now() - 1800000),
    type: "text",
  },
  {
    id: "4",
    text: "You're the best! I love you so much 💖✨",
    sender: "me",
    timestamp: new Date(Date.now() - 1740000),
    type: "text",
    reactions: ["🥰", "💕"],
  },
];

const quickEmojis = ["❤️", "😘", "🥰", "😍", "💕", "🌹", "✨", "🎉"];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: "me",
      timestamp: new Date(),
      type: "text",
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate partner typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate partner response
      setTimeout(() => {
        const responses = [
          "I love you too! 💕",
          "You make me so happy! 😊",
          "Can't wait to be with you! 🥰",
          "You're amazing! ✨",
          "Missing you! ❤️",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const partnerMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: "partner",
          timestamp: new Date(),
          type: "text",
        };
        setMessages(prev => [...prev, partnerMessage]);
      }, 1000);
    }, 2000);

    toast("Message sent! 💕");
  };

  const sendEmoji = (emoji: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text: emoji,
      sender: "me",
      timestamp: new Date(),
      type: "emoji",
    };

    setMessages(prev => [...prev, message]);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: msg.reactions 
                ? [...msg.reactions, emoji]
                : [emoji]
            }
          : msg
      )
    );
    toast("Reaction added! 😊");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col shadow-romantic">
        {/* Chat Header */}
        <CardHeader className="bg-gradient-romantic text-white rounded-t-lg flex-row items-center space-y-0 pb-4">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="bg-white/20 text-white">💕</AvatarFallback>
          </Avatar>
          <div className="flex-1 ml-3">
            <CardTitle className="text-lg">My Love</CardTitle>
            <p className="text-white/80 text-sm">
              {isTyping ? "Typing..." : "Online"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 bg-gradient-sunset/30">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative group ${
                  message.sender === "me"
                    ? "bg-gradient-romantic text-white"
                    : "bg-card border shadow-gentle"
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${
                      message.sender === "me" ? "text-white/70" : "text-muted-foreground"
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    
                    {/* Quick Reaction Button */}
                    <Button
                      onClick={() => addReaction(message.id, "❤️")}
                      variant="ghost"
                      size="sm"
                      className={`opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 ${
                        message.sender === "me" ? "text-white/70 hover:text-white" : ""
                      }`}
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {message.reactions.map((reaction, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-white/20 px-1 py-0.5 rounded-full"
                        >
                          {reaction}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border shadow-gentle px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Quick Emojis */}
        <div className="px-4 py-2 border-t bg-card">
          <div className="flex gap-2 justify-center">
            {quickEmojis.map((emoji) => (
              <Button
                key={emoji}
                onClick={() => sendEmoji(emoji)}
                variant="ghost"
                size="sm"
                className="text-lg hover:scale-110 transition-transform"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-card rounded-b-lg">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Camera className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a loving message..."
              className="flex-1"
            />
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Smile className="h-4 w-4" />
            </Button>
            <Button 
              onClick={sendMessage}
              variant="romantic" 
              size="sm"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Chat Features Info */}
      <Card className="mt-6 bg-gradient-love text-white shadow-gentle">
        <CardContent className="pt-6 text-center">
          <Heart className="h-8 w-8 mx-auto mb-3 animate-heartbeat" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm opacity-90">
            Voice messages, video calls, photo sharing, and real-time notifications 
            to keep you connected wherever you are! 💕
          </p>
        </CardContent>
      </Card>
    </div>
  );
};