import { useState, useRef, useEffect } from 'react';
import type { Vinyl } from '../mockData';

interface ChatbotProps {
  vinyls: Vinyl[];
  onAddProductToCart: (product: Vinyl) => void;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  suggestedVinyls?: Vinyl[];
}

export default function Chatbot({ vinyls, onAddProductToCart }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Olá! Sou o assistente virtual da Liverpool Discos. 🎧 Que tipo de som você gostaria de ouvir hoje? Posso sugerir alguns discos incríveis do nosso catálogo!'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    // Add user message
    const updatedMessages = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(updatedMessages);

    // Simulate AI thinking and reply
    setTimeout(() => {
      let replyText = 'Não entendi muito bem. Você prefere algo voltado para Jazz, Rock clássico ou Pop eletrônico?';
      let suggestions: Vinyl[] = [];

      const query = userText.toLowerCase();
      if (query.includes('jazz') || query.includes('miles') || query.includes('instrumental') || query.includes('blues')) {
        replyText = 'Para curtir um Jazz clássico e refinado, o incomparável "Kind of Blue" de Miles Davis é a escolha perfeita. Ele combina com uma noite calma e intimista.';
        suggestions = vinyls.filter(v => v.genre === 'Jazz');
      } else if (query.includes('rock') || query.includes('pink floyd') || query.includes('beatles') || query.includes('progressivo')) {
        replyText = 'Se você curte rock, temos verdadeiras obras-primas como "The Dark Side of the Moon" do Pink Floyd e "Abbey Road" dos Beatles. Qual deles você gostaria de rodar no prato hoje?';
        suggestions = vinyls.filter(v => v.genre.includes('Rock') || v.genre === 'Classic Rock' || v.genre === 'Progressive Rock');
      } else if (query.includes('pop') || query.includes('michael') || query.includes('eletronico') || query.includes('daft') || query.includes('dançar')) {
        replyText = 'Para agitar o ambiente e colocar um som moderno, recomendo o eletrônico melódico "Random Access Memories" do Daft Punk, ou o maior clássico pop de todos os tempos, "Thriller" de Michael Jackson!';
        suggestions = vinyls.filter(v => v.genre === 'Electronic' || v.genre === 'Pop');
      } else if (query.includes('recomenda') || query.includes('sugere') || query.includes('dica') || query.includes('ajuda')) {
        replyText = 'Com certeza! Aqui estão algumas das joias em vinil mais vendidas em nossa loja neste momento. Escolha o seu favorito para ver os detalhes:';
        suggestions = vinyls.slice(0, 3);
      } else {
        replyText = 'Que excelente bom gosto! O vinil traz aquela fidelidade analógica única. Experimente me perguntar sobre "Rock", "Jazz" ou "Eletrônico" para ver indicações especiais!';
        suggestions = [vinyls[0] as Vinyl];
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: replyText,
        suggestedVinyls: suggestions.length > 0 ? suggestions : undefined
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#D97724] to-[#B85D43] text-[#F4EFE6] shadow-[0_4px_20px_rgba(217,119,36,0.4)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] md:w-[400px] h-[500px] rounded-3xl bg-[#121212] border border-[#4A5844]/40 flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="bg-[#4A5844] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-[#D97724] border border-[#D97724]/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#F4EFE6] text-base leading-tight">Recomendações IA</h4>
                <span className="text-[11px] text-[#F4EFE6]/70 uppercase tracking-widest font-medium">Liverpool Discos</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#F4EFE6]/70 hover:text-[#F4EFE6] transition cursor-pointer p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#121212]/95 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#D97724] text-[#F4EFE6] rounded-tr-none' 
                    : 'bg-[#4A5844]/20 border border-[#4A5844]/30 text-[#F4EFE6] rounded-tl-none'
                }`}>
                  <p>{msg.text}</p>
                </div>
                
                {/* Suggestions display inside chat */}
                {msg.suggestedVinyls && (
                  <div className="w-full mt-3 grid grid-cols-1 gap-2">
                    {msg.suggestedVinyls.map(vinyl => (
                      <div 
                        key={vinyl.id} 
                        className="bg-[#121212] border border-[#4A5844]/30 rounded-xl p-3 flex gap-3 items-center hover:border-[#D97724]/40 transition group"
                      >
                        <img 
                          src={vinyl.coverUrl} 
                          alt={vinyl.title} 
                          className="w-12 h-12 rounded-lg object-cover bg-black" 
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-serif font-bold text-xs text-[#F4EFE6] truncate leading-tight">{vinyl.title}</h5>
                          <p className="text-[10px] text-[#F4EFE6]/60 truncate mt-0.5">{vinyl.artist} &bull; {vinyl.genre}</p>
                          <p className="text-xs text-[#D97724] font-bold mt-1">R$ {vinyl.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => onAddProductToCart(vinyl)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#D97724]/10 hover:bg-[#D97724] text-[#D97724] hover:text-[#F4EFE6] border border-[#D97724]/20 hover:border-transparent transition cursor-pointer"
                        >
                          Adicionar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#121212] border-t border-[#4A5844]/20 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida ou estilo musical..."
              className="flex-1 bg-[#121212] border border-[#4A5844]/30 rounded-xl px-4 py-2 text-sm text-[#F4EFE6] focus:outline-none focus:border-[#D97724] transition font-sans"
            />
            <button
              onClick={handleSend}
              className="bg-[#D97724] hover:bg-[#D97724]/90 text-[#F4EFE6] p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
