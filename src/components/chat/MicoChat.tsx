'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';

interface ActionLink {
  label: string;
  url: string;
  icon?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  actions?: ActionLink[];
}

const DEFAULT_QUICK_REPLIES_TR = [
  'Tekne Arıyorum ⛵',
  'İlan Vermek İstiyorum 📝',
  'Destek / Yardım 🛟',
  'Popüler Lokasyonlar 📍',
  'Tekne Ehliyeti (ADB) ⚓'
];

const DEFAULT_QUICK_REPLIES_EN = [
  'Looking for a Boat ⛵',
  'Post a Listing 📝',
  'Support & Help 🛟',
  'Popular Locations 📍',
  'Boat License (ADB) ⚓'
];

export default function MicoChat() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isEn = locale === 'en';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialGreeting = isEn
    ? "Ahoy Captain! ⚓ I'm Miço. I'm here to help you find your dream boat on satiliktekne.com, guide you through posting a listing, or answer any questions you have. Where are we setting our course today?"
    : "Selam kaptan! ⚓ Ben Miço. satiliktekne.com'da hayalindeki tekneyi bulmanda, ilan vermende veya aklına takılan her konuda sana yardımcı olmak için buradayım. Rotayı nereye çeviriyoruz?";

  // Initialize messages from sessionStorage or default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('mico_chat_history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {
          // ignore corrupted storage
        }
      }

      // Default first message
      const firstMsg: Message = {
        id: 'msg_welcome',
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: isEn ? DEFAULT_QUICK_REPLIES_EN : DEFAULT_QUICK_REPLIES_TR
      };
      setMessages([firstMsg]);

      // Trigger floating welcome bubble after 3 seconds if chat is closed
      const timer = setTimeout(() => {
        const bubbleDismissed = sessionStorage.getItem('mico_bubble_dismissed');
        if (!bubbleDismissed) {
          setShowWelcomeBubble(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [locale]);

  // Save messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      sessionStorage.setItem('mico_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      setShowWelcomeBubble(false);
      setUnreadCount(0);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mico_bubble_dismissed', 'true');
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/mico-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          locale
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMessage: Message = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: data.content || (isEn ? 'Got it, Captain!' : 'Anladım kaptan!'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: data.quickReplies || (isEn ? DEFAULT_QUICK_REPLIES_EN : DEFAULT_QUICK_REPLIES_TR),
          actions: data.actions
        };
        setMessages(prev => [...prev, botMessage]);
        if (!isOpen) {
          setUnreadCount(c => c + 1);
        }
      } else {
        throw new Error('API response not ok');
      }
    } catch (err) {
      const errorMessage: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: isEn
          ? 'Encountered a small wave on our course, Captain! Could you please repeat that?'
          : 'Rotada ufak bir dalgaya denk geldik kaptan! Sorunu tekrar iletebilir misin?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: isEn ? DEFAULT_QUICK_REPLIES_EN : DEFAULT_QUICK_REPLIES_TR
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    const firstMsg: Message = {
      id: 'msg_welcome',
      role: 'assistant',
      content: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: isEn ? DEFAULT_QUICK_REPLIES_EN : DEFAULT_QUICK_REPLIES_TR
    };
    setMessages([firstMsg]);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mico_chat_history');
    }
  };

  const handleActionClick = (url: string) => {
    if (url.startsWith('http') || url.startsWith('mailto:')) {
      window.open(url, '_blank');
    } else {
      router.push(url);
      // Close on mobile so user sees the page
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* ── 1. FLOATING LAUNCHER BUTTON ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px'
        }}
        className="mico-launcher-container"
      >
        {/* Floating Greeting Speech Bubble (Appears once) */}
        {!isOpen && showWelcomeBubble && (
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              color: 'var(--text-primary, #1e293b)',
              padding: '12px 16px',
              borderRadius: '16px 16px 4px 16px',
              boxShadow: '0 10px 25px -5px rgba(0, 102, 255, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 102, 255, 0.15)',
              maxWidth: '260px',
              fontSize: '0.86rem',
              lineHeight: '1.4',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              animation: 'slideInUp 0.3s ease-out',
              cursor: 'pointer'
            }}
            onClick={() => setIsOpen(true)}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>👋</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: 'var(--color-primary, #0066FF)', fontSize: '0.85rem' }}>
                Miço
              </div>
              <div style={{ marginTop: '2px', fontWeight: 600 }}>
                {isEn ? 'Captain, need any help with boats?' : 'Kaptan, teknelerle ilgili yardıma mı ihtiyacın var?'}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomeBubble(false);
                sessionStorage.setItem('mico_bubble_dismissed', 'true');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '0 2px'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Miço AI Asistan"
          title="Miço — satiliktekne.com Akıllı Asistanı"
          style={{
            position: 'relative',
            width: isOpen ? '54px' : '70px',
            height: isOpen ? '54px' : '70px',
            borderRadius: '50%',
            padding: 0,
            border: isOpen ? '2px solid rgba(255,255,255,0.9)' : 'none',
            background: isOpen ? 'linear-gradient(135deg, #0066FF 0%, #004099 100%)' : 'transparent',
            boxShadow: isOpen ? '0 8px 24px rgba(0, 102, 255, 0.4)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (!isOpen) e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            if (!isOpen) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isOpen ? (
            <span style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 700, transform: 'rotate(-90deg)' }}>✕</span>
          ) : (
            <>
              {/* Miço 3D Avatar Image with transparent drop-shadow */}
              <img
                src="/mico.png"
                alt="Miço"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 6px 14px rgba(0, 51, 153, 0.35))'
                }}
              />
              {/* Online Green Pulsing Indicator */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '14px',
                  height: '14px',
                  background: '#10b981',
                  borderRadius: '50%',
                  border: '2.5px solid #ffffff',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '-4px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* ── 2. CHAT DRAWER / WINDOW ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Miço Sohbet"
          style={{
            position: 'fixed',
            bottom: '98px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 120px)',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -10px rgba(0, 51, 153, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 102, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            overflow: 'hidden',
            animation: 'micoScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="mico-chat-window"
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #0047b3 0%, #0066FF 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0, 102, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.8)',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.15)',
                  flexShrink: 0
                }}
              >
                <img
                  src="/mico.png"
                  alt="Miço"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.2px' }}>
                    Miço
                  </span>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    AI ASİSTAN
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#34d399',
                      display: 'inline-block',
                      boxShadow: '0 0 6px #34d399'
                    }}
                  />
                  <span>satiliktekne.com • {isEn ? 'Online' : 'Çevrimiçi'}</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={handleClearChat}
                title={isEn ? 'Clear Chat' : 'Sohbeti Temizle'}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  transition: 'background 0.2s ease'
                }}
              >
                🗑️
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={isEn ? 'Minimize' : 'Kapat'}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 700,
                  transition: 'background 0.2s ease'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-body, #f8fafc)'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    maxWidth: '85%'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1.5px solid rgba(0, 102, 255, 0.2)',
                        background: 'rgba(0, 102, 255, 0.05)',
                        marginTop: '2px'
                      }}
                    >
                      <img src="/mico.png" alt="Miço" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  )}

                  <div
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #0066FF 0%, #0052cc 100%)'
                          : 'var(--bg-card, #ffffff)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary, #1e293b)',
                      padding: '12px 15px',
                      borderRadius:
                        msg.role === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      boxShadow:
                        msg.role === 'user'
                          ? '0 3px 8px rgba(0, 102, 255, 0.2)'
                          : '0 2px 6px rgba(0, 0, 0, 0.05)',
                      border: msg.role === 'assistant' ? '1px solid var(--border, #e2e8f0)' : 'none',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {renderFormattedContent(msg.content)}

                    {/* Action Buttons if any */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {msg.actions.map((act, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleActionClick(act.url)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: 'rgba(0, 102, 255, 0.08)',
                              color: 'var(--color-primary, #0066FF)',
                              border: '1px solid rgba(0, 102, 255, 0.2)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              textAlign: 'left',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 102, 255, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 102, 255, 0.08)'}
                          >
                            <span>{act.label}</span>
                            <span>→</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted, #94a3b8)',
                    marginTop: '3px',
                    padding: '0 6px'
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1.5px solid rgba(0, 102, 255, 0.2)',
                    background: 'rgba(0, 102, 255, 0.05)'
                  }}
                >
                  <img src="/mico.png" alt="Miço" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    border: '1px solid var(--border, #e2e8f0)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}
                >
                  <span className="mico-typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0066FF' }} />
                  <span className="mico-typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0066FF', animationDelay: '0.2s' }} />
                  <span className="mico-typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0066FF', animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Bar */}
          {messages.length > 0 && messages[messages.length - 1].quickReplies && (
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--bg-card, #ffffff)',
                borderTop: '1px solid var(--border, #e2e8f0)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none'
              }}
            >
              {messages[messages.length - 1].quickReplies?.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(qr)}
                  disabled={isTyping}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(0, 102, 255, 0.06)',
                    color: 'var(--color-primary, #0066FF)',
                    border: '1px solid rgba(0, 102, 255, 0.2)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: isTyping ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 102, 255, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 102, 255, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 14px',
              background: 'var(--bg-card, #ffffff)',
              borderTop: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isEn ? 'Type a message to Miço...' : "Miço'ya bir mesaj yazın..."}
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border, #cbd5e1)',
                background: 'var(--bg-body, #f8fafc)',
                color: 'var(--text-primary, #1e293b)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary, #0066FF)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #cbd5e1)'}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: 'none',
                background: inputValue.trim() && !isTyping ? 'var(--color-primary, #0066FF)' : 'var(--border, #cbd5e1)',
                color: '#ffffff',
                cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: inputValue.trim() ? '0 4px 10px rgba(0, 102, 255, 0.3)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes micoScaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .mico-typing-dot {
          animation: micoBlink 1.4s infinite both;
        }
        @keyframes micoBlink {
          0%, 80%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        @media (max-width: 768px) {
          .mico-launcher-container {
            bottom: 84px !important;
            right: 16px !important;
          }
          .mico-chat-window {
            bottom: 16px !important;
            right: 12px !important;
            left: 12px !important;
            width: auto !important;
            max-width: none !important;
            height: 75vh !important;
          }
        }
      `}</style>
    </>
  );
}

// Simple bold / bullet markdown renderer
function renderFormattedContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, lineIdx) => {
    // Process bold **text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={partIdx}>{part.slice(1, -1)}</em>;
          }
          return part;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
