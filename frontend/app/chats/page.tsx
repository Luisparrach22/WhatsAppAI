"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  messages: Message[];
}

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      name: "Juan Pérez",
      phone: "+34 600 11 22 33",
      avatar: "JP",
      messages: [
        { id: "1", direction: "inbound", text: "Hola! Buenas tardes, quería saber si me pueden llevar de Madrid a Valencia mañana por la tarde.", time: "17:01" },
        { id: "2", direction: "outbound", text: "¡Hola, Juan! He registrado tu solicitud de viaje de Madrid a Valencia para mañana. Para confirmar tu reserva, envíanos una foto de tu DNI por este medio.", time: "17:02", status: "read" },
        { id: "3", direction: "inbound", text: "Claro, aquí les adjunto la foto de mi DNI.", time: "17:05" },
        { id: "4", direction: "outbound", text: "Hemos procesado tu DNI. Datos extraídos: Nombre: JUAN PÉREZ, N°: 98765432W. En breve confirmaremos tu viaje.", time: "17:06", status: "read" }
      ]
    },
    {
      id: "2",
      name: "María Rodríguez",
      phone: "+34 622 44 55 66",
      avatar: "MR",
      messages: [
        { id: "1", direction: "inbound", text: "Buenos días, ¿tienen disponibilidad para Barcelona - Andorra?", time: "Ayer" },
        { id: "2", direction: "outbound", text: "¡Hola! Sí, disponemos de traslados. ¿Para qué fecha y hora lo deseas?", time: "Ayer", status: "read" }
      ]
    }
  ]);

  const [activeChatId, setActiveChatId] = useState<string>("1");
  const [inputText, setInputText] = useState("");

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      direction: "outbound",
      text: inputText,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    setInputText("");

    // Simular doble tick (entregado y leído) después de unos segundos
    setTimeout(() => {
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m)
          };
        }
        return c;
      }));
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden h-screen">
        {/* Chat List Column */}
        <section className="w-80 border-r border-border bg-card flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold tracking-tight">Chats en Vivo</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Comunicaciones vía WhatsApp Business</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {chats.map(chat => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              const isActive = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full p-4 flex gap-3 text-left transition-colors duration-200 ${
                    isActive ? "bg-muted" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 flex-shrink-0">
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h2 className="text-sm font-semibold text-foreground truncate">{chat.name}</h2>
                      <span className="text-[10px] text-muted-foreground">{lastMsg?.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{chat.phone}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{lastMsg?.text}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Chat Window Column */}
        <section className="flex-1 flex flex-col h-full bg-muted/20 relative">
          {/* Header */}
          <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                {activeChat.avatar}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{activeChat.name}</h2>
                <p className="text-[10px] text-muted-foreground font-mono">{activeChat.phone}</p>
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                WhatsApp Cloud API
              </span>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-end">
            <div className="space-y-4 max-h-full overflow-y-auto pr-2">
              {activeChat.messages.map(msg => {
                const isInbound = msg.direction === "inbound";
                return (
                  <div key={msg.id} className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[70%] rounded-xl px-4 py-2.5 shadow-sm text-sm relative ${
                      isInbound 
                        ? "bg-card text-foreground border border-border" 
                        : "bg-primary text-primary-foreground"
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className={`flex justify-end items-center gap-1 text-[9px] mt-1.5 ${
                        isInbound ? "text-muted-foreground" : "text-primary-foreground/75"
                      }`}>
                        <span>{msg.time}</span>
                        {!isInbound && (
                          <span>
                            {msg.status === "read" ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal-300"><path d="M2 12l5.25 5 10.75-10M8 12l5.25 5 10.75-10"/></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-card border-t border-border flex items-center gap-3">
            <input
              type="text"
              placeholder="Escribe una respuesta manual (anula la IA temporalmente)..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
