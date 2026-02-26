"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, DashboardStats, Session } from '@/lib/api';
import { ChatWindow } from '@/components/ChatWindow';
import { KPICards } from '@/components/KPICards';
import { useAuth } from '@/lib/auth';
import {
  MessageSquare, Search, Plus, Menu, Moon, Sun,
  LayoutDashboard, MoreVertical, Briefcase, ChevronDown,
  Edit2, Trash2, Check, X, LogOut
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'dashboard'>('chat');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Chat management states
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // User-scoped localStorage key
  const sessionKey = user ? `insightx_session_${user.id}` : null;

  // ── Auth Guard ──
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // ── Close user menu on outside click ──
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      // Close session dropdown if clicking outside
      if (!(e.target as Element).closest('.dropdown-menu') && !(e.target as Element).closest('.dropdown-trigger')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Get user initials
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    router.replace('/');
  };

  // ── Persist active session (user-scoped) ──
  useEffect(() => {
    if (sessionId && sessionKey) {
      localStorage.setItem(sessionKey, sessionId);
    }
  }, [sessionId, sessionKey]);

  // ── Load dashboard data ONLY after auth is confirmed ──
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    async function init() {
      try {
        const s = await api.getDashboard();
        setStats(s);

        const sessionsList = await api.getSessions();
        const storedSession = sessionKey ? localStorage.getItem(sessionKey) : null;

        if (storedSession && sessionsList.some(msg => msg.session_id === storedSession)) {
          setSessionId(storedSession);
        } else {
          if (sessionKey) localStorage.removeItem(sessionKey);
          if (sessionsList.length === 0) {
            const { session_id } = await api.createSession();
            setSessionId(session_id);
            if (sessionKey) localStorage.setItem(sessionKey, session_id);
            const newList = await api.getSessions();
            setSessions(newList);
            return;
          }
        }
        setSessions(sessionsList);
      } catch (err) {
        console.error("Init failed:", err);
      }
    }
    init();
  }, [isAuthenticated, user, sessionKey]);

  // Filter sessions by search
  const filteredSessions = sessions.filter(s =>
    !searchQuery || (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auth loading state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-[13px] text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <div className="flex-1 flex bg-app-custom text-[var(--text-primary)] transition-colors duration-300 relative overflow-hidden">

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col z-20`}>

          {/* Workspace Switcher */}
          <div className="h-[64px] flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
            <div className={`flex items-center gap-[12px] ${!sidebarOpen && 'justify-center w-full'} cursor-pointer hover:opacity-80 transition-opacity overflow-hidden group py-2`}>
              <div className="w-[32px] h-[32px] rounded-[8px] bg-accent-primary flex items-center justify-center text-[var(--bg-surface)] shrink-0 shadow-[var(--shadow-sm)] transition-transform group-hover:scale-105 duration-200">
                <Briefcase size={16} />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col animate-fade-in text-left">
                  <span className="text-[14px] font-[600] leading-tight text-[var(--text-primary)] tracking-tight whitespace-nowrap">{user?.name || 'Workspace'}</span>
                  <span className="text-[12px] text-[var(--text-muted)] font-[500] uppercase flex items-center gap-1">Analyst <ChevronDown size={10} className="mt-[1px]" /></span>
                </div>
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
                  if (sessionKey) localStorage.setItem(sessionKey, session_id);
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

            <div className="flex flex-col gap-[4px]">
              {sidebarOpen && <p className="text-[12px] font-[500] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2 px-2 mt-2">Recent</p>}

              {filteredSessions.slice(0, 8).map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => {
                    if (session.session_id === sessionId) return;
                    if (editingSessionId !== session.session_id) {
                      setSessionId(session.session_id);
                      if (sessionKey) localStorage.setItem(sessionKey, session.session_id);
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

                      {openMenuId === session.session_id && (
                        <div className="dropdown-menu absolute right-0 top-full mt-1 w-[140px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[8px] shadow-[var(--shadow-lg)] py-1 z-[1000] animate-fade-in origin-top-right pointer-events-auto">
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

              {/* User Avatar + Dropdown */}
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-[36px] h-[36px] rounded-[8px] bg-accent-primary shadow-[var(--shadow-sm)] flex items-center justify-center text-[var(--bg-surface)] text-[13px] font-[700] cursor-pointer hover:opacity-90 transition-opacity"
                  aria-label="User menu"
                >
                  {userInitials}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-[44px] w-[220px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[12px] shadow-[var(--shadow-lg)] py-1.5 z-50 animate-fade-in origin-top-right">
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                      <p className="text-[14px] font-[600] text-[var(--text-primary)] truncate">{user?.name}</p>
                      <p className="text-[12px] text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setShowUserMenu(false); setViewMode('dashboard'); }}
                        className="w-full text-left px-4 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutDashboard size={14} className="text-[var(--text-muted)]" />
                        Dashboard
                      </button>
                    </div>
                    <div className="border-t border-[var(--border-subtle)] pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-[13px] text-[var(--error-text)] hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
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
                <ChatWindow key={sessionId} sessionId={sessionId} stats={stats} />
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
                    const updated = await api.getSessions();
                    setSessions(updated);

                    if (showDeleteConfirm === sessionId) {
                      if (updated.length > 0) {
                        const nextSession = updated[0].session_id;
                        setSessionId(nextSession);
                        if (sessionKey) localStorage.setItem(sessionKey, nextSession);
                      } else {
                        setSessionId("");
                        if (sessionKey) localStorage.removeItem(sessionKey);
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
    </div>
  );
}
