"use client";
import { useAuth } from "@/components/providers/AuthProvider";
import { signInWithGoogle, signInWithGithub } from "@/lib/supabase";
import { useState } from "react";

interface UserAvatarProps {
  size?: number;
  showDropdown?: boolean;
}

export default function UserAvatar({ size = 32, showDropdown = true }: UserAvatarProps) {
  const { user, loading, signOut, avatarUrl, displayName, initials } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "hsl(var(--secondary)/.3)",
        animation: "pulse 1.5s ease-in-out infinite",
      }} />
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className="neu-btn glossy"
          style={{ padding: "6px 16px", fontSize: 12, fontWeight: 500, borderRadius: 10 }}
        >
          Sign in
        </button>

        {/* Login Modal */}
        {showLogin && (
          <div className="modal-overlay" onClick={() => setShowLogin(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="neu-card-glow" style={{ width: 400, maxWidth: "90vw", padding: 32, borderRadius: 20 }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "linear-gradient(135deg,hsl(32 95% 55%),hsl(20 90% 45%))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(220 15% 8%)" strokeWidth="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg>
                  </div>
                  <h2 style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 700, marginBottom: 6 }} className="text-gradient">Welcome to TriConnect</h2>
                  <p style={{ fontSize: 13, color: "hsl(var(--muted-fg))" }}>Sign in to start building</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => signInWithGoogle()} className="auth-btn auth-btn-google glossy">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Continue with Google
                  </button>
                  <button onClick={() => signInWithGithub()} className="auth-btn auth-btn-github glossy">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                    Continue with GitHub
                  </button>
                </div>
                <p style={{ fontSize: 10, color: "hsl(var(--muted-fg))", textAlign: "center", marginTop: 20 }}>By continuing, you agree to our Terms of Service</p>
                <button onClick={() => setShowLogin(false)} style={{ position: "absolute", top: 12, right: 12, color: "hsl(var(--muted-fg))", padding: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Logged in — show avatar
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => showDropdown && setDropdownOpen(!dropdownOpen)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            style={{
              width: size, height: size, borderRadius: "50%",
              border: "2px solid hsl(32 95% 55%/.4)",
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{
            width: size, height: size, borderRadius: "50%",
            background: "linear-gradient(135deg,hsl(32 95% 55%),hsl(262 83% 58%))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: Math.round(size * 0.4), fontWeight: 700, color: "hsl(220 15% 8%)",
          }}>
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && showDropdown && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setDropdownOpen(false)} />
          <div className="neu-card-glow" style={{
            position: "absolute", top: size + 8, right: 0, zIndex: 1000,
            width: 220, padding: 8, borderRadius: 14,
          }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid hsl(var(--border))", marginBottom: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--fg))", fontFamily: "Space Grotesk" }}>{displayName}</p>
              <p style={{ fontSize: 11, color: "hsl(var(--muted-fg))", marginTop: 2 }}>{user.email}</p>
            </div>
            <button
              onClick={() => { setDropdownOpen(false); signOut(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", borderRadius: 8, fontSize: 12,
                color: "hsl(0 72% 51%)", background: "none", border: "none",
                cursor: "pointer", textAlign: "left",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(0 72% 51%/.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
