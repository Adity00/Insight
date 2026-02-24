"use client";

import React, { useState, useEffect } from 'react';
import { api, DashboardStats, Session } from '@/lib/api';
import { ChatWindow } from '@/components/ChatWindow';
import { KPICards } from '@/components/KPICards';
import {
  Sparkles, MessageSquare, Search, Plus, Menu, Moon, Sun, Bell,
  LayoutDashboard, Settings, MoreVertical, Pin, Briefcase, ChevronDown,
  Edit2, Trash2, Check, X
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

  // Click outside listener to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If clicking inside a dropdown or a trigger, don't close here
      if ((e.target as Element).closest('.dropdown-menu') || (e.target as Element).closest('.dropdown-trigger')) {
        return;
      }
      setOpenMenuId(null);
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
        const storedSession = localStorage.getItem("insightx_active_session");

        if (storedSession && sessionsList.some(msg => msg.session_id === storedSession)) {
          setSessionId(storedSession);
        } else {
          localStorage.removeItem("insightx_active_session");
          if (sessionsList.length === 0) {
            const { session_id } = await api.createSession();
            setSessionId(session_id);
            localStorage.setItem("insightx_active_session", session_id);
            // Refresh list after creation
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
  }, []);



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
                  <span className="text-[14px] font-[600] leading-tight text-[var(--text-primary)] tracking-tight whitespace-nowrap">Acme Corp</span>
                  <span className="text-[12px] text-[var(--text-muted)] font-[500] uppercase flex items-center gap-1">Admin <ChevronDown size={10} className="mt-[1px]" /></span>
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
                <input type="text" aria-label="Search" placeholder="Search conversations..." className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[8px] py-1.5 pl-9 pr-3 text-[14px] focus:outline-none focus:border-[var(--accent-solid)] transition-all placeholder-[var(--text-muted)] text-[var(--text-primary)] shadow-sm" />
              </div>
            )}

            <div className="flex flex-col gap-[4px]">
              {sidebarOpen && <p className="text-[12px] font-[500] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2 px-2 mt-2">Pinned</p>}
              <div className={`flex items-center justify-between rounded-[8px] transition-all p-2 hover:bg-[var(--bg-surface)] group cursor-pointer h-[40px] ${!sidebarOpen && 'justify-center'}`}>
                <div className="flex items-center gap-[12px] overflow-hidden">
                  <Pin size={14} className="text-[var(--accent-solid)] shrink-0" fill="currentColor" fillOpacity={0.2} />
                  {sidebarOpen && <span className="text-[14px] font-[400] text-[var(--text-primary)] truncate">Q3 Fraud Report</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[4px]">
              {sidebarOpen && <p className="text-[12px] font-[500] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2 px-2 mt-4">Recent</p>}

              {sessions.slice(0, 8).map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => {
                    if (session.session_id === sessionId) return;
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

          <div className="p-[16px] border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)]">
            <button aria-label="Settings" className={`flex items-center gap-[12px] w-full rounded-[8px] transition-all p-[8px] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] ${!sidebarOpen && 'justify-center'}`}>
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

            <div className="flex items-center gap-[16px]">
              {/* System Status Indicators */}
              <div className="hidden md:flex items-center gap-[24px] pr-[24px] border-r border-[var(--border-subtle)]">
                <div className="flex items-center gap-[8px] text-[12px] font-[600] text-[var(--success-text)] bg-[var(--success-bg)] px-[12px] py-[4px] rounded-full">
                  <div className="w-[6px] h-[6px] rounded-full bg-[var(--success-text)] animate-pulse"></div>
                  API Operational
                </div>

                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center justify-between text-[11px] font-[600] text-[var(--text-muted)] uppercase tracking-[0.04em] w-[120px]">
                    <span>API CALLS</span> <span>88%</span>
                  </div>
                  <div className="w-[120px] h-[4px] bg-[var(--border-subtle)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-solid)] rounded-full w-[88%]"></div>
                  </div>
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

                <div className="w-[36px] h-[36px] rounded-[8px] bg-accent-primary ml-2 shadow-[var(--shadow-sm)] flex items-center justify-center text-[var(--bg-surface)] text-[14px] font-[600] cursor-pointer hover:opacity-90 transition-opacity">
                  A
                </div>
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
    </div>
  );
}
