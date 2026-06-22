/**
 * AuthPage — Sign in / Sign up
 *
 * Harmonises with the landing page: same warm cream palette,
 * Playfair Display, Ibis mark, muted lilac accents.
 * Split layout on desktop (left: brand story, right: form),
 * centered single-column on mobile.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle, signIn, signUp } from "../lib/auth";
import { ArrowRight, Loader2 } from "lucide-react";

type Mode = "signin" | "signup";

// ─── Palette (mirrors the landing page) ──────────────────

const LP_VARS: React.CSSProperties = {
  ["--night" as string]: "hsl(42 35% 97%)",
  ["--night-2" as string]: "hsl(40 28% 96%)",
  ["--line" as string]: "hsl(120 8% 88%)",
  ["--moon" as string]: "hsl(220 12% 20%)",
  ["--moon-dim" as string]: "hsl(220 8% 52%)",
  ["--gold" as string]: "hsl(267 28% 56%)",
  ["--gold-ink" as string]: "hsl(42 35% 97%)",
  ["--cream" as string]: "hsl(120 14% 93%)",
  ["--ink" as string]: "hsl(220 12% 20%)",
  ["--ink-soft" as string]: "hsl(220 8% 52%)",
};

const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };

// ─── Ibis mark (same as landing page) ────────────────────

function IbisMark({ size = 30, stroke = "currentColor" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M37 41c-9 0-15-6-15-14 0-7 4.5-11 9.5-11 4 0 6.5 2.5 6.5 5.5 0 2.6-1.8 4.3-4 4.3-1.8 0-3-1.1-3-2.6 0-1.2.8-2 1.9-2" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 17C18 11 12.5 8 5 8.5c4 1.8 6.5 4.5 8.2 8.7" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M11 41h26" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Easing ──────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Page ────────────────────────────────────────────────

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      if (res.error) { setError(res.error.message); setGoogleLoading(false); }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const res = await signUp(email, password, fullName);
        if (res.error) throw res.error;
        setError("Check your email for a confirmation link, then sign in.");
        setMode("signin");
      } else {
        const res = await signIn(email, password);
        if (res.error) throw res.error;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setEmailLoading(false);
    }
  }

  const inputCls = "w-full h-11 rounded-xl border border-[var(--line)] bg-[var(--night)] px-4 text-[13.5px] text-[var(--moon)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)/0.2] transition placeholder:text-[var(--moon-dim)]";

  return (
    <div style={LP_VARS} className="min-h-screen flex bg-[var(--night)] text-[var(--moon)]">
      <style>{`
        .auth-dark { --night: hsl(220 14% 12%); --night-2: hsl(220 14% 16%); --line: hsl(220 10% 22%); --moon: hsl(42 30% 93%); --moon-dim: hsl(220 8% 58%); --gold: hsl(267 30% 68%); --gold-ink: hsl(220 14% 12%); --cream: hsl(220 14% 16%); --ink: hsl(42 30% 93%); --ink-soft: hsl(220 8% 58%); }
        .auth-dark .auth-card { background: hsl(220 14% 16%); border-color: hsl(220 10% 22%); }
        .auth-dark .auth-input { background: hsl(220 14% 12%); border-color: hsl(220 10% 22%); color: hsl(42 30% 93%); }
        .auth-dark .auth-input::placeholder { color: hsl(220 8% 48%); }
        .auth-dark .auth-google { border-color: hsl(220 10% 22%); background: hsl(220 14% 16%); }
        .auth-dark .auth-toggle { background: hsl(220 14% 18%); border-color: hsl(220 10% 22%); }
        .auth-dark .auth-left { background: hsl(220 14% 10%); }
      `}</style>

      {/* ── Left panel (brand) — desktop only ────────── */}
      <div className="auth-left hidden lg:flex flex-col justify-between flex-1 px-14 py-12 bg-[var(--cream)]">
        <motion.a
          href="/"
          className="flex items-center gap-2.5 text-[var(--moon)] w-fit"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <IbisMark size={26} stroke="var(--gold)" />
          <span className="text-[18px] tracking-[0.12em]" style={serif}>THOTH</span>
        </motion.a>

        <div className="max-w-[420px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          >
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.15] [text-wrap:balance] mb-5" style={{ ...serif, letterSpacing: "-0.015em" }}>
              Five thousand years of bookkeeping experience.
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--moon-dim)] max-w-[42ch]">
              Sales, production, inventory, Shopify, loyalty and people — one system, two languages,
              built in Egypt. The god of records would have insisted on nothing less.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {[
              { n: "34", l: "modules" },
              { n: "2", l: "languages, first-class" },
              { n: "1 day", l: "custom builds" },
            ].map((s) => (
              <div key={s.l} className="flex items-baseline gap-3">
                <span className="text-[22px] text-[var(--gold)] tabular-nums" style={serif}>{s.n}</span>
                <span className="text-[13px] text-[var(--moon-dim)]">{s.l}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          className="text-[12px] text-[var(--moon-dim)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          © 2026 THOTH · Cairo, Egypt
        </motion.p>
      </div>

      {/* ── Right panel (form) ────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile logo */}
        <motion.div
          className="lg:hidden text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <a href="/" className="inline-flex items-center gap-2.5 text-[var(--moon)]">
            <IbisMark size={28} stroke="var(--gold)" />
            <span className="text-[20px] tracking-[0.12em]" style={serif}>THOTH</span>
          </a>
        </motion.div>

        <div className="w-full max-w-[380px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          >
            <h1 className="text-[28px] leading-tight mb-1.5" style={{ ...serif, letterSpacing: "-0.02em" }}>
              {mode === "signin" ? "Welcome back" : "Create your workspace"}
            </h1>
            <p className="text-[14px] text-[var(--moon-dim)] mb-8">
              {mode === "signin"
                ? "Sign in to continue to THOTH"
                : "Start your free account — one user, forever."}
            </p>
          </motion.div>

          {/* Google */}
          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="auth-google w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-[var(--line)] bg-[var(--night-2)] text-[13.5px] font-medium text-[var(--moon)] hover:brightness-95 transition-all disabled:opacity-50"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin text-[var(--moon-dim)]" />
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? "جاري تسجيل الدخول…" : "Continue with Google"}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--line)]" />
            <span className="text-[11px] text-[var(--moon-dim)]">or</span>
            <div className="flex-1 h-px bg-[var(--line)]" />
          </div>

          {/* Email form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
          >
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.input
                  key="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="auth-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 44 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                />
              )}
            </AnimatePresence>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="auth-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="auth-input"
            />

            <motion.button
              type="submit"
              disabled={emailLoading || !email || !password}
              className="w-full h-11 rounded-xl bg-[var(--gold)] text-[var(--gold-ink)] text-[13.5px] font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-40"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {emailLoading && <Loader2 size={14} className="animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </motion.button>
          </motion.form>

          {/* Toggle mode */}
          <motion.p
            className="text-center text-[13px] text-[var(--moon-dim)] mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {mode === "signin" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(null); }} className="text-[var(--gold)] hover:underline underline-offset-2">
                  Start free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(null); }} className="text-[var(--gold)] hover:underline underline-offset-2">
                  Sign in
                </button>
              </>
            )}
          </motion.p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="mt-4 text-[12px] text-rose-500 text-center"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Back to home */}
          <motion.a
            href="/"
            className="mt-10 flex items-center justify-center gap-1.5 text-[12px] text-[var(--moon-dim)] hover:text-[var(--moon)] transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <ArrowRight size={13} className="rotate-180" />
            Back to home
          </motion.a>
        </div>
      </div>
    </div>
  );
}
