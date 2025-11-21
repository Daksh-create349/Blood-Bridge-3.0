
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import { X, Send, Loader2, Sparkles, Bot } from 'lucide-react';

// --- Types ---
interface Message {
  role: 'user' | 'model';
  text: string;
  isToolCall?: boolean;
}

// --- Tool Definitions ---

const navigationTool: FunctionDeclaration = {
  name: 'navigate_to_page',
  description: 'Navigates the user to a specific page in the application.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      page: {
        type: Type.STRING,
        enum: ["dashboard", "send-request", "view-alerts", "camps", "analytics", "mission"],
        description: "The destination page identifier."
      }
    },
    required: ['page']
  }
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am Pulse. I can answer your questions about blood donation or help you navigate the app.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Persist Chat Session
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleToolCall = (fn: any): string => {
    if (fn.name === 'navigate_to_page') {
       const pathMap: Record<string, string> = {
         'dashboard': '/dashboard', 
         'send-request': '/send-request',
         'view-alerts': '/view-alerts', 
         'camps': '/camps',
         'analytics': '/analytics', 
         'mission': '/mission'
       };
       const target = pathMap[fn.args.page];
       if (target) {
         navigate(target);
         return `Successfully navigated to ${fn.args.page} page.`;
       }
       return `Could not find page: ${fn.args.page}`;
    }
    return "Unknown tool.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key Missing");

      if (!chatSessionRef.current) {
        const ai = new GoogleGenAI({ apiKey });
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `
              You are Pulse, the AI assistant for Blood Bridge.
              Your goal is to help users understand blood donation, find information in the app, and navigate.
              
              Pages available:
              - Dashboard: Inventory status.
              - Send Request: Broadcast urgent needs.
              - Active Alerts: View current requests.
              - Camps: Donation drives and map.
              - Analytics: Charts and insights.
              - Mission: About us.

              Keep responses concise and friendly.
            `,
            tools: [{ functionDeclarations: [navigationTool] }],
          }
        });
      }

      let result = await chatSessionRef.current.sendMessage({ message: userText });
      let response = result.candidates?.[0];

      // Handle Tool Calls (Navigation)
      if (response?.content?.parts?.some(p => p.functionCall)) {
        const functionCalls = response.content.parts.filter(p => p.functionCall);
        const toolResponses = [];

        for (const part of functionCalls) {
          const fn = part.functionCall;
          if (fn) {
            setMessages(prev => [...prev, { role: 'model', text: `Navigating to ${fn.args.page}...`, isToolCall: true }]);
            const functionResult = handleToolCall(fn);
            
            toolResponses.push({
              functionResponse: {
                name: fn.name,
                response: { result: functionResult }
              }
            });
          }
        }

        // Send tool response back to model
        if (toolResponses.length > 0) {
          result = await chatSessionRef.current.sendMessage({ message: toolResponses });
          response = result.candidates?.[0];
        }
      }

      const textResponse = response?.content?.parts?.find(p => p.text)?.text;
      if (textResponse) {
        setMessages(prev => [...prev, { role: 'model', text: textResponse }]);
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-r from-red-600 to-orange-600 animate-bounce-slow'
        }`}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Bot className="h-7 w-7 text-white fill-white/20" />}
      </button>

      <div
        className={`fixed bottom-24 right-6 z-40 flex w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl transition-all duration-300 dark:bg-slate-900/90 dark:border-slate-700 ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'pointer-events-none opacity-0 translate-y-10 scale-95'
        }`}
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 p-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold leading-none">Pulse AI</h3>
            <p className="text-xs text-red-100 opacity-80">Assistant</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar h-[400px] bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-br-none'
                    : msg.isToolCall
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-mono border border-blue-100 dark:border-blue-800'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-none bg-slate-100 px-4 py-3 dark:bg-slate-800">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <span className="text-xs text-slate-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200 bg-white/50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="How can I help you?"
              className="w-full rounded-full border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 rounded-full bg-red-600 p-2 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
