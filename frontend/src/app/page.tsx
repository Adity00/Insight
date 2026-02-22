"use client";

import React, { useState, useEffect } from 'react';
import { api, DashboardStats, Session } from '@/lib/api';
import { ChatWindow } from '@/components/ChatWindow';
import { KPICards } from '@/components/KPICards';
import {
  Sparkles, MessageSquare, Search, Plus, Menu, Moon, Sun, Bell,
  LayoutDashboard, Settings, MoreVertical, Pin, Briefcase, ChevronDown
} from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'dashboard'>('chat');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const s = await api.getDashboard();
        setStats(s);
        const { session_id } = await api.createSession();
        setSessionId(session_id);
        const sessionsList = await api.getSessions();
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
                  onClick={() => setSessionId(session.session_id)}
                  className={`flex items-center justify-between rounded-[8px] transition-all p-2 group cursor-pointer h-[40px] ${
                    session.session_id === sessionId
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-solid)]'
                      : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                  } ${!sidebarOpen && 'justify-center'}`}
                >
                  <div className="flex items-center gap-[12px] overflow-hidden w-full">
                    <MessageSquare size={14} className="shrink-0" />
                    {sidebarOpen && (
                      <span className="text-[14px] font-[400] truncate max-w-[140px]">
                        {session.title || `Session ${session.turn_count > 0 ? `(${session.turn_count} turns)` : '(new)'}`}
                      </span>
                    )}
                  </div>
                  {sidebarOpen && session.session_id === sessionId && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await api.deleteSession(session.session_id);
                        const updated = await api.getSessions();
                        setSessions(updated);
                        if (session.session_id === sessionId) {
                          const { session_id } = await api.createSession();
                          setSessionId(session_id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--border-medium)] rounded text-[var(--text-muted)] transition-all"
                    >
                      <MoreVertical size={14} />
                    </button>
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
              <ChatWindow sessionId={sessionId} stats={stats} />
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
    </div>
  );
}
