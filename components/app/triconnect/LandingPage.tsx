"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { signInWithGoogle, signInWithGithub } from "@/lib/supabase";
import UserAvatar from "./UserAvatar";

// ===== Data =====
const features = [
  { icon: "⚡", title: "Lightning Fast", desc: "Build and deploy in minutes, not months. AI handles the heavy lifting.", color: "hsl(48 96% 53%)" },
  { icon: "🌐", title: "Cross-Platform", desc: "One codebase, every platform. Web, mobile, and desktop — all connected.", color: "hsl(217 91% 60%)" },
  { icon: "🔒", title: "Enterprise Security", desc: "Bank-grade encryption and compliance baked in from day one.", color: "hsl(142 71% 45%)" },
  { icon: "📐", title: "Smart Architecture", desc: "Auto-generated, clean architecture that scales. No spaghetti code.", color: "hsl(262 83% 58%)" },
  { icon: "🤖", title: "AI Core Engine", desc: "Advanced AI that understands context, patterns, and best practices.", color: "hsl(32 95% 55%)" },
  { icon: "👥", title: "Team Collaboration", desc: "Real-time collaboration. Share, review, and iterate together.", color: "hsl(340 82% 52%)" },
];
const testimonials = [
  { name: "Sarah Chen", role: "CTO, StartupX", quote: "TriConnect cut our development time by 80%. Like having a senior team on demand.", avatar: "SC" },
  { name: "Marcus Rivera", role: "Founder, BuildFast", quote: "The AI understands exactly what I need. Shipped my MVP in a single afternoon.", avatar: "MR" },
  { name: "Aiko Tanaka", role: "Lead Dev, NeoApps", quote: "Best developer tool I've used in years. The design is absolutely gorgeous.", avatar: "AT" },
];
const aiModels = [
  { name: "Llama 3.3", provider: "Cloudflare", desc: "70B parameter model for complex reasoning", badge: "Popular", color: "hsl(217 91% 60%)" },
  { name: "DeepSeek R1", provider: "Cloudflare", desc: "Distilled reasoning model for code gen", badge: "New", color: "hsl(142 71% 45%)" },
  { name: "Gemma 2", provider: "Cloudflare", desc: "Google's efficient open model", badge: "Fast", color: "hsl(262 83% 58%)" },
  { name: "Mistral 7B", provider: "Cloudflare", desc: "Compact yet powerful for quick tasks", badge: "Efficient", color: "hsl(32 95% 55%)" },
];
const stats = [
  { value: "10K+", label: "Builders" },
  { value: "50K+", label: "Apps Built" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s", label: "Avg Response" },
];

export default function LandingPage({ onEnterChat }: { onEnterChat: (msg?: string) => void }) {
  const { user } = useAuth();
  const [heroInput, setHeroInput] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleBuild() {
    if (!user) { setShowLogin(true); return; }
    onEnterChat(heroInput.trim() || undefined);
  }

  return (
    <div className="gradient-mesh">
      {/* Floating particles — deterministic values to avoid SSR hydration mismatch */}
      {[
        { w: 5.9, h: 6.7, left: "10%", top: "20%", opacity: 0.22, dur: 6.4 },
        { w: 5.1, h: 6.1, left: "25%", top: "45%", opacity: 0.18, dur: 7.5 },
        { w: 5.4, h: 7.3, left: "40%", top: "70%", opacity: 0.30, dur: 10.5 },
        { w: 6.5, h: 6.5, left: "55%", top: "20%", opacity: 0.23, dur: 11.4 },
        { w: 7.5, h: 6.6, left: "70%", top: "45%", opacity: 0.27, dur: 11.9 },
        { w: 5.9, h: 5.1, left: "85%", top: "70%", opacity: 0.27, dur: 10.2 },
      ].map((p, i) => (
        <div key={i} className="particle" style={{
          width: p.w, height: p.h,
          left: p.left, top: p.top,
          background: `hsl(32 95% 55%/${p.opacity})`,
          animationDelay: `${i * 1.5}s`, animationDuration: `${p.dur}s`,
        }} />
      ))}

      {/* ===== Navbar ===== */}
      <nav className={`tc-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="tc-nav-inner">
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={e => e.preventDefault()}>
            <div className="glow-ring" style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,hsl(32 95% 55%),hsl(20 90% 45%))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 15% 8%)" strokeWidth="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /><line x1="12" y1="22" x2="12" y2="15.5" /><line x1="22" y1="8.5" x2="12" y2="15.5" /><line x1="2" y1="8.5" x2="12" y2="15.5" /></svg>
            </div>
            <span style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 700 }} className="text-gradient">TriConnect</span>
          </a>
          <div className="tc-nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Features", "AI Models", "Testimonials", "Pricing"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} style={{ fontSize: 14, fontWeight: 500, color: "hsl(var(--muted-fg))", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(var(--fg))")} onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--muted-fg))")}>{item}</a>
            ))}
          </div>
          <div className="tc-nav-buttons" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <UserAvatar size={34} />
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} className="neu-btn glossy" style={{ padding: "8px 20px", fontSize: 13, fontWeight: 500 }}>Sign in</button>
                <button onClick={() => setShowLogin(true)} className="neu-btn-primary glossy" style={{ padding: "8px 20px", fontSize: 13, borderRadius: 10 }}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="tc-hero">
        <div className="tc-container" style={{ padding: "0 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div className="fade-in-up">
            <div className="neu-card-glow" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 20px", borderRadius: 9999, marginBottom: 40, fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-fg))" }}>
              <span className="pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(32 95% 55%)" }} />
              Now in Public Beta — Join 10K+ builders
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(32 95% 55%)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </div>
          <h1 className="fade-in-up delay-1" style={{ fontFamily: "Space Grotesk", fontSize: 64, fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
            <span className="text-gradient">What will you</span><br />
            <span className="text-gradient-warm" style={{ fontStyle: "italic" }}>build</span>
            <span className="text-gradient"> today?</span>
          </h1>
          <p className="fade-in-up delay-2" style={{ fontSize: 18, color: "hsl(var(--muted-fg))", maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7 }}>
            Create stunning apps &amp; websites by chatting with AI. Powered by <span style={{ color: "hsl(var(--primary))" }}>Cloudflare Workers AI</span>.
          </p>

          {/* Premium Hero Input */}
          <div className="fade-in-up delay-3" style={{ maxWidth: 680, margin: "0 auto" }}>
            <div className="neu-card-glow" style={{ padding: 20, borderRadius: 20 }}>
              <textarea rows={3} placeholder="Describe your app idea... e.g., 'Build a SaaS dashboard with user analytics'" value={heroInput} onChange={e => setHeroInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleBuild(); } }}
                style={{ width: "100%", background: "transparent", outline: "none", fontSize: 15, color: "hsl(0 0% 95%)", resize: "none", border: "none", marginBottom: 16, lineHeight: 1.6 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="neu-btn" style={{ padding: 8, borderRadius: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 10% 55%)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                  <button className="neu-btn" style={{ padding: 8, borderRadius: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 10% 55%)" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "hsl(var(--muted-fg))", padding: "0 8px", borderLeft: "1px solid hsl(var(--border))", marginLeft: 4 }}>
                    <span className="pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(32 95% 55%)" }} />
                    Cloudflare AI
                  </div>
                </div>
                <button onClick={handleBuild} className="neu-btn-primary glossy" style={{ padding: "10px 24px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700 }}>
                  Build now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </div>
            </div>

            {/* Quick start buttons */}
            <div className="fade-in-up delay-5" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "hsl(var(--muted-fg))" }}>or start from</span>
              {["Figma", "GitHub", "Template"].map(label => (
                <button key={label} className="neu-btn glossy" style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, color: "hsl(var(--muted-fg))", display: "flex", alignItems: "center", gap: 6 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="fade-in-up delay-6" style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 64, flexWrap: "wrap" }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Space Grotesk", fontSize: 28, fontWeight: 800 }} className="text-gradient-warm">{s.value}</div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-fg))", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Coming Soon ===== */}
      <section style={{ padding: "80px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent,hsl(32 95% 55%/.04),transparent)" }} />
        <div className="tc-container" style={{ padding: "0 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div className="fade-in-up" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 11, fontWeight: 600, color: "hsl(var(--primary))", marginBottom: 16, letterSpacing: ".08em", textTransform: "uppercase" as const }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(32 95% 55%)" }} />COMING SOON
          </div>
          <h2 className="fade-in-up delay-1" style={{ fontFamily: "Space Grotesk", fontSize: 56, fontWeight: 800 }}>
            <span className="text-gradient">TriConnect </span><span className="text-gradient-warm">Max</span>
          </h2>
          <p className="fade-in-up delay-2" style={{ color: "hsl(var(--muted-fg))", marginTop: 16, fontSize: 16 }}>The most powerful way to build. Unlimited everything.</p>
        </div>
      </section>

      {/* ===== AI Models ===== */}
      <section id="ai-models" style={{ padding: "80px 0" }}>
        <div className="tc-container" style={{ padding: "0 24px" }}>
          <div className="fade-in-up" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--primary))", letterSpacing: ".08em", textTransform: "uppercase" as const, marginBottom: 12 }}>POWERED BY CLOUDFLARE</div>
            <h2 style={{ fontFamily: "Space Grotesk", fontSize: 36, fontWeight: 700, marginBottom: 12 }} className="text-gradient">AI Models at the Edge</h2>
            <p style={{ color: "hsl(var(--muted-fg))", maxWidth: 480, margin: "0 auto" }}>Choose from state-of-the-art models running on Cloudflare&apos;s global network. Zero cold starts.</p>
          </div>
          <div className="tc-models-grid">
            {aiModels.map((m, i) => (
              <div key={m.name} className={`neu-card-glow fade-in-up delay-${i + 1}`} style={{ padding: 24, cursor: "default" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: `${m.color}15`, color: m.color }}>{m.badge}</span>
                </div>
                <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16, color: "hsl(var(--fg))", marginBottom: 4 }}>{m.name}</h3>
                <p style={{ fontSize: 12, color: "hsl(var(--muted-fg))", marginBottom: 8 }}>{m.provider}</p>
                <p style={{ fontSize: 12, color: "hsl(var(--muted-fg))", lineHeight: 1.5 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" style={{ padding: "80px 0" }}>
        <div className="tc-container" style={{ padding: "0 24px" }}>
          <div className="fade-in-up" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "Space Grotesk", fontSize: 36, fontWeight: 700, marginBottom: 12 }} className="text-gradient">Everything you need</h2>
            <p style={{ color: "hsl(var(--muted-fg))", maxWidth: 440, margin: "0 auto" }}>A complete platform for building, deploying, and scaling your applications.</p>
          </div>
          <div className="tc-features-grid">
            {features.map((f, i) => (
              <div key={f.title} className={`neu-card-glow glossy fade-in-up delay-${(i % 6) + 1}`} style={{ padding: 28, cursor: "default" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 24, border: `1px solid ${f.color}20` }}>{f.icon}</div>
                <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, color: "hsl(var(--fg))", marginBottom: 8, fontSize: 17 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "hsl(var(--muted-fg))", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section id="testimonials" style={{ padding: "80px 0" }}>
        <div className="tc-container" style={{ padding: "0 24px" }}>
          <div className="fade-in-up" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "Space Grotesk", fontSize: 36, fontWeight: 700, marginBottom: 12 }} className="text-gradient">Loved by builders</h2>
          </div>
          <div className="tc-testimonials">
            {testimonials.map((t, i) => (
              <div key={t.name} className={`neu-card-glow fade-in-up delay-${i + 1}`} style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,hsl(32 95% 55%),hsl(262 83% 58%))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "hsl(220 15% 8%)" }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 14, color: "hsl(var(--fg))" }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: "hsl(var(--muted-fg))" }}>{t.role}</p>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "hsl(var(--muted-fg))", lineHeight: 1.7, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: "80px 0" }}>
        <div className="tc-container" style={{ padding: "0 24px" }}>
          <div className="neu-card-glow fade-in-up" style={{ padding: "60px 40px", textAlign: "center", borderRadius: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,hsl(32 95% 55%/.08),transparent 60%)", pointerEvents: "none" }} />
            <h2 style={{ fontFamily: "Space Grotesk", fontSize: 36, fontWeight: 800, marginBottom: 16, position: "relative" }} className="text-gradient">Ready to build something amazing?</h2>
            <p style={{ color: "hsl(var(--muted-fg))", marginBottom: 32, fontSize: 16, position: "relative" }}>Join thousands of builders creating the future with TriConnect.</p>
            <button onClick={() => setShowLogin(true)} className="neu-btn-primary glossy" style={{ padding: "14px 36px", borderRadius: 14, fontSize: 16, fontWeight: 700, position: "relative" }}>
              Start Building — It&apos;s Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ display: "inline", marginLeft: 8, verticalAlign: "middle" }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer style={{ borderTop: "1px solid hsl(var(--border))", padding: "48px 0", marginTop: 40 }}>
        <div className="tc-container" style={{ padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,hsl(32 95% 55%),hsl(20 90% 45%))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(220 15% 8%)" strokeWidth="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg>
                </div>
                <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, color: "hsl(var(--fg))" }}>TriConnect</span>
              </div>
              <p style={{ fontSize: 13, color: "hsl(var(--muted-fg))" }}>Build connected apps, fast.</p>
            </div>
            {[
              { title: "Product", items: ["Features", "AI Models", "Pricing", "Changelog"] },
              { title: "Company", items: ["About", "Blog", "Careers", "Contact"] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 13, marginBottom: 12, color: "hsl(var(--fg))" }}>{col.title}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.items.map(item => <span key={item} style={{ fontSize: 13, color: "hsl(var(--muted-fg))", cursor: "pointer" }}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid hsl(var(--border))", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "hsl(var(--muted-fg))" }}>© 2026 TriConnect. All rights reserved. Powered by Cloudflare Workers AI &amp; Supabase.</p>
          </div>
        </div>
      </footer>

      {/* ===== Login Modal ===== */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="neu-card-glow" style={{ width: 420, maxWidth: "90vw", padding: 36, borderRadius: 24 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,hsl(32 95% 55%),hsl(20 90% 45%))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(220 15% 8%)" strokeWidth="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /><line x1="12" y1="22" x2="12" y2="15.5" /><line x1="22" y1="8.5" x2="12" y2="15.5" /><line x1="2" y1="8.5" x2="12" y2="15.5" /></svg>
                </div>
                <h2 style={{ fontFamily: "Space Grotesk", fontSize: 24, fontWeight: 700, marginBottom: 8 }} className="text-gradient">Welcome to TriConnect</h2>
                <p style={{ fontSize: 14, color: "hsl(var(--muted-fg))" }}>Sign in to start building</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button onClick={() => signInWithGoogle()} className="auth-btn auth-btn-google glossy">
                  <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Continue with Google
                </button>
                <button onClick={() => signInWithGithub()} className="auth-btn auth-btn-github glossy">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                  Continue with GitHub
                </button>
              </div>
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "hsl(var(--muted-fg))" }}>By continuing, you agree to our Terms of Service</p>
              </div>
              <button onClick={() => setShowLogin(false)} style={{ position: "absolute", top: 16, right: 16, color: "hsl(var(--muted-fg))", padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
