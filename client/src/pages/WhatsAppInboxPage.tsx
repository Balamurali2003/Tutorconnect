import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppConversation, WhatsAppMessage, WhatsAppTemplate } from '../types';
import {
  fetchWhatsAppConversations,
  fetchWhatsAppConversationMessages,
  markWhatsAppConversationRead,
  sendWhatsAppMessage,
  fetchWhatsAppTemplates
} from '../services/api';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  Search,
  Send,
  Check,
  CheckCheck,
  Clock,
  User,
  Phone,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const WhatsAppInboxPage: React.FC = () => {
  const { setSelectedTutorId, addToast } = useApp();
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async (keepSelection = true) => {
    try {
      const res = await fetchWhatsAppConversations();
      if (res.success) {
        setConversations(res.conversations || []);
        if (!selectedContactId && res.conversations.length > 0 && !keepSelection) {
          selectConversation(res.conversations[0].contactId);
        }
      }
    } catch (err: any) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await fetchWhatsAppTemplates();
      setTemplates(res.templates || []);
    } catch (err) {
      console.error('Failed to load templates', err);
    }
  };

  const selectConversation = async (contactId: string) => {
    setSelectedContactId(contactId);
    setLoadingMessages(true);
    try {
      const res = await fetchWhatsAppConversationMessages(contactId);
      if (res.success) {
        setMessages(res.messages || []);
        setTimeout(scrollToBottom, 100);
      }
      // Mark as read
      await markWhatsAppConversationRead(contactId);
      // Update local unread badge
      setConversations((prev) =>
        prev.map((c) => (c.contactId === contactId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err: any) {
      addToast('error', 'Error', 'Failed to load conversation messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations(false);
    loadTemplates();
  }, []);

  // Poll for live messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);
      if (selectedContactId) {
        fetchWhatsAppConversationMessages(selectedContactId).then((res) => {
          if (res.success) {
            setMessages(res.messages || []);
          }
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedContactId]);

  const activeConv = conversations.find((c) => c.contactId === selectedContactId);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeConv || sending) return;

    setSending(true);
    try {
      const res = await sendWhatsAppMessage({
        tutorId: activeConv.tutorId || undefined,
        phone: activeConv.phoneNumber,
        message: replyText
      });

      if (res.success) {
        setReplyText('');
        // Immediately fetch updated message thread
        const updated = await fetchWhatsAppConversationMessages(activeConv.contactId);
        if (updated.success) {
          setMessages(updated.messages || []);
          setTimeout(scrollToBottom, 100);
        }
        loadConversations(true);
      } else {
        addToast('error', 'Send Failed', res.message || 'Failed to dispatch WhatsApp message');
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Transmission error');
    } finally {
      setSending(false);
    }
  };

  const handleApplyTemplate = (tmpl: WhatsAppTemplate) => {
    if (!activeConv) return;
    let content = tmpl.content;
    content = content.split('{{tutor_name}}').join(activeConv.tutorName);
    content = content.split('{{phone_number}}').join(activeConv.phoneNumber);
    content = content.split('{{interview_date}}').join('08 Sep 2026');
    content = content.split('{{interview_time}}').join('10:00 AM');
    content = content.split('{{demo_date}}').join('10 Sep 2026');
    content = content.split('{{demo_time}}').join('05:00 PM');
    content = content.split('{{subject}}').join('Mathematics');
    content = content.split('{{student_name}}').join('Standard 10 Student');
    setReplyText(content);
    setShowTemplatePicker(false);
  };

  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.tutorName && c.tutorName.toLowerCase().includes(q)) ||
      (c.phoneNumber && c.phoneNumber.includes(q)) ||
      (c.lastMessageText && c.lastMessageText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between bg-white px-6 py-3.5 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">WhatsApp Conversation Hub</h2>
            <p className="text-[11px] text-slate-400">Live two-way communication linked with Tutor Profiles</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live Real-time Sync Active
          </span>
          <button
            onClick={() => loadConversations(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh Conversations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Window */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex min-h-0">
        {/* Left Side: Conversation List */}
        <div className="w-80 sm:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidates or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No conversations found.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.contactId === selectedContactId;
                return (
                  <button
                    key={conv.contactId}
                    onClick={() => selectConversation(conv.contactId)}
                    className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors relative ${
                      isSelected ? 'bg-emerald-50/80 border-r-4 border-emerald-600' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {conv.tutorName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">{conv.tutorName}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                          {conv.lastMessageTime
                            ? new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 truncate block">
                          {conv.lastMessageDirection === 'OUTBOUND' && 'You: '}
                          {conv.lastMessageText}
                        </span>

                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0 ml-1.5 shadow-sm">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        {conv.phoneNumber}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Chat Window */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#EFEAE2]/30">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {activeConv.tutorName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{activeConv.tutorName}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeConv.whatsappOptIn === 'YES'
                            ? 'bg-emerald-100 text-emerald-800'
                            : activeConv.whatsappOptIn === 'NO'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Opt-in: {activeConv.whatsappOptIn}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {activeConv.phoneNumber}
                    </span>
                  </div>
                </div>

                {activeConv.tutorId && (
                  <button
                    onClick={() => setSelectedTutorId(activeConv.tutorId!)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Message Bubbles Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {loadingMessages ? (
                  <div className="text-center py-12 text-xs text-slate-400">Loading message thread...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No messages in this conversation yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">Send a message below to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOutbound = msg.direction === 'OUTBOUND';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                            isOutbound
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-none'
                          }`}
                        >
                          {msg.templateName && (
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${
                                isOutbound ? 'text-emerald-200' : 'text-slate-400'
                              }`}
                            >
                              Template: {msg.templateName}
                            </span>
                          )}

                          <div className="whitespace-pre-wrap">{msg.messageText}</div>

                          <div
                            className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                              isOutbound ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>

                            {isOutbound && (
                              <span title={`Status: ${msg.status}`}>
                                {msg.status === 'READ' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-200 inline" />
                                ) : msg.status === 'DELIVERED' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-white/80 inline" />
                                ) : msg.status === 'SENT' ? (
                                  <Check className="w-3.5 h-3.5 text-white/70 inline" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-200 inline" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Composer Box */}
              <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 relative">
                {/* Template Popover Selector */}
                {showTemplatePicker && (
                  <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-20 max-h-64 overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        Choose Message Template
                      </span>
                      <button
                        onClick={() => setShowTemplatePicker(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 font-bold"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {templates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleApplyTemplate(t)}
                          className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl text-xs transition-colors border border-transparent hover:border-slate-200"
                        >
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.content}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                    className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    title="Insert Template"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Type message to ${activeConv.tutorName} (Press Enter to send)...`}
                    className="flex-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none resize-none transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Sending...' : 'Send'}</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-base font-bold text-slate-700">Select a Conversation</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Choose a candidate from the left list to inspect chat history and reply via WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
