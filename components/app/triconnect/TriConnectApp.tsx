"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import LandingPage from "./LandingPage";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/components/providers/AuthProvider";


interface Todo { id: string; text: string; status: "todo" | "in_progress" | "done" }
interface Message { id: string; text: string; isUser: boolean; timestamp: Date }
interface Project { id: string; name: string }
interface MockFile { name: string; path: string; lang: string; content: string }

const initialTodos: Todo[] = [
  { id: "1", text: "Set up project structure", status: "done" },
  { id: "2", text: "Configure routing", status: "done" },
  { id: "3", text: "Build main components", status: "in_progress" },
  { id: "4", text: "Add responsive styles", status: "todo" },
  { id: "5", text: "Deploy to production", status: "todo" },
];

const mockFiles: MockFile[] = [
  { name: "App.tsx", path: "src/App.tsx", lang: "tsx", content: `import React from 'react';\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport Index from './pages/Index';\nimport Chat from './pages/Chat';\n\nconst App = () => (\n  <BrowserRouter>\n    <Routes>\n      <Route path="/" element={<Index />} />\n      <Route path="/chat" element={<Chat />} />\n    </Routes>\n  </BrowserRouter>\n);\n\nexport default App;` },
  { name: "index.css", path: "src/index.css", lang: "css", content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --background: 220 15% 8%;\n  --foreground: 0 0% 95%;\n  --primary: 32 95% 55%;\n}\n\nbody {\n  font-family: 'Inter', sans-serif;\n  background: hsl(var(--background));\n  color: hsl(var(--foreground));\n}` },
  { name: "package.json", path: "package.json", lang: "json", content: `{\n  "name": "triconnect",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "framer-motion": "^12.34.0",\n    "tailwindcss": "^3.4.0"\n  }\n}` },
];

const mockTree = [
  { name: "src", type: "folder" as const, children: [
    { name: "components", type: "folder" as const, children: [
      { name: "Navbar.tsx", type: "file" as const, path: "src/components/Navbar.tsx" },
      { name: "Footer.tsx", type: "file" as const, path: "src/components/Footer.tsx" },
    ]},
    { name: "pages", type: "folder" as const, children: [
      { name: "Index.tsx", type: "file" as const, path: "src/pages/Index.tsx" },
      { name: "Chat.tsx", type: "file" as const, path: "src/pages/Chat.tsx" },
    ]},
    { name: "App.tsx", type: "file" as const, path: "src/App.tsx" },
    { name: "index.css", type: "file" as const, path: "src/index.css" },
  ]},
  { name: "package.json", type: "file" as const, path: "package.json" },
  { name: "tailwind.config.ts", type: "file" as const, path: "tailwind.config.ts" },
];

function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

export default function TriConnectApp() {
  const { user } = useAuth();
  const [page, setPage] = useState<"landing" | "chat">("landing");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [todosCollapsed, setTodosCollapsed] = useState(false);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [fileTreeOpen, setFileTreeOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [openTabs, setOpenTabs] = useState<MockFile[]>([mockFiles[0]]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const [chatInput, setChatInput] = useState("");
  const [todoInput, setTodoInput] = useState("");
  const [typing, setTyping] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const todosDone = todos.filter(t => t.status === "done").length;
  const todoPct = todos.length ? Math.round(todosDone / todos.length * 100) : 0;

  function genId() { return Math.random().toString(36).slice(2, 10); }

  function enterChat(msg?: string) {
    if (msg) {
      const pid = genId();
      const name = msg.slice(0, 40) + (msg.length > 40 ? "..." : "");
      setProjects(prev => [{ id: pid, name }, ...prev]);
      setActiveProjectId(pid);
      setMessages([{ id: genId(), text: msg, isUser: true, timestamp: new Date() }]);
      simulateAI();
    }
    setPage("chat");
  }

  function sendMessage() {
    const text = chatInput.trim(); if (!text) return;
    if (!activeProjectId) {
      const pid = genId();
      const name = text.slice(0, 40) + (text.length > 40 ? "..." : "");
      setProjects(prev => [{ id: pid, name }, ...prev]);
      setActiveProjectId(pid);
    }
    const userMsg: Message = { id: genId(), text, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    callAI([...messages, userMsg]);
  }

  const callAI = useCallback(async (chatHistory: Message[]) => {
    setTyping(true);
    try {
      const apiMessages = chatHistory.map(m => ({
        role: m.isUser ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          id: genId(),
          text: `⚠️ AI Error: ${data.error}. The free Hugging Face model may be loading — please try again in a few seconds.`,
          isUser: false,
          timestamp: new Date(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: genId(),
          text: data.response || "I couldn't generate a response. Please try again.",
          isUser: false,
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: genId(),
        text: "⚠️ Network error — couldn't reach the AI. Please check your connection and try again.",
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setTyping(false);
    }
  }, [messages]);

  function cycleTodo(id: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "todo" ? "in_progress" : t.status === "in_progress" ? "done" : "todo" } : t));
  }

  function openFile(path: string) {
    const idx = openTabs.findIndex(t => t.path === path);
    if (idx >= 0) { setActiveTabIdx(idx); } else {
      const f = mockFiles.find(x => x.path === path);
      if (f) { setOpenTabs(prev => [...prev, f]); setActiveTabIdx(openTabs.length); }
    }
    if (view !== "code") setView("code");
  }

  function closeTab(i: number) {
    setOpenTabs(prev => { const n = [...prev]; n.splice(i, 1); return n; });
    if (activeTabIdx >= openTabs.length - 1) setActiveTabIdx(Math.max(0, openTabs.length - 2));
  }

  const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ===== Render helpers =====
  function renderTreeNode(node: any, depth: number): React.ReactNode {
    if (node.type === "folder") {
      return (
        <details key={node.name + depth} open>
          <summary className="tc-tree-item" style={{ paddingLeft: depth * 12 + 4 }}>
            <span style={{ fontSize: 12, color: "hsl(32 95% 55%/.7)" }}>📁</span>
            <span>{node.name}</span>
          </summary>
          {node.children?.map((c: any) => renderTreeNode(c, depth + 1))}
        </details>
      );
    }
    return (
      <button key={node.path} className="tc-tree-item" style={{ paddingLeft: depth * 12 + 16 }} onClick={() => openFile(node.path)}>
        <span style={{ fontSize: 10 }}>📄</span>
        <span>{node.name}</span>
      </button>
    );
  }

  const statusIcons: Record<string, string> = { todo: "○", in_progress: "◔", done: "✓" };
  const statusColors: Record<string, string> = { todo: "hsl(var(--muted-fg))", in_progress: "hsl(var(--primary))", done: "hsl(142 71% 45%)" };
  const statusBg: Record<string, string> = { todo: "tc-status-todo", in_progress: "tc-status-progress", done: "tc-status-done" };
  const statusLabels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", done: "Done" };

  // ==================== LANDING PAGE ====================
  if (page === "landing") return <LandingPage onEnterChat={enterChat} />;

  // ==================== CHAT PAGE ====================
  return (
    <div className="tc-chat-workspace">
      {/* Sidebar */}
      <aside className={`tc-chat-sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
        <div style={{ padding: 12, borderBottom: "1px solid hsl(var(--border))" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="pulse-glow" style={{ width: 10, height: 10, borderRadius: "50%", background: "hsl(32 95% 55%)" }} />
              <span style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 700, color: "hsl(var(--fg))" }}>TriConnect</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="neu-btn" style={{ padding: 4, borderRadius: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220 10% 55%)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          </div>
          <button onClick={() => { setActiveProjectId(null); setMessages([]); }} className="neu-btn-primary glossy" style={{ width: "100%", padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Project
          </button>
        </div>
        <div className="tc-scrollbar" style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", color: "hsl(var(--muted-fg))", fontWeight: 500, padding: "8px 8px", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Recent
          </div>
          {projects.length === 0 && <p style={{ fontSize: 12, color: "hsl(var(--muted-fg))", padding: "16px 8px", textAlign: "center", opacity: .6 }}>No projects yet</p>}
          {projects.map(p => (
            <div key={p.id} onClick={() => setActiveProjectId(p.id)} className={activeProjectId === p.id ? "neu-input" : ""} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, color: activeProjectId === p.id ? "hsl(var(--fg))" : "hsl(var(--muted-fg))" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.name}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid hsl(var(--border))" }}>
          <button onClick={() => setPage("landing")} className="neu-btn" style={{ width: "100%", padding: "8px 0", borderRadius: 8, fontSize: 12, color: "hsl(var(--muted-fg))", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            Back to Home
          </button>
        </div>
      </aside>

      {/* Chat Panel */}
      <div className="tc-chat-panel">
        <div className="glass" style={{ borderBottom: "1px solid hsl(var(--border))", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="neu-btn" style={{ padding: 4, borderRadius: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220 10% 55%)" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </button>}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <h1 style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 600, color: "hsl(var(--fg))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {projects.find(p => p.id === activeProjectId)?.name || "New Project"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "hsl(var(--muted-fg))" }}>
              <span className="pulse-glow-green" style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(142 71% 45%)", display: "inline-block" }} />Online
            </div>
            <UserAvatar size={28} />
          </div>
        </div>

        {/* Todo panel */}
        <div style={{ padding: "12px 12px 0" }}>
          <div className="neu-card-static" style={{ padding: 12, marginBottom: 12 }}>
            <button onClick={() => setTodosCollapsed(!todosCollapsed)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", fontSize: 12, fontWeight: 600, color: "hsl(var(--fg))", marginBottom: todosCollapsed ? 0 : 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points={todosCollapsed ? "9 18 15 12 9 6" : "6 9 12 15 18 9"} /></svg>
                <span>Tasks</span>
                <span style={{ color: "hsl(var(--muted-fg))", fontWeight: 400 }}>{todosDone}/{todos.length}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="tc-progress-track"><div className="tc-progress-fill" style={{ width: `${todoPct}%` }} /></div>
                <span style={{ fontSize: 10, color: "hsl(var(--muted-fg))" }}>{todoPct}%</span>
              </div>
            </button>
            {!todosCollapsed && (
              <>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  <input placeholder="Add task..." className="neu-input" style={{ padding: "4px 8px", fontSize: 12, borderRadius: 6, flex: 1 }} value={todoInput} onChange={e => setTodoInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && todoInput.trim()) { setTodos(prev => [...prev, { id: genId(), text: todoInput.trim(), status: "todo" }]); setTodoInput(""); } }} />
                  <button onClick={() => { if (todoInput.trim()) { setTodos(prev => [...prev, { id: genId(), text: todoInput.trim(), status: "todo" }]); setTodoInput(""); } }} className="neu-btn" style={{ padding: 4, borderRadius: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(220 10% 55%)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                </div>
                {(["in_progress", "todo", "done"] as const).map(s => {
                  const items = todos.filter(t => t.status === s);
                  if (!items.length) return null;
                  return (
                    <div key={s} style={{ marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: statusColors[s] }}>{statusIcons[s]}</span>
                        <span style={{ fontSize: 10, color: "hsl(var(--muted-fg))", textTransform: "uppercase", letterSpacing: ".05em" }}>{statusLabels[s]}</span>
                      </div>
                      {items.map(t => (
                        <div key={t.id} className={statusBg[s]} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 6, fontSize: 12, marginBottom: 2 }}>
                          <button onClick={() => cycleTodo(t.id)} style={{ color: statusColors[s], fontSize: 14, lineHeight: 1 }}>{statusIcons[s]}</button>
                          <span style={{ flex: 1, textDecoration: s === "done" ? "line-through" : "none", color: s === "done" ? "hsl(var(--muted-fg))" : "hsl(var(--fg))" }}>{t.text}</span>
                          <button onClick={() => setTodos(prev => prev.filter(x => x.id !== t.id))} style={{ padding: 1, color: "hsl(var(--muted-fg))", opacity: 0.3 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="tc-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 12px 8px" }}>
          {messages.length === 0 && !typing && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "0 16px" }}>
              <div className="neu-card-static" style={{ padding: 16, marginBottom: 16, display: "inline-block" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(32 95% 55%)" strokeWidth="2"><path d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" /></svg>
              </div>
              <h2 style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 700, color: "hsl(var(--fg))", marginBottom: 4 }}>What will you <span className="text-gradient-warm" style={{ fontStyle: "italic" }}>build</span>?</h2>
              <p style={{ fontSize: 12, color: "hsl(var(--muted-fg))", maxWidth: 260 }}>Describe your idea and AI will help create it.</p>
            </div>
          )}
          {messages.map(m => m.isUser ? (
            <div key={m.id} className="fade-in" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <div className="neu-btn-primary tc-msg-bubble" style={{ maxWidth: "85%" }}>{m.text}<div className="tc-msg-time" style={{ color: "hsl(var(--primary-fg)/.5)" }}>{fmtTime(m.timestamp)}</div></div>
            </div>
          ) : (
            <div key={m.id} className="fade-in" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div className="neu-btn" style={{ padding: 4, borderRadius: 8, flexShrink: 0, height: "fit-content", marginTop: 2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(32 95% 55%)" strokeWidth="2"><path d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" /></svg>
              </div>
              <div className="neu-card-static tc-msg-bubble">{m.text}<div className="tc-msg-time" style={{ color: "hsl(var(--muted-fg))" }}>{fmtTime(m.timestamp)}</div></div>
            </div>
          ))}
          {typing && (
            <div className="fade-in" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div className="neu-btn" style={{ padding: 4, borderRadius: 8, flexShrink: 0, height: "fit-content" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(32 95% 55%)" strokeWidth="2"><path d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" /></svg>
              </div>
              <div className="neu-card-static" style={{ borderRadius: 12, padding: "8px 12px" }}>
                <div className="tc-typing-dots" style={{ display: "flex", gap: 4 }}><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: "1px solid hsl(var(--border))", padding: 8 }}>
          <div className="neu-card-static" style={{ padding: 8 }}>
            <textarea rows={2} placeholder="Describe what you want to build..." value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{ width: "100%", background: "transparent", outline: "none", fontSize: 12, color: "hsl(0 0% 95%)", resize: "none", border: "none", marginBottom: 6 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button className="neu-btn" style={{ padding: 4, borderRadius: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220 10% 55%)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <button onClick={sendMessage} className="neu-btn-primary glossy" style={{ padding: "4px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                Send
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code/Preview Panel */}
      <div className="tc-code-panel">
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--bg))" }}>
          <div className="tc-code-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => setView("code")} className={`neu-btn${view === "code" ? "-primary" : ""}`} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>Code
              </button>
              <button onClick={() => setView("preview")} className={`neu-btn${view === "preview" ? "-primary" : ""}`} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>Preview
              </button>
            </div>
            {view === "preview" && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => setDevice("desktop")} style={{ padding: 4, borderRadius: 4, color: device === "desktop" ? "hsl(var(--primary))" : "hsl(var(--muted-fg))" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </button>
                <button onClick={() => setDevice("mobile")} style={{ padding: 4, borderRadius: 4, color: device === "mobile" ? "hsl(var(--primary))" : "hsl(var(--muted-fg))" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            {view === "preview" ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "hsl(var(--secondary)/.1)" }}>
                {device === "desktop" ? (
                  <div style={{ width: "100%", height: "100%" }}>
                    <div className="tc-browser-frame">
                      <div className="tc-browser-chrome">
                        <div style={{ display: "flex", gap: 4 }}>
                          <span className="tc-browser-dot" style={{ background: "hsl(0 72% 51%/.6)" }} />
                          <span className="tc-browser-dot" style={{ background: "hsl(48 96% 53%/.6)" }} />
                          <span className="tc-browser-dot" style={{ background: "hsl(142 71% 45%/.6)" }} />
                        </div>
                        <div className="neu-input" style={{ borderRadius: 6, padding: "0 8px", flex: 1, fontSize: 10, color: "hsl(var(--muted-fg))" }}>localhost:5173</div>
                      </div>
                      <div style={{ padding: 16, overflowY: "auto", height: "calc(100% - 30px)" }}>
                        <div className="neu-card-static" style={{ padding: 16, marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "hsl(32 95% 55%)" }} />
                            <span style={{ fontSize: 12, fontFamily: "Space Grotesk", fontWeight: 700, color: "hsl(var(--fg))" }}>TriConnect</span>
                          </div>
                          <div className="tc-skel" style={{ height: 8, width: "75%", marginBottom: 8 }} />
                          <div className="tc-skel" style={{ height: 8, width: "50%" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="neu-card-static" style={{ padding: 12 }}>
                              <div className="tc-skel" style={{ height: 8, width: "66%", marginBottom: 8 }} />
                              <div className="tc-skel-light" style={{ height: 6, width: "100%", marginBottom: 4, borderRadius: 9999 }} />
                              <div className="tc-skel-faint" style={{ height: 6, width: "80%", borderRadius: 9999 }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="tc-phone-frame">
                    <div className="tc-phone-notch"><div className="tc-phone-notch-bar" /></div>
                    <div style={{ padding: "32px 8px 16px", height: "100%", overflow: "auto" }}>
                      <div className="neu-card-static" style={{ padding: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(32 95% 55%)" }} />
                          <span style={{ fontSize: 10, fontFamily: "Space Grotesk", fontWeight: 700, color: "hsl(0 0% 95%)" }}>TriConnect</span>
                        </div>
                        <div className="tc-skel" style={{ height: 6, width: "75%", marginBottom: 4 }} />
                        <div className="tc-skel" style={{ height: 6, width: "50%" }} />
                      </div>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="neu-card-static" style={{ padding: 8, marginBottom: 8 }}>
                          <div className="tc-skel" style={{ height: 6, width: "66%", marginBottom: 4 }} />
                          <div className="tc-skel-light" style={{ height: 6, width: "100%", marginBottom: 4, borderRadius: 9999 }} />
                          <div className="tc-skel-faint" style={{ height: 6, width: "80%", borderRadius: 9999 }} />
                        </div>
                      ))}
                    </div>
                    <div className="tc-phone-home" />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", height: "100%" }}>
                {fileTreeOpen && (
                  <div className="tc-scrollbar" style={{ width: 192, borderRight: "1px solid hsl(var(--border))", overflowY: "auto", padding: 6, flexShrink: 0, background: "hsl(var(--secondary)/.1)" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", color: "hsl(var(--muted-fg))", fontWeight: 500, padding: "4px 8px", marginBottom: 4 }}>Explorer</div>
                    {mockTree.map(n => renderTreeNode(n, 0))}
                  </div>
                )}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid hsl(var(--border))", overflowX: "auto", background: "hsl(var(--secondary)/.1)" }}>
                    <button onClick={() => setFileTreeOpen(!fileTreeOpen)} style={{ padding: 4, color: "hsl(var(--muted-fg))", borderRight: "1px solid hsl(var(--border))", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    </button>
                    {openTabs.map((t, i) => (
                      <div key={t.path} onClick={() => setActiveTabIdx(i)} className={i === activeTabIdx ? "tc-tab-active" : ""}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", borderRight: "1px solid hsl(var(--border))", color: i === activeTabIdx ? "hsl(var(--fg))" : "hsl(var(--muted-fg))", background: i === activeTabIdx ? "hsl(var(--bg))" : "hsl(var(--secondary)/.2)", flexShrink: 0 }}>
                        📄 {t.name}
                        <button onClick={e => { e.stopPropagation(); closeTab(i); }} style={{ marginLeft: 4, fontSize: 10 }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="tc-scrollbar" style={{ flex: 1, overflowY: "auto", padding: 12, fontFamily: "'SF Mono','Fira Code','Cascadia Code',monospace", fontSize: 11, lineHeight: "20px", color: "hsl(0 0% 95%/.9)" }}>
                    {openTabs[activeTabIdx] ? openTabs[activeTabIdx].content.split("\n").map((line, i) => (
                      <div key={i} className="tc-code-line">
                        <span className="tc-line-num">{i + 1}</span>
                        <span dangerouslySetInnerHTML={{ __html: escapeHtml(line) || " " }} />
                      </div>
                    )) : <div style={{ color: "hsl(var(--muted-fg))", textAlign: "center", padding: "80px 0" }}>No file open</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
