import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, ChevronUp, MessageCircle, Mic, Send, Volume2, X } from 'lucide-react';
import { ChatRecord, createChatRecord, getStoredChatHistory, saveChatRecord } from '../utils/nlp';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { saveNlpChatMessage } from '../services/chatHistoryService';

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatRecord[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [expandedNlpIds, setExpandedNlpIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { menuItems } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setHistory(getStoredChatHistory());
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  const quickQuestions = [
    'Meals under PHP 60',
    'Food without soy',
    'What has peanuts?',
    'How do I order?'
  ];

  const handleSend = (message = input) => {
    if (!message.trim()) return;

    const record = createChatRecord(message.trim(), menuItems); 
    setHistory(saveChatRecord(record));
    void saveNlpChatMessage(record, user?.id);
    setInput('');
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const toggleNlpDetails = (recordId: string) => {
    setExpandedNlpIds(prev => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition as SpeechRecognitionConstructor | undefined;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-PH';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-[#F57C00] p-4 text-white shadow-lg transition-all hover:bg-[#E65100] sm:bottom-6 sm:right-6"
          title="Open SmartDine chatbot"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col rounded-lg border border-gray-200 bg-white shadow-2xl sm:left-auto sm:right-6 sm:top-auto sm:h-[620px] sm:w-[390px] sm:max-w-[calc(100vw-2rem)]">
          <div className="bg-[#F57C00] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">SmartDine Assistant</h3>
                <p className="text-xs opacity-90">Ask me about menu & allergens</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded" title="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
            {history.length === 0 && (
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg whitespace-pre-line">
                Hello! I&apos;m your SmartDine assistant. I can help you with:

                - Menu recommendations
                - Allergen information
                - Healthy food suggestions
                - Ordering assistance

                Ask naturally, or use voice input. I&apos;ll show the NLP processing behind each answer.
              </div>
            )}

            {history.slice(-15).map(record => (
              <div key={record.id} className="space-y-2">
                <div className="flex justify-end">
                  <div className="max-w-[88%] break-words rounded-lg bg-[#F57C00] p-3 text-white whitespace-pre-line sm:max-w-[82%]">
                    {record.userMessage}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[92%] break-words rounded-lg bg-gray-100 p-3 text-gray-800 whitespace-pre-line sm:max-w-[88%]">
                    {record.botResponse}

                    <button
                      onClick={() => toggleNlpDetails(record.id)}
                      className="mt-2 flex items-center gap-1 text-xs text-gray-600 hover:text-[#F57C00]"
                      type="button"
                    >
                      {expandedNlpIds.has(record.id) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      NLP details
                    </button>

                    {expandedNlpIds.has(record.id) && (
                      <div className="mt-2 border-t border-gray-200 pt-2 text-xs space-y-2">
                        <div className="flex flex-wrap gap-1">
                          <span className="font-semibold text-gray-700">Tokens:</span>
                          {record.nlp.tokens.slice(0, 10).map((token, index) => (
                            <span key={`${record.id}-${token}-${index}`} className="rounded bg-white px-1.5 py-0.5 text-gray-700 border border-gray-200">
                              {token}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-gray-700">
                          <span><strong>Sentiment:</strong> {record.nlp.sentiment} ({record.nlp.sentimentScore})</span>
                          <span><strong>Intent:</strong> {record.nlp.intent}</span>
                          <span><strong>Keywords:</strong> {record.nlp.keywords.length ? record.nlp.keywords.join(', ') : 'None detected'}</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => speak(record.botResponse)}
                      className="mt-2 flex items-center gap-1 text-xs text-[#F57C00] hover:text-[#E65100]"
                    >
                      <Volume2 className="h-3 w-3" />
                      Speak
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex flex-wrap gap-2 px-3 pb-2 sm:px-4">
            {quickQuestions.map(question => (
              <button
                key={question}
                onClick={() => handleSend(question)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
              >
                {question}
              </button>
            ))}
          </div>

          <div className="border-t p-3 sm:p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSend()}
                placeholder="Type or speak a message..."
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
              />
              <button
                onClick={startVoiceInput}
                className={`p-2 rounded-lg text-white ${isListening ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-800'}`}
                title="Voice to text"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSend()}
                className="bg-[#F57C00] text-white p-2 rounded-lg hover:bg-[#E65100]"
                title="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
