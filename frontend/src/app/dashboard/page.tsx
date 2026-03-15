"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api, DashboardStats, Session } from '@/lib/api';
import { ChatWindow } from '@/components/ChatWindow';
import { KPICards } from '@/components/KPICards';
import {
  Sparkles, MessageSquare, Search, Plus, Menu, Moon, Sun, Bell,
  LayoutDashboard, Settings, MoreVertical, Pin, Briefcase, ChevronDown,
  Edit2, Trash2, Check, X, User, LogOut, Monitor, Database, Clock
} from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'dashboard'>('chat');
  const [showNotifications, setShowNotifications] = useState(false);

  // New states for chat management
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);

  // Profile dropdown state
  const [showProfile, setShowProfile] = useState(false);

  // Pinned sessions state (backed by localStorage)
  const [pinnedSessionIds, setPinnedSessionIds] = useState<string[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Load pinned sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pinned_session_ids');
    if (stored) {
      try {
        setPinnedSessionIds(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  // Persist pinned sessions to localStorage
  useEffect(() => {
    localStorage.setItem('pinned_session_ids', JSON.stringify(pinnedSessionIds));
  }, [pinnedSessionIds]);

  // Pin/unpin handler passed to ChatWindow
  const handlePinSession = useCallback((sid: string) => {
    setPinnedSessionIds(prev => {
      if (prev.includes(sid)) {
        return prev.filter(id => id !== sid);
      }
      return [...prev, sid];
    });
  }, []);

  // Click outside listener to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as Element).closest('.dropdown-menu') || (e.target as Element).closest('.dropdown-trigger')) {
        return;
      }
      setOpenMenuId(null);
      setShowProfile(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);


  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("insightx_active_session", sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    async function init() {
      try {
        const s = await api.getDashboard();
        setStats(s);

        const sessionsList = await api.getSessions();
        setSessions(sessionsList);

        // Always start with a fresh new chat
        const { session_id } = await api.createSession();
        setSessionId(session_id);
        localStorage.setItem("insightx_active_session", session_id);

        // Refresh sessions list to include the newly created one
        const updated = await api.getSessions();
        setSessions(updated);
      } catch (err) {
        console.error("Init failed:", err);
      }
    }
    init();
  }, []);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session => {
    if (!searchQuery.trim()) return true;
    const title = session.title || `Session ${session.turn_count > 0 ? `(${session.turn_count} turns)` : '(new)'}`;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Separate pinned and unpinned sessions
  const pinnedSessions = filteredSessions.filter(s => pinnedSessionIds.includes(s.session_id));
  const unpinnedSessions = filteredSessions.filter(s => !pinnedSessionIds.includes(s.session_id));

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <div className="flex-1 flex bg-app-custom text-[var(--text-primary)] transition-colors duration-300 relative overflow-hidden">

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col z-20`}>

          {/* Brand Header */}
          <div className="h-[64px] flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
            <div className={`flex items-center gap-[10px] ${!sidebarOpen && 'justify-center w-full'} cursor-pointer hover:opacity-90 transition-opacity overflow-hidden group py-2`}>
              <img src="/paytm-logo.png" alt="Logo" className="h-[16px] w-auto shrink-0 object-contain transition-transform group-hover:scale-105 duration-200" />
              {sidebarOpen && (
                <span className="animate-fade-in text-[20px] font-[800] tracking-[-0.03em] whitespace-nowrap" style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #06b6d4 70%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                  letterSpacing: '-0.5px',
                }}>
                  InsightX
                </span>
              )}
            </div>
            {sidebarOpen && (
              <button aria-label="Collapse Menu" onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-[8px] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] transition-all duration-200">
                <Menu size={18} />
              </button>
            )}
          </div>

          <div className="p-4 flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-5">
            <button
              onClick={async () => {
                try {
                  const { session_id } = await api.createSession();
                  setSessionId(session_id);
                  localStorage.setItem("insightx_active_session", session_id);
                  const updated = await api.getSessions();
                  setSessions(updated);
                } catch (err) {
                  console.error('New chat failed:', err);
                }
              }}
              className={`flex items-center gap-[8px] w-full bg-accent-primary hover:opacity-90 text-[var(--bg-surface)] rounded-[8px] transition-all duration-200 shadow-[var(--shadow-sm)] hover:translate-y-[-1px] hover:shadow-[var(--shadow-md)] active:scale-[0.98] ${sidebarOpen ? 'px-4 py-[10px]' : 'justify-center p-3'}`}
            >
              <Plus size={18} className="shrink-0" />
              {sidebarOpen && <span className="font-[600] text-[14px] truncate tracking-[-0.01em]">New Chat</span>}
            </button>

            {sidebarOpen && (
              <div className="relative group transition-all duration-200 mt-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  aria-label="Search"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[8px] py-1.5 pl-9 pr-3 text-[14px] focus:outline-none focus:border-[var(--accent-solid)] transition-all placeholder-[var(--text-muted)] text-[var(--text-primary)] shadow-sm"
                />
              </div>
            )}

            {/* Pinned Sessions */}
            {pinnedSessions.length > 0 && (
              <div className="flex flex-col gap-[4px]">
                {sidebarOpen && <p className="text-[12px] font-[500] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2 px-2 mt-2">Pinned</p>}
                {pinnedSessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => {
                      setSessionId(session.session_id);
                      localStorage.setItem("insightx_active_session", session.session_id);
                    }}
                    className={`flex items-center justify-between rounded-[8px] transition-all p-2 group cursor-pointer h-[40px] ${session.session_id === sessionId
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-solid)]'
                      : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      } ${!sidebarOpen && 'justify-center'}`}
                  >
                    <div className="flex items-center gap-[12px] overflow-hidden">
                      <Pin size={14} className="text-[var(--accent-solid)] shrink-0" fill="currentColor" fillOpacity={0.2} />
                      {sidebarOpen && <span className="text-[14px] font-[400] text-[var(--text-primary)] truncate">{session.title || `Session ${session.turn_count > 0 ? `(${session.turn_count} turns)` : '(new)'}`}</span>}
                    </div>
                    {sidebarOpen && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePinSession(session.session_id); }}
                        className="p-1 hover:bg-[var(--border-medium)] rounded text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all"
                        title="Unpin"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recent Sessions */}
            <div className="flex flex-col gap-[4px]">
              {sidebarOpen && <p className="text-[12px] font-[500] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2 px-2 mt-4">Recent</p>}

              {unpinnedSessions.slice(0, 8).map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => {
                    if (editingSessionId !== session.session_id) {
                      setSessionId(session.session_id);
                      localStorage.setItem("insightx_active_session", session.session_id);
                    }
                  }}
                  className={`flex items-center justify-between rounded-[8px] transition-all p-2 group cursor-pointer h-[40px] relative ${session.session_id === sessionId
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-solid)]'
                    : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                    } ${!sidebarOpen && 'justify-center'}`}
                >
                  <div className="flex items-center gap-[12px] overflow-hidden w-full">
                    <MessageSquare size={14} className="shrink-0" />
                    {sidebarOpen && (
                      editingSessionId === session.session_id ? (
                        <div className="flex items-center w-full gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                if (editTitle.trim() && editTitle.trim().length <= 60) {
                                  try {
                                    await api.renameSession(session.session_id, editTitle.trim());
                                    const updated = await api.getSessions();
                                    setSessions(updated);
                                    setEditingSessionId(null);
                                  } catch (err) {
                                    console.error("Rename failed", err);
                                  }
                                }
                              } else if (e.key === 'Escape') {
                                setEditingSessionId(null);
                              }
                            }}
                            className="bg-[var(--bg-app)] border border-[var(--border-strong)] rounded px-1.5 py-0.5 text-[13px] text-[var(--text-primary)] w-full focus:outline-none focus:border-[var(--accent-solid)]"
                          />
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            if (editTitle.trim() && editTitle.trim().length <= 60) {
                              try {
                                await api.renameSession(session.session_id, editTitle.trim());
                                const updated = await api.getSessions();
                                setSessions(updated);
                                setEditingSessionId(null);
                              } catch (err) {
                                console.error("Rename failed", err);
                              }
                            }
                          }} className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--success-text)] transition-colors">
                            <Check size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingSessionId(null); }} className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-muted)] transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[14px] font-[400] truncate max-w-[140px]">
                          {session.title || `Session ${session.turn_count > 0 ? `(${session.turn_count} turns)` : '(new)'}`}
                        </span>
                      )
                    )}
                  </div>

                  {sidebarOpen && editingSessionId !== session.session_id && session.session_id === sessionId && (
                    <div className="relative dropdown-container">
                      <button
                        className={`dropdown-trigger p-1 hover:bg-[var(--border-medium)] rounded text-[var(--text-muted)] transition-all pointer-events-auto ${openMenuId === session.session_id ? 'opacity-100 bg-[var(--border-medium)]' : 'opacity-0 group-hover:opacity-100'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(prev => prev === session.session_id ? null : session.session_id);
                        }}
                      >
                        <MoreVertical size={14} className="pointer-events-none" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === session.session_id && (
                        <div className="dropdown-menu absolute right-0 top-full mt-1 w-[160px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[8px] shadow-[var(--shadow-lg)] py-1 z-[1000] animate-fade-in origin-top-right pointer-events-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTitle(session.title || "");
                              setEditingSessionId(session.session_id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] flex items-center gap-2 transition-colors pointer-events-auto"
                          >
                            <Edit2 size={13} className="pointer-events-none" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinSession(session.session_id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] flex items-center gap-2 transition-colors pointer-events-auto"
                          >
                            <Pin size={13} className="pointer-events-none" />
                            {pinnedSessionIds.includes(session.session_id) ? 'Unpin' : 'Pin Chat'}
                          </button>
                          <div className="h-[1px] bg-[var(--border-subtle)] my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(session.session_id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--error-text)] hover:bg-[var(--bg-surface)] flex items-center gap-2 transition-colors pointer-events-auto"
                          >
                            <Trash2 size={13} className="pointer-events-none" />
                            Delete Chat
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[4px] mt-2 border-t border-[var(--border-subtle)] pt-4">
              {sidebarOpen && <p className="text-[12px] font-[500] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2 px-2">Views</p>}
              <button onClick={() => setViewMode('chat')} className={`flex items-center gap-[12px] rounded-[8px] h-[40px] transition-all p-2 ${viewMode === 'chat' ? 'bg-[var(--bg-surface)] text-[var(--accent-solid)]' : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'} group ${!sidebarOpen && 'justify-center'}`}>
                <MessageSquare size={16} className="shrink-0" />
                {sidebarOpen && <span className="text-[14px] font-[500] truncate">Chat Interface</span>}
              </button>
              <button onClick={() => setViewMode('dashboard')} className={`flex items-center gap-[12px] rounded-[8px] h-[40px] transition-all p-2 ${viewMode === 'dashboard' ? 'bg-[var(--bg-surface)] text-[var(--accent-solid)]' : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'} group ${!sidebarOpen && 'justify-center'}`}>
                <LayoutDashboard size={16} className="shrink-0" />
                {sidebarOpen && <span className="text-[14px] font-[500] truncate">Dashboard Board</span>}
              </button>
            </div>
          </div>

          <div className="p-[16px] border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)]">
            <button
              aria-label="Settings"
              onClick={() => setShowSettings(true)}
              className={`flex items-center gap-[12px] w-full rounded-[8px] transition-all p-[8px] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] ${!sidebarOpen && 'justify-center'}`}
            >
              <Settings size={18} className="shrink-0" />
              {sidebarOpen && <span className="text-[14px] font-[500]">Settings</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative h-screen bg-app-custom">

          <header className="h-[60px] flex items-center justify-between px-[24px] border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-[14px] sticky top-0 z-10 transition-colors duration-300">
            <div className="flex items-center gap-[16px]">
              {!sidebarOpen && (
                <button aria-label="Expand Menu" onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-[8px] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] transition-all duration-200">
                  <Menu size={18} />
                </button>
              )}
              <div className="flex items-center text-[14px] text-[var(--text-secondary)] animate-fade-in font-[400] cursor-default bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-[12px] py-[4px] rounded-[8px]">
                InsightX <span className="mx-2 text-[var(--border-medium)]">/</span>
                <span className="text-[var(--text-primary)] font-[500] flex items-center gap-1.5">
                  {viewMode === 'chat' ? <><MessageSquare size={14} /> Chat</> : <><LayoutDashboard size={14} /> Dashboard</>}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-[8px]">
              <button
                aria-label="Toggle Theme"
                onClick={() => setDarkMode(!darkMode)}
                className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] transition-all duration-200 hover:text-[var(--text-primary)]"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Alerts"
                  className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] transition-all duration-200 hover:text-[var(--text-primary)] relative"
                >
                  <Bell size={18} />
                  <span className="absolute top-[6px] right-[6px] w-[8px] h-[8px] rounded-full bg-[var(--error-text)] border-[2px] border-[var(--bg-surface)]"></span>
                </button>
                {/* Notification dropdown */}
                {showNotifications && (
                  <div className="absolute top-12 right-0 w-[300px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[12px] shadow-[var(--shadow-lg)] p-[12px] animate-fade-in z-50">
                    <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-[var(--border-subtle)]">
                      <span className="text-[12px] font-[600] uppercase tracking-[0.04em] text-[var(--text-muted)]">Notifications</span>
                      <button className="text-[12px] text-[var(--accent-solid)] hover:underline font-[500]">Mark all read</button>
                    </div>
                    <div className="p-3 hover:bg-app-custom rounded-[8px] cursor-pointer transition-colors">
                      <p className="text-[14px] text-[var(--text-primary)] font-[500] leading-tight mb-1">Weekly Report Generated</p>
                      <p className="text-[12px] text-[var(--text-muted)]">2 hours ago</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar with dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); }}
                  className="dropdown-trigger w-[36px] h-[36px] rounded-[8px] bg-accent-primary ml-2 shadow-[var(--shadow-sm)] flex items-center justify-center text-[var(--bg-surface)] text-[14px] font-[600] cursor-pointer hover:opacity-90 transition-opacity"
                >
                  A
                </button>
                {showProfile && (
                  <div className="dropdown-menu absolute top-12 right-0 w-[240px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[12px] shadow-[var(--shadow-lg)] animate-fade-in z-50 overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <div className="w-[40px] h-[40px] rounded-full bg-accent-primary flex items-center justify-center text-[var(--bg-surface)] text-[16px] font-[600]">A</div>
                        <div>
                          <p className="text-[14px] font-[600] text-[var(--text-primary)]">Admin User</p>
                          <p className="text-[12px] text-[var(--text-muted)]">admin@acmecorp.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[6px] flex items-center gap-2 transition-colors">
                        <User size={14} /> My Profile
                      </button>
                      <button
                        onClick={() => { setDarkMode(!darkMode); setShowProfile(false); }}
                        className="w-full text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[6px] flex items-center gap-2 transition-colors"
                      >
                        {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <button
                        onClick={() => { setShowSettings(true); setShowProfile(false); }}
                        className="w-full text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[6px] flex items-center gap-2 transition-colors"
                      >
                        <Settings size={14} /> Settings
                      </button>
                      <div className="h-[1px] bg-[var(--border-subtle)] my-1"></div>
                      <button className="w-full text-left px-3 py-2 text-[13px] text-[var(--error-text)] hover:bg-[var(--bg-surface)] rounded-[6px] flex items-center gap-2 transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Central Container */}
          <main className="flex-1 relative overflow-auto scrollbar-hide">
            {viewMode === 'chat' ? (
              sessionId ? (
                <ChatWindow
                  key={sessionId}
                  sessionId={sessionId}
                  stats={stats}
                  sidebarOpen={sidebarOpen}
                  pinnedSessionIds={pinnedSessionIds}
                  onPinSession={handlePinSession}
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center text-[var(--text-secondary)]">
                  <div className="flex flex-col items-center animate-fade-in">
                    <MessageSquare size={48} className="mb-4 text-[var(--border-strong)] opacity-60" />
                    <p className="text-[16px] font-[500] tracking-tight">Select a chat or create a new one</p>
                  </div>
                </div>
              )
            ) : (
              <div className="max-w-[1100px] mx-auto p-[32px] md:pt-[64px] animate-fade-in">
                <div className="flex justify-between items-end mb-[32px]">
                  <div>
                    <h2 className="text-[32px] font-[600] text-[var(--text-primary)] tracking-[-0.02em] leading-[40px] mb-2">Dashboard</h2>
                    <p className="text-[16px] text-[var(--text-secondary)] tracking-tight">A comprehensive overview of your transactions dataset</p>
                  </div>
                  <button className="h-[40px] px-[16px] rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[14px] font-[600] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex items-center gap-2 hover:translate-y-[-1px]">
                    <LayoutDashboard size={16} /> Customize Layout
                  </button>
                </div>
                <KPICards stats={stats} />
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-[var(--bg-elevated)] w-full max-w-[400px] rounded-[16px] shadow-[var(--shadow-2xl)] border border-[var(--border-subtle)] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-[48px] h-[48px] rounded-full bg-[var(--error-bg)] flex items-center justify-center text-[var(--error-text)] mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-[18px] font-[600] text-[var(--text-primary)] tracking-tight mb-2">Delete Chat Session?</h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                This action cannot be undone. All messages and visualizations in this session will be permanently deleted.
              </p>
            </div>
            <div className="px-6 py-4 bg-[var(--bg-sidebar)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
              <button
                disabled={isProcessing}
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-[14px] font-[500] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[8px] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={async () => {
                  if (isProcessing) return;
                  try {
                    setIsProcessing(true);
                    await api.deleteSession(showDeleteConfirm);
                    // Also remove from pinned if it was pinned
                    setPinnedSessionIds(prev => prev.filter(id => id !== showDeleteConfirm));
                    const updated = await api.getSessions();
                    setSessions(updated);

                    if (showDeleteConfirm === sessionId) {
                      if (updated.length > 0) {
                        const nextSession = updated[0].session_id;
                        setSessionId(nextSession);
                        localStorage.setItem("insightx_active_session", nextSession);
                      } else {
                        setSessionId("");
                        localStorage.removeItem("insightx_active_session");
                      }
                    }
                  } catch (err) {
                    console.error("Delete failed", err);
                  } finally {
                    setIsProcessing(false);
                    setShowDeleteConfirm(null);
                  }
                }}
                className={`px-4 py-2 text-[14px] font-[600] text-white bg-[var(--error-text)] hover:bg-red-600 rounded-[8px] transition-colors shadow-sm ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? 'Deleting...' : 'Delete Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="bg-[var(--bg-elevated)] w-full max-w-[480px] rounded-[16px] shadow-[var(--shadow-2xl)] border border-[var(--border-subtle)] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-[18px] font-[600] text-[var(--text-primary)] flex items-center gap-2"><Settings size={20} /> Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-[var(--bg-surface)] rounded-[8px] text-[var(--text-muted)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Monitor size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-[500] text-[var(--text-primary)]">Appearance</p>
                    <p className="text-[12px] text-[var(--text-muted)]">{darkMode ? 'Dark' : 'Light'} mode</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-[44px] h-[24px] rounded-full transition-colors duration-200 relative ${darkMode ? 'bg-[var(--accent-solid)]' : 'bg-[var(--border-medium)]'}`}
                >
                  <div className={`w-[20px] h-[20px] rounded-full bg-white shadow-sm absolute top-[2px] transition-transform duration-200 ${darkMode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                </button>
              </div>

              {/* Session Memory */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-[500] text-[var(--text-primary)]">Session Memory</p>
                    <p className="text-[12px] text-[var(--text-muted)]">Conversation context window</p>
                  </div>
                </div>
                <span className="text-[14px] font-[600] text-[var(--text-primary)] bg-[var(--bg-surface)] px-3 py-1 rounded-[6px]">8 turns</span>
              </div>

              {/* Data Source */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Database size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-[500] text-[var(--text-primary)]">Data Source</p>
                    <p className="text-[12px] text-[var(--text-muted)]">UPI Transactions 2024</p>
                  </div>
                </div>
                <span className="text-[12px] font-[600] text-[var(--success-text)] bg-[var(--success-bg)] px-3 py-1 rounded-full">Connected</span>
              </div>

              {/* Model */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-[500] text-[var(--text-primary)]">AI Model</p>
                    <p className="text-[12px] text-[var(--text-muted)]">Primary inference engine</p>
                  </div>
                </div>
                <span className="text-[14px] font-[600] text-[var(--text-primary)] bg-[var(--bg-surface)] px-3 py-1 rounded-[6px]">GPT-4</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-[var(--bg-sidebar)] border-t border-[var(--border-subtle)] flex justify-end">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-[14px] font-[500] bg-accent-primary text-[var(--bg-surface)] rounded-[8px] hover:opacity-90 transition-opacity shadow-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
