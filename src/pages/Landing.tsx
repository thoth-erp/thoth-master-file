/**
 * THOTH — Public landing page
 *
 * Brand register: warm cream canvas, graphite ink, muted lilac accent,
 * soft sage sections. The Thoth myth (writing → counting → judgement)
 * is the structure, carried by copy, Playfair type and drawn glyphs.
 *
 * Motion: framer-motion for scroll reveals, stagger, spring physics,
 * AnimatePresence for tab transitions. All respect prefers-reduced-motion.
 * Content visible by default; JS arms entrance animations for crawlers/no-JS.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Minus, ChevronDown, Menu, X,
  PenLine, Scale, Eye, ShoppingBag, Boxes, Gift, Hammer,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

/* ─── Palette ─────────────────────────────────────────── */

const LP_VARS: React.CSSProperties = {
  ["--night" as string]: "hsl(340 25% 97%)",
  ["--night-2" as string]: "hsl(340 20% 96%)",
  ["--night-3" as string]: "hsl(340 15% 94%)",
  ["--line" as string]: "hsl(340 8% 88%)",
  ["--moon" as string]: "hsl(340 12% 20%)",
  ["--moon-dim" as string]: "hsl(340 8% 52%)",
  ["--gold" as string]: "hsl(340 40% 55%)",
  ["--gold-ink" as string]: "hsl(340 25% 97%)",
  ["--gold-deep" as string]: "hsl(340 42% 45%)",
  ["--lapis" as string]: "hsl(200 40% 58%)",
  ["--cream" as string]: "hsl(340 10% 94%)",
  ["--ink" as string]: "hsl(340 12% 20%)",
  ["--ink-soft" as string]: "hsl(340 8% 52%)",
};

const serif = { fontFamily: "'Playfair Display', serif" };

/* ─── Easing (Emil Kowalski curves) ──────────────────── */

const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* ─── Motion variants ─────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_QUINT } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT_QUINT } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_OUT_QUINT } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const staggerContainerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/* ─── Reveal wrapper (scroll-triggered) ───────────────── */

function Reveal({ children, className, delay = 0, ...props }: {
  children: React.ReactNode; className?: string; delay?: number;
} & Omit<React.ComponentProps<typeof motion.div>, "children">) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? false : "hidden"}
      animate={inView ? "visible" : reduced ? "visible" : "hidden"}
      transition={{ delay, ...fadeUp.visible.transition }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated number ─────────────────────────────────── */

function useEasedNumber(target: number): number {
  const [shown, setShown] = useState(target);
  const raf = useRef<number>(0);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const from = shown;
    const start = performance.now();
    const dur = 550;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setShown(Math.round(from + (target - from) * e));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  return shown;
}

const egp = (n: number) => n.toLocaleString("en-EG");

/* ─── Drawn marks ─────────────────────────────────────── */

function IbisMark({ size = 30, stroke = "currentColor" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M37 41c-9 0-15-6-15-14 0-7 4.5-11 9.5-11 4 0 6.5 2.5 6.5 5.5 0 2.6-1.8 4.3-4 4.3-1.8 0-3-1.1-3-2.6 0-1.2.8-2 1.9-2"
        stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 17C18 11 12.5 8 5 8.5c4 1.8 6.5 4.5 8.2 8.7" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M11 41h26" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonDisc({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        <radialGradient id="lp-moon-glow" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="hsl(340 35% 90%)" />
          <stop offset="55%" stopColor="hsl(340 30% 80%)" />
          <stop offset="100%" stopColor="hsl(340 40% 64%)" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#lp-moon-glow)" opacity="0.9" />
      <circle cx="200" cy="200" r="180" fill="none" stroke="hsl(340 40% 55% / 0.4)" strokeWidth="1.5" />
      <circle cx="150" cy="140" r="26" fill="hsl(340 40% 55% / 0.18)" />
      <circle cx="255" cy="240" r="40" fill="hsl(340 40% 55% / 0.13)" />
      <circle cx="180" cy="280" r="16" fill="hsl(340 40% 55% / 0.16)" />
    </svg>
  );
}

/* ─── Ambient glyph field ─────────────────────────────── */

const GLYPHS = [
  { d: "M4 16c6-8 18-8 24 0-6 8-18 8-24 0Zm12 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", x: "8%", y: "18%", s: 34, dur: 11, delay: 0, par: 0.05 },
  { d: "M6 26 24 8m0 0-6 1.5M24 8l-1.5 6", x: "85%", y: "14%", s: 30, dur: 9, delay: 1.2, par: 0.09 },
  { d: "M16 4v22M8 26h16M16 8l-8 6c0 3 3.5 5 8 5s8-2 8-5l-8-6Z", x: "13%", y: "62%", s: 36, dur: 13, delay: 0.6, par: 0.12 },
  { d: "M22 4a12 12 0 1 0 6 22A14 14 0 0 1 22 4Z", x: "90%", y: "55%", s: 32, dur: 10, delay: 2, par: 0.07 },
  { d: "M5 10h22M5 16h22M5 22h14", x: "78%", y: "78%", s: 28, dur: 12, delay: 0.3, par: 0.1 },
];

function GlyphField() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {GLYPHS.map((g, i) => (
        <svg key={i} viewBox="0 0 32 32" width={g.s} height={g.s} fill="none"
          className="lp-glyph absolute"
          style={{
            left: g.x, top: g.y,
            ["--dur" as string]: `${g.dur}s`,
            ["--delay" as string]: `${g.delay}s`,
          }}>
          <path d={g.d} stroke="hsl(340 40% 55% / 0.35)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
      {!reduced && (
        <div className="lp-ibis-glide absolute top-[24%] left-0">
          <IbisMark size={42} stroke="hsl(340 40% 55% / 0.4)" />
        </div>
      )}
    </div>
  );
}

/* ─── Hero product composition ────────────────────────── */

function HeroMock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="relative mx-auto max-w-[920px] px-6" aria-hidden>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: EASE_OUT_QUINT, delay: 0.55 }}
        className="lp-mock-card relative z-[2] rounded-2xl border border-[var(--line)] bg-[var(--night-2)] shadow-[0_32px_70px_-24px_hsl(220_12%_18%/0.18)] p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-[var(--moon-dim)]">Today · Thursday</p>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">All systems writing</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { k: "Sales orders", v: "SO-2026-1148", s: "Confirmed · 84,500 EGP", tone: "hsl(150 35% 38%)" },
            { k: "In production", v: "Silk evening gown ×3", s: "Cutting → Sewing", tone: "var(--gold)" },
            { k: "From Shopify", v: "+144 orders synced", s: "2 minutes ago", tone: "hsl(200 45% 45%)" },
          ].map((c, i) => (
            <motion.div
              key={c.k}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: EASE_OUT_QUINT, delay: 0.7 + i * 0.1 }}
              className="rounded-xl bg-[var(--night)] border border-[var(--line)] px-4 py-3.5"
            >
              <p className="text-[11px] text-[var(--moon-dim)] mb-1.5">{c.k}</p>
              <p className="text-[15px] text-[var(--moon)]" style={serif}>{c.v}</p>
              <p className="text-[11.5px] mt-1" style={{ color: c.tone }}>{c.s}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-end gap-1.5 h-[58px]">
          {[34, 46, 30, 58, 44, 66, 52, 74, 60, 84, 70, 92].map((h, i) => (
            <motion.span
              key={i}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.6, ease: EASE_OUT_QUINT, delay: 0.9 + i * 0.04 }}
              className="flex-1 rounded-t-[3px] bg-[hsl(340_40%_55%/0.45)]"
              style={{ height: `${h}%`, transformOrigin: "bottom" }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE_OUT_QUINT, delay: 0.75 }}
        className="absolute -left-2 sm:left-6 -bottom-9 z-[3] hidden md:block"
      >
        <div className="lp-bob rounded-xl border border-[var(--line)] bg-[var(--night-2)] px-4 py-3 shadow-[0_16px_28px_-5px_hsl(220_12%_18%/0.09)]">
          <p className="text-[11px] text-[var(--moon-dim)]">Inventory</p>
          <p className="text-[13.5px] text-[var(--moon)]">Silk fabric — 50m · reorder 200m</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE_OUT_QUINT, delay: 0.85 }}
        className="absolute -right-2 sm:right-6 -bottom-7 z-[3] hidden md:block"
      >
        <div className="lp-bob rounded-xl border border-[var(--line)] bg-[var(--night-2)] px-4 py-3 shadow-[0_16px_28px_-5px_hsl(220_12%_18%/0.09)]" style={{ animationDelay: "1.4s" }}>
          <p className="text-[11px] text-[var(--moon-dim)]">Loyalty</p>
          <p className="text-[13.5px] text-[var(--moon)]">Mona earned 450 points · Gold tier</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Product tour mocks ──────────────────────────────── */

function TourWork() {
  return (
    <div className="space-y-2.5">
      {[
        { t: "SO-2026-1142 — Summer collection, linen", s: "In production", pill: "bg-violet-100 text-violet-700", p: 64 },
        { t: "SO-2026-1147 — Silk evening gowns ×6", s: "Confirmed", pill: "bg-blue-100 text-blue-700", p: 12 },
        { t: "QT-3301 — Bridal wear order", s: "Quotation sent", pill: "bg-amber-100 text-amber-700", p: 0 },
      ].map((r) => (
        <div key={r.t} className="lp-white-card rounded-xl border border-black/[0.07] bg-white px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13.5px] text-[var(--ink)] truncate">{r.t}</p>
            <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium shrink-0 ${r.pill}`}>{r.s}</span>
          </div>
          {r.p > 0 && (
            <div className="mt-2.5 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-[hsl(340_40%_55%)]" style={{ width: `${r.p}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TourInventory() {
  return (
    <div className="lp-white-card rounded-xl border border-black/[0.07] bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] text-[var(--ink-soft)]">Stock value by category</p>
        <p className="text-[12px] text-[var(--ink)] font-medium">EGP 1.42M</p>
      </div>
      {[
        { l: "Silk & linen fabrics", v: 78, c: "hsl(340 40% 55%)" },
        { l: "Buttons & trims", v: 46, c: "hsl(32 60% 56%)" },
        { l: "Thread & notions", v: 31, c: "hsl(120 20% 48%)" },
      ].map((b) => (
        <div key={b.l} className="mb-2.5">
          <div className="flex justify-between text-[11.5px] mb-1"><span className="text-[var(--ink-soft)]">{b.l}</span><span className="text-[var(--ink)]">{b.v}%</span></div>
          <div className="h-1.5 rounded-full bg-black/[0.06]"><div className="h-full rounded-full" style={{ width: `${b.v}%`, background: b.c }} /></div>
        </div>
      ))}
      <p className="text-[11px] text-[var(--ink-soft)] mt-3">ABC analysis · reorder alerts · straight-line depreciation</p>
    </div>
  );
}

function TourShopify() {
  return (
    <div className="space-y-2.5">
      {[
        { t: "Products", d: "Two-way — 54 synced", arrow: "⇄" },
        { t: "Orders & refunds", d: "144 imported as sales orders", arrow: "→" },
        { t: "Customers", d: "215 became contacts", arrow: "→" },
        { t: "Stock levels", d: "Matched by SKU, pushed nightly", arrow: "⇄" },
      ].map((r) => (
        <div key={r.t} className="lp-white-card flex items-center gap-3 rounded-xl border border-black/[0.07] bg-white px-4 py-3">
          <span className="text-[15px] text-[hsl(340_40%_55%)] w-6 text-center">{r.arrow}</span>
          <div><p className="text-[13px] text-[var(--ink)]">{r.t}</p><p className="text-[11.5px] text-[var(--ink-soft)]">{r.d}</p></div>
        </div>
      ))}
    </div>
  );
}

function TourLoyalty() {
  return (
    <div className="lp-white-card rounded-xl border border-black/[0.07] bg-white p-4">
      {[
        { n: "Mona A.", t: "Gold", p: "12,450", pill: "bg-amber-100 text-amber-700" },
        { n: "Karim S.", t: "Silver", p: "6,210", pill: "bg-slate-100 text-slate-600" },
        { n: "Layla M.", t: "Gold", p: "11,080", pill: "bg-amber-100 text-amber-700" },
      ].map((m) => (
        <div key={m.n} className="flex items-center justify-between py-2.5 border-b border-black/[0.05] last:border-0">
          <p className="text-[13px] text-[var(--ink)]">{m.n}</p>
          <div className="flex items-center gap-2.5">
            <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium ${m.pill}`}>{m.t}</span>
            <p className="text-[12.5px] text-[var(--ink)] tabular-nums w-14 text-right">{m.p}</p>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-[var(--ink-soft)] mt-3">Points land on Shopify profiles · redemptions mint discount codes</p>
    </div>
  );
}

/* ─── Pricing ─────────────────────────────────────────── */

type NeedKey = "production" | "shopify" | "custom";
const NEEDS: { key: NeedKey; label: string }[] = [
  { key: "production", label: "Production & manufacturing" },
  { key: "shopify", label: "Shopify sync & loyalty" },
  { key: "custom", label: "Custom work included" },
];

interface Plan {
  key: string; name: string; tagline: string;
  base: number; perUser: number; cap?: number;
  covers: NeedKey[]; features: string[];
}

const PLANS: Plan[] = [
  {
    key: "apprentice", name: "Apprentice", tagline: "For one person, starting out", base: 0, perUser: 0, cap: 1,
    covers: [],
    features: ["1 user, free forever", "Contacts, products & quotations", "Arabic & English", "Community help"],
  },
  {
    key: "scribe", name: "Scribe", tagline: "For teams that make and sell", base: 900, perUser: 299,
    covers: ["production"],
    features: ["Everything in Apprentice", "Sales orders & invoicing", "Inventory, assets & ABC analysis", "Production planning & pattern making", "Reports & dashboards", "Email support"],
  },
  {
    key: "temple", name: "Temple", tagline: "The whole house of records", base: 4999, perUser: 499,
    covers: ["production", "shopify", "custom"],
    features: ["Everything in Scribe", "Two-way Shopify sync", "Loyalty program & campaigns", "HR, quality & delivery modules", "Priority support, same-day", "One custom-build day, every month"],
  },
];

function Pricing({ goAuth }: { goAuth: () => void }) {
  const [users, setUsers] = useState(5);
  const [yearly, setYearly] = useState(false);
  const [needs, setNeeds] = useState<Set<NeedKey>>(new Set());

  const recommended = useMemo(() => {
    if (users === 1 && needs.size === 0) return "apprentice";
    if (needs.has("shopify") || needs.has("custom")) return "temple";
    return "scribe";
  }, [users, needs]);

  function toggleNeed(k: NeedKey) {
    setNeeds((prev) => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  }

  return (
    <div>
      {/* Controls */}
      <div className="mx-auto max-w-[760px] rounded-2xl border border-[var(--line)] bg-[var(--night-2)] p-6 sm:p-7 mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <p className="text-[15px] text-[var(--moon)]">
            <span className="text-[26px] align-middle tabular-nums mr-2" style={serif}>{users}</span>
            {users === 1 ? "person uses THOTH" : "people use THOTH"}
          </p>
          <div className="flex items-center rounded-full border border-[var(--line)] p-1" role="group" aria-label="Billing period">
            {[{ v: false, l: "Monthly" }, { v: true, l: "Yearly · 2 months free" }].map((o) => (
              <button key={o.l} onClick={() => setYearly(o.v)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${yearly === o.v ? "bg-[var(--gold)] text-[var(--gold-ink)]" : "text-[var(--moon-dim)] hover:text-[var(--moon)]"}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <input type="range" min={1} max={40} value={users} onChange={(e) => setUsers(parseInt(e.target.value))}
          className="lp-range w-full" aria-label="Team size"
          style={{ ["--p" as string]: `${((users - 1) / 39) * 100}` }} />
        <div className="flex justify-between text-[11px] text-[var(--moon-dim)] mt-1.5"><span>Just me</span><span>40 people</span></div>

        <div className="flex flex-wrap gap-2 mt-6">
          <span className="text-[12px] text-[var(--moon-dim)] py-1.5">We need:</span>
          {NEEDS.map((n) => (
            <button key={n.key} onClick={() => toggleNeed(n.key)} aria-pressed={needs.has(n.key)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                needs.has(n.key)
                  ? "border-[var(--gold)] bg-[hsl(340_40%_55%/0.1)] text-[var(--gold)]"
                  : "border-[var(--line)] text-[var(--moon-dim)] hover:text-[var(--moon)]"}`}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        {PLANS.map((p) => (
          <PlanCard key={p.key} plan={p} users={users} yearly={yearly} needs={needs}
            recommended={recommended === p.key} goAuth={goAuth} />
        ))}
        {/* Dynasty — custom */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-2xl border border-[var(--line)] bg-[var(--night-2)] p-6 flex flex-col"
        >
          <h3 className="text-[22px] text-[var(--moon)] mb-1" style={serif}>Dynasty</h3>
          <p className="text-[12.5px] text-[var(--moon-dim)] mb-5">For groups, franchises & ambitions</p>
          <p className="text-[30px] text-[var(--moon)] leading-none mb-1" style={serif}>Let's talk</p>
          <p className="text-[12px] text-[var(--moon-dim)] mb-6">Your modules, your servers if you wish</p>
          <ul className="space-y-2.5 text-[12.5px] text-[var(--moon-dim)] mb-6">
            {["Unlimited users & branches", "Dedicated success engineer", "Anything custom — built in one day", "On-premise option"].map((f) => (
              <li key={f} className="flex gap-2.5"><Check size={14} className="text-[var(--gold)] shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <a href="mailto:hello@thoth.app" className="mt-auto inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-[var(--gold)] text-[var(--gold)] text-[13.5px] font-medium hover:bg-[hsl(340_40%_55%/0.08)] transition-colors">
            Talk to the builders <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>

      <p className="text-center text-[12px] text-[var(--moon-dim)] mt-8">
        Prices in Egyptian pounds. Cancel anytime. Every plan speaks Arabic and English equally well.
      </p>
    </div>
  );
}

function PlanCard({ plan, users, yearly, needs, recommended, goAuth }: {
  plan: Plan; users: number; yearly: boolean; needs: Set<NeedKey>; recommended: boolean; goAuth: () => void;
}) {
  const overCap = plan.cap !== undefined && users > plan.cap;
  const missing = [...needs].filter((n) => !plan.covers.includes(n));
  const unfit = overCap || missing.length > 0;
  const billedUsers = plan.cap ? Math.min(users, plan.cap) : users;
  const monthly = plan.base + plan.perUser * billedUsers;
  const effective = yearly ? Math.round(monthly * 10 / 12) : monthly;
  const shown = useEasedNumber(effective);
  const perHead = billedUsers > 0 ? Math.round(effective / billedUsers) : 0;

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.25, ease: EASE_OUT_QUINT } }}
      className={`relative rounded-2xl p-6 flex flex-col border bg-[var(--night-2)] transition-shadow duration-500 ${
        recommended ? "border-[var(--gold)] shadow-[0_24px_60px_-18px_hsl(340_40%_55%/0.25)]" : "border-[var(--line)]"} ${
        unfit ? "opacity-55" : "opacity-100"}`}
    >
      {recommended && (
        <span className="absolute -top-3 left-6 text-[11px] font-semibold px-3 py-1 rounded-full bg-[var(--gold)] text-[var(--gold-ink)]">
          Best for your {users === 1 ? "one" : users}
        </span>
      )}
      <h3 className="text-[22px] text-[var(--moon)] mb-1" style={serif}>{plan.name}</h3>
      <p className="text-[12.5px] text-[var(--moon-dim)] mb-5">{plan.tagline}</p>

      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-[34px] leading-none text-[var(--moon)] tabular-nums" style={serif}>
          {plan.base === 0 && plan.perUser === 0 ? "0" : egp(shown)}
        </span>
        <span className="text-[13px] text-[var(--moon-dim)]">EGP / month</span>
      </div>
      <p className="text-[11.5px] text-[var(--moon-dim)] mb-5 min-h-[17px]">
        {plan.perUser > 0
          ? <>={egp(plan.base)} base + {egp(plan.perUser)} × {billedUsers} {billedUsers === 1 ? "person" : "people"} · ≈{egp(perHead)}/person{yearly ? " · billed yearly" : ""}</>
          : plan.cap === 1 ? "One seat, zero pounds" : ""}
      </p>

      <ul className="space-y-2.5 text-[12.5px] text-[var(--moon-dim)] mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2.5"><Check size={14} className="text-[var(--gold)] shrink-0 mt-0.5" />{f}</li>
        ))}
        {missing.map((m) => (
          <li key={m} className="flex gap-2.5 text-[hsl(4_60%_48%)]">
            <Minus size={14} className="shrink-0 mt-0.5" />No {NEEDS.find((n) => n.key === m)?.label.toLowerCase()}
          </li>
        ))}
        {overCap && (
          <li className="flex gap-2.5 text-[hsl(4_60%_48%)]"><Minus size={14} className="shrink-0 mt-0.5" />Limited to 1 user — you need {users}</li>
        )}
      </ul>

      <button onClick={goAuth}
        className={`mt-auto h-11 rounded-xl text-[13.5px] font-medium transition-all ${
          recommended
            ? "bg-[var(--gold)] text-[var(--gold-ink)] hover:brightness-110"
            : "border border-[var(--line)] text-[var(--moon)] hover:border-[var(--moon-dim)]"}`}>
        {plan.base === 0 ? "Start free" : `Start with ${plan.name}`}
      </button>
    </motion.div>
  );
}

/* ─── FAQ ─────────────────────────────────────────────── */

const FAQS = [
  { q: "What exactly is THOTH?", a: "A business operating system: sales, quotations, production, inventory, Shopify, loyalty, HR, quality, delivery and analytics in one place — instead of seven spreadsheets and three apps. You run your day inside it; it writes the records for you." },
  { q: "Is Arabic really first-class?", a: "Yes — every screen, every field, every report exists in Arabic and English. Not a translation layer bolted on later; both languages were in the first commit." },
  { q: "Can it import my Shopify store?", a: "Connect your store in five minutes — no developer needed. Products, orders, customers and stock levels flow in (and back out, if you choose). You decide per data type: import, export, two-way, or off." },
  { q: 'What does "custom in one day" mean?', a: "Tell us what your business does differently — a field, a workflow, a report, a whole module. Our engineers reshape THOTH around it and ship it to your workspace within one working day. Temple plans include one such day every month." },
  { q: "What happens when I outgrow the free plan?", a: "Your data stays exactly where it is. Add a second user and pick a plan — the calculator above does the honest math, including the per-person cost." },
  { q: "Where does my data live?", a: "Encrypted, in dedicated cloud infrastructure, isolated per workspace. Dynasty plans can run on your own servers." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-[680px]">
      {FAQS.map((f, i) => (
        <div key={f.q} className="border-b border-black/[0.08]">
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
            className="w-full flex items-center justify-between gap-4 py-5 text-left">
            <span className="text-[16px] text-[var(--ink)]" style={serif}>{f.q}</span>
            <ChevronDown size={16} className={`text-[var(--ink-soft)] shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
          </button>
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <p className="pb-5 text-[14px] leading-relaxed text-[var(--ink-soft)] max-w-[60ch]">{f.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────── */

const TOUR_TABS = [
  { key: "work", label: "Orders & work", icon: Hammer, blurb: "Quotation → sales order → production → delivery. One thread, never dropped.", mock: TourWork },
  { key: "inventory", label: "Inventory & assets", icon: Boxes, blurb: "Stock that counts itself: ABC classes, reorder alerts, asset depreciation.", mock: TourInventory },
  { key: "shopify", label: "Shopify sync", icon: ShoppingBag, blurb: "Your store and your back office, finally telling the same story — both ways.", mock: TourShopify },
  { key: "loyalty", label: "Loyalty", icon: Gift, blurb: "Points, tiers and campaigns that show up right on the customer's Shopify profile.", mock: TourLoyalty },
];

const ACTS = [
  {
    n: "I", icon: PenLine, title: "He invented writing.",
    sub: "THOTH writes everything down",
    body: "Every quotation, site visit, measurement and promise becomes a record the moment it happens — in Arabic, in English, on any phone. Nothing lives in someone's head anymore.",
  },
  {
    n: "II", icon: Scale, title: "He kept the accounts of the gods.",
    sub: "THOTH counts everything",
    body: "Stock value to the pound. Asset depreciation to the month. Payments, points, payroll hours. The numbers reconcile themselves while you sleep.",
  },
  {
    n: "III", icon: Eye, title: "He recorded the judgement.",
    sub: "THOTH helps you decide",
    body: "Dashboards that surface the slow-moving stock, the late order, the customer drifting away — before they cost you. The verdict, every morning, in one glance.",
  },
];

export default function Landing() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tab, setTab] = useState("work");
  const reduced = useReducedMotion();

  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (progressRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goAuth = () => navigate("/auth");
  const activeTour = TOUR_TABS.find((t) => t.key === tab) ?? TOUR_TABS[0];
  const ActiveMock = activeTour.mock;

  const heroWords = "Five thousand years of bookkeeping experience.".split(" ");

  return (
    <div style={{ ...LP_VARS, fontFamily: "'DM Sans', sans-serif" }} className="bg-[var(--night)] text-[var(--moon)] [text-rendering:optimizeLegibility]">
      <style>{`
        .lp-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 99px;
          background: linear-gradient(to right, var(--gold) 0%, var(--gold) calc(var(--p, 10) * 1%), hsl(120 8% 84%) calc(var(--p, 10) * 1%)); outline: none; }
        .lp-range::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: var(--gold); border: 3px solid hsl(42 35% 97%); box-shadow: 0 0 0 1.5px var(--gold); cursor: grab; }
        .lp-range::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: var(--gold); border: 3px solid hsl(42 35% 97%); box-shadow: 0 0 0 1.5px var(--gold); cursor: grab; }

        .lp-ticker { animation: lpTick 36s linear infinite; }
        .lp-ticker:hover { animation-play-state: paused; }
        @keyframes lpTick { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .lp-glyph path { animation: lpBreathe var(--dur, 10s) ease-in-out var(--delay, 0s) infinite alternate; transform-origin: center; transform-box: fill-box; }
        @keyframes lpBreathe { from { transform: translateY(-7px) rotate(-2.5deg); opacity: 0.55; }
                               to { transform: translateY(7px) rotate(2.5deg); opacity: 1; } }

        .lp-ibis-glide { animation: lpGlide 34s linear 3s infinite; opacity: 0; will-change: transform; }
        @keyframes lpGlide {
          0% { transform: translate(-8vw, 0); opacity: 0; }
          6% { opacity: 1; }
          25% { transform: translate(28vw, -26px); }
          50% { transform: translate(56vw, 10px); }
          75% { transform: translate(82vw, -18px); }
          94% { opacity: 1; }
          100% { transform: translate(110vw, 0); opacity: 0; }
        }

        .lp-bob { animation: lpBob 5.5s ease-in-out infinite alternate; }
        @keyframes lpBob { from { transform: translateY(0); } to { transform: translateY(-9px); } }

        .lp-progress { transform: scaleX(0); transform-origin: left; transition: transform 80ms linear; }

        .lp-cta { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), filter 0.2s, box-shadow 0.25s; }
        .lp-cta:hover { transform: translateY(-2px) scale(1.025); box-shadow: 0 14px 32px -10px hsl(340 40% 55% / 0.45); }
        .lp-cta:active { transform: translateY(0) scale(0.97); }

        .lp-logo svg { transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        .lp-logo:hover svg { transform: rotate(-8deg) translateY(-1px); }

        @media (prefers-reduced-motion: reduce) {
          .lp-ticker, .lp-glyph path, .lp-ibis-glide, .lp-bob { animation: none; }
          .lp-ibis-glide { opacity: 0; }
          .lp-cta, .lp-cta:hover { transform: none; }
        }

        /* ─── Dark mode overrides ─────────────────────────── */
        .dark {
          --night: hsl(220 14% 12%);
          --night-2: hsl(220 14% 16%);
          --night-3: hsl(220 14% 19%);
          --line: hsl(220 10% 22%);
          --moon: hsl(42 30% 93%);
          --moon-dim: hsl(220 8% 58%);
          --gold: hsl(340 35% 65%);
          --gold-ink: hsl(220 14% 12%);
          --gold-deep: hsl(340 38% 52%);
          --lapis: hsl(200 40% 62%);
          --cream: hsl(220 14% 16%);
          --ink: hsl(42 30% 93%);
          --ink-soft: hsl(220 8% 58%);
        }
        .dark .lp-header-scrolled {
          background: hsl(220 14% 12% / 0.88) !important;
        }
        .dark .lp-mock-card {
          background: hsl(220 14% 16%) !important;
          border-color: hsl(220 10% 22%) !important;
        }
        .dark .lp-mock-inner {
          background: hsl(220 14% 12%) !important;
          border-color: hsl(220 10% 22%) !important;
        }
        .dark .lp-tour-card {
          background: hsl(220 14% 16%) !important;
          border-color: hsl(220 10% 22%) !important;
        }
        .dark .lp-prog-bar {
          background: hsl(220 10% 22%) !important;
        }
        .dark .lp-prog-fill {
          background: hsl(340 35% 65%) !important;
        }
        .dark .lp-white-card {
          background: hsl(220 14% 18%) !important;
          border-color: hsl(220 10% 24%) !important;
          color: hsl(42 30% 93%);
        }
        .dark .lp-white-card-p {
          color: hsl(220 8% 58%);
        }
        .dark .lp-white-card-p strong,
        .dark .lp-white-card-p span:not(.lp-white-card-p) {
          color: hsl(42 30% 93%);
        }
        .dark .border-black\/\[0\.07\] {
          border-color: hsl(220 10% 24%) !important;
        }
        .dark .border-black\/\[0\.08\] {
          border-color: hsl(220 10% 24%) !important;
        }
      `}</style>

      {/* ── Nav ──────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? "lp-header-scrolled bg-[hsl(42_35%_97%/0.88)] backdrop-blur-md border-b border-[var(--line)]" : ""}`}>
        <div ref={progressRef} className="lp-progress absolute top-0 inset-x-0 h-[2.5px] bg-[var(--gold)]" aria-hidden />
        <nav className="mx-auto max-w-[1180px] px-6 h-[68px] flex items-center justify-between">
          <a href="#top" className="lp-logo flex items-center gap-2.5 text-[var(--moon)]">
            <IbisMark size={28} stroke="var(--gold)" />
            <span className="text-[19px] tracking-[0.12em]" style={serif}>THOTH</span>
          </a>
          <div className="hidden md:flex items-center gap-7 text-[13.5px] text-[var(--moon-dim)]">
            <a href="#story" className="hover:text-[var(--moon)] transition-colors">The story</a>
            <a href="#product" className="hover:text-[var(--moon)] transition-colors">Product</a>
            <a href="#pricing" className="hover:text-[var(--moon)] transition-colors">Pricing</a>
            <a href="#team" className="hover:text-[var(--moon)] transition-colors">Team</a>
            <a href="#faq" className="hover:text-[var(--moon)] transition-colors">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button onClick={goAuth} className="text-[13.5px] text-[var(--moon-dim)] hover:text-[var(--moon)] transition-colors px-2 py-2">Sign in</button>
            <button onClick={goAuth} className="lp-cta h-10 px-5 rounded-xl bg-[var(--gold)] text-[var(--gold-ink)] text-[13.5px] font-semibold hover:brightness-110">
              Begin free
            </button>
          </div>
          <button className="md:hidden p-2 text-[var(--moon)]" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[var(--night)] flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-10">
              <span className="flex items-center gap-2.5"><IbisMark size={26} stroke="var(--gold)" /><span className="text-[18px] tracking-[0.12em]" style={serif}>THOTH</span></span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-2"><X size={22} /></button>
              </div>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              {["story", "product", "pricing", "team", "faq"].map((id) => (
                <motion.a key={id} variants={fadeUp} href={`#${id}`} onClick={() => setMenuOpen(false)}
                  className="py-4 text-[26px] capitalize border-b border-[var(--line)] block" style={serif}>{id === "story" ? "The story" : id}</motion.a>
              ))}
            </motion.div>
            <button onClick={goAuth} className="mt-8 h-12 rounded-xl bg-[var(--gold)] text-[var(--gold-ink)] text-[15px] font-semibold">Begin free</button>
            <button onClick={goAuth} className="mt-3 h-12 rounded-xl border border-[var(--line)] text-[15px]">Sign in</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ─────────────────────────────────────── */}
      <section id="top" className="relative overflow-hidden pt-[150px] pb-24 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.28, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE_OUT_QUINT }}
          className="absolute left-1/2 -translate-x-1/2 top-[36px] w-[560px] max-w-[88vw] pointer-events-none"
        >
          <MoonDisc className="w-full" />
        </motion.div>
        <GlyphField />

        <div className="relative mx-auto max-w-[900px] px-6 text-center">
          <Reveal delay={0.1}>
            <p className="text-[15px] text-[var(--gold)] mb-6" dir="rtl" lang="ar">
              تحوت — كاتب الآلهة وحافظ الحسابات
            </p>
          </Reveal>

          <h1 className="text-[clamp(2.5rem,6.2vw,4.9rem)] leading-[1.06] [text-wrap:balance] mb-7" style={{ ...serif, letterSpacing: "-0.02em" }}>
            {heroWords.map((w, i) => (
              <motion.span
                key={i}
                initial={reduced ? false : { opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: EASE_OUT_QUINT, delay: 0.18 + i * 0.065 }}
                className="inline-block mr-[0.26em]"
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <Reveal delay={0.7}>
            <p className="text-[17px] leading-relaxed text-[var(--moon-dim)] max-w-[58ch] mx-auto mb-10">
              THOTH is the business operating system named for the god who wrote, counted and remembered
              everything. Sales, production, inventory, Shopify, loyalty and people — one system,
              two languages, built in Egypt for fashion brands and garment manufacturers.
            </p>
          </Reveal>

          <Reveal delay={0.85}>
            <div className="flex flex-wrap items-center justify-center gap-3.5 mb-20">
              <button onClick={goAuth} className="lp-cta h-12 px-7 rounded-xl bg-[var(--gold)] text-[var(--gold-ink)] text-[15px] font-semibold hover:brightness-110 inline-flex items-center gap-2">
                Start free — one user, forever <ArrowRight size={16} />
              </button>
              <a href="#pricing" className="h-12 px-6 rounded-xl border border-[var(--line)] text-[15px] text-[var(--moon)] hover:border-[var(--moon-dim)] transition-colors inline-flex items-center">
                Do the pricing math
              </a>
            </div>
          </Reveal>
        </div>

        <HeroMock />
      </section>

      {/* ── Ticker ───────────────────────────────────── */}
      <div className="border-y border-[var(--line)] py-3.5 overflow-hidden" aria-hidden>
        <div className="lp-ticker flex w-max whitespace-nowrap text-[13px] text-[var(--moon-dim)]">
          {[0, 1].map((k) => (
            <span key={k} className="flex">
              {["Sales orders", "Quotations", "Production planning", "Pattern making", "Inventory", "ABC analysis", "Asset depreciation", "Shopify two-way sync", "Loyalty points", "HR & workforce", "Quality control", "Delivery & installation", "Executive analytics", "عربي · English"].map((s) => (
                <span key={s} className="mx-6 flex items-center gap-6">{s}<span className="text-[var(--gold)]">·</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── The story ────────────────────────────────── */}
      <section id="story" className="py-28 sm:py-36">
        <div className="mx-auto max-w-[1080px] px-6">
          <Reveal>
            <h2 className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.12] [text-wrap:balance] max-w-[22ch]" style={{ ...serif, letterSpacing: "-0.015em" }}>
              Five thousand years ago, every business in Egypt ran on him.
            </h2>
            <p className="text-[16px] text-[var(--moon-dim)] max-w-[56ch] mt-5 leading-relaxed">
              Thoth — ibis-headed, moon-keeping — was the scribe of the gods: inventor of writing, keeper of
              accounts, recorder of the final judgement. We took the job description literally.
            </p>
          </Reveal>

          <motion.div
            className="mt-20 space-y-20"
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {ACTS.map((act, i) => (
              <motion.div key={act.n} variants={fadeUp}
                className={`flex flex-col md:flex-row gap-8 md:gap-14 items-start ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                <div className="flex items-start gap-6 md:w-[46%] shrink-0">
                  <span className="text-[64px] leading-none text-[hsl(340_25%_80%)] select-none" style={serif}>{act.n}</span>
                  <div className="pt-2">
                    <p className="text-[22px] sm:text-[26px] leading-snug text-[var(--moon)]" style={serif}>{act.title}</p>
                    <p className="text-[13px] text-[var(--gold)] mt-2 font-medium">{act.sub}</p>
                  </div>
                </div>
                <div className="md:pt-3 flex gap-5">
                  <act.icon size={20} className="text-[var(--gold)] shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-[15.5px] leading-relaxed text-[var(--moon-dim)] max-w-[48ch]">{act.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Product tour (cream) ─────────────────────── */}
      <section id="product" className="bg-[var(--cream)] text-[var(--ink)] py-24 sm:py-32">
        <div className="mx-auto max-w-[1080px] px-6">
          <Reveal>
            <h2 className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.12] [text-wrap:balance]" style={{ ...serif, letterSpacing: "-0.015em" }}>
              One place to run the whole day.
            </h2>
            <p className="text-[16px] text-[var(--ink-soft)] max-w-[58ch] mt-4 leading-relaxed">
              This is the actual product, not a brochure: the same cream-paper screens your team will
              use tomorrow morning, on a laptop or a phone, in either language.
            </p>
          </Reveal>

          <div className="mt-12 flex flex-wrap gap-2">
            {TOUR_TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} aria-pressed={tab === t.key}
                className={`inline-flex items-center gap-2 px-4 h-10 rounded-full text-[13px] font-medium border transition-all ${
                  tab === t.key ? "bg-[var(--ink)] text-[var(--cream)] border-[var(--ink)]" : "border-black/15 text-[var(--ink-soft)] hover:border-black/30"}`}>
                <t.icon size={14} strokeWidth={1.75} /> {t.label}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_1.25fr] gap-8 items-start">
            <div className="md:pt-4">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_QUINT }}
                  className="text-[19px] leading-snug text-[var(--ink)] max-w-[30ch]"
                  style={serif}
                >
                  {activeTour.blurb}
                </motion.p>
              </AnimatePresence>
              <button onClick={goAuth} className="mt-7 inline-flex items-center gap-2 text-[14px] font-medium text-[hsl(340_38%_45%)] hover:gap-3 transition-all">
                Try it with your own data <ArrowRight size={15} />
              </button>
            </div>
            <div className="lp-tour-card rounded-2xl border border-black/[0.08] bg-[hsl(42_35%_97%)] p-4 sm:p-5 shadow-[0_24px_60px_-30px_hsl(220_12%_18%/0.25)] min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_QUINT }}
                >
                  <ActiveMock />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* How to begin */}
          <div className="mt-28">
            <Reveal>
              <h3 className="text-[clamp(1.5rem,3vw,2.2rem)]" style={{ ...serif, letterSpacing: "-0.01em" }}>Begin in an afternoon.</h3>
            </Reveal>
            <motion.div
              className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {[
                { n: "1", t: "Open your workspace", d: "Sign up free — no card, no call. Pick Arabic, English, or both." },
                { n: "2", t: "Bring your data", d: "Connect Shopify and watch products, orders and customers import themselves. Or start from a CSV. Or start clean." },
                { n: "3", t: "Run tomorrow inside it", d: "Take an order, send it to production, deliver it, get paid — THOTH writes the story as you work." },
              ].map((s) => (
                <motion.div key={s.n} variants={fadeUp} className="flex gap-4">
                  <span className="w-9 h-9 rounded-full border border-black/20 flex items-center justify-center text-[15px] shrink-0" style={serif}>{s.n}</span>
                  <div>
                    <p className="text-[16px] font-medium mb-1.5">{s.t}</p>
                    <p className="text-[13.5px] text-[var(--ink-soft)] leading-relaxed">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── One-day promise (gold drench) ────────────── */}
      <section className="bg-[var(--gold-deep)] text-[var(--gold-ink)] py-20 sm:py-24">
        <div className="mx-auto max-w-[1080px] px-6 flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
          <Reveal className="md:flex-1">
            <p className="text-[15px] mb-3 font-medium" dir="rtl" lang="ar">يُصمَّم على مقاسك</p>
            <h2 className="text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1.1] [text-wrap:balance]" style={{ ...serif, letterSpacing: "-0.015em" }}>
              Anything custom, built in one day.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:w-[40%]">
            <p className="text-[15.5px] leading-relaxed mb-6 text-[hsl(340_38%_88%)]">
              A field your fashion brand needs. A report your accountant insists on. A whole workflow nobody
              else has. Tell us in the morning — it's in your workspace by evening. That's not a roadmap
              promise; it's how we work.
            </p>
            <a href="mailto:hello@thoth.app" className="lp-cta inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[hsl(42_35%_97%)] text-[var(--gold-deep)] text-[14px] font-medium">
              Tell us what you need <ArrowRight size={15} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1180px] px-6">
          <Reveal>
            <h2 className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.12] text-center [text-wrap:balance]" style={{ ...serif, letterSpacing: "-0.015em" }}>
              Pricing that does the math with you.
            </h2>
            <p className="text-[16px] text-[var(--moon-dim)] text-center max-w-[52ch] mx-auto mt-4 mb-14 leading-relaxed">
              Slide to your team size, tell us what you need — the right plan steps forward
              and shows its honest total.
            </p>
          </Reveal>
          <Reveal delay={0.1}><Pricing goAuth={goAuth} /></Reveal>
        </div>
      </section>

      {/* ── Team (cream) ─────────────────────────────── */}
      <section id="team" className="bg-[var(--cream)] text-[var(--ink)] py-24 sm:py-28">
        <div className="mx-auto max-w-[780px] px-6">
          <Reveal>
            <h2 className="text-[clamp(1.8rem,3.6vw,2.7rem)] leading-[1.15] [text-wrap:balance] mb-8" style={{ ...serif, letterSpacing: "-0.012em" }}>
              Built in Cairo, by people who built the big ones.
            </h2>
            <div className="text-[16px] leading-[1.85] text-[var(--ink-soft)] space-y-5 [text-wrap:pretty]">
              <p>
                We are Egyptian engineers who spent years inside the world's largest ERP houses —
                implementing them, extending them, and quietly collecting everything we'd do differently.
                The systems were powerful; they were also foreign, in every sense. Wrong language, wrong
                timezone, wrong assumptions about how a workshop in Sixth of October actually runs.
              </p>
              <p>
                So we built the one we wished existed: international-grade engineering with a local soul.
                Arabic that isn't an afterthought. Support in your working hours. Customization measured in
                days, not quarters. The god of records would have insisted on nothing less.
              </p>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <IbisMark size={34} stroke="var(--gold-deep)" />
              <div>
                <p className="text-[15px]" style={serif}>The THOTH team</p>
                <p className="text-[12.5px] text-[var(--ink-soft)]">Cairo, Egypt · القاهرة</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ (cream continues) ────────────────────── */}
      <section id="faq" className="bg-[var(--cream)] text-[var(--ink)] pb-28">
        <div className="mx-auto max-w-[1080px] px-6">
          <Reveal>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] mb-10" style={{ ...serif, letterSpacing: "-0.01em" }}>Questions, answered.</h2>
          </Reveal>
          <Reveal delay={0.08}><FAQ /></Reveal>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 sm:py-36 text-center">
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[260px] w-[520px] opacity-[0.14] pointer-events-none" aria-hidden>
          <MoonDisc className="w-full" />
        </div>
        <div className="relative mx-auto max-w-[640px] px-6">
          <Reveal>
            <h2 className="text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.1] [text-wrap:balance] mb-6" style={{ ...serif, letterSpacing: "-0.015em" }}>
              Let THOTH start writing.
            </h2>
            <p className="text-[16px] text-[var(--moon-dim)] mb-9">Free for one user. Five minutes to your first record.</p>
            <button onClick={goAuth} className="lp-cta px-8 py-3.5 rounded-xl bg-[var(--gold)] text-[var(--gold-ink)] text-[15.5px] font-semibold hover:brightness-110 inline-flex items-center gap-2.5">
              Open your workspace <ArrowRight size={17} />
            </button>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-[var(--line)] py-14">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="lg:w-[300px]">
              <div className="flex items-center gap-2.5 mb-4">
                <IbisMark size={26} stroke="var(--gold)" />
                <span className="text-[17px] tracking-[0.12em]" style={serif}>THOTH</span>
              </div>
              <p className="text-[13px] text-[var(--moon-dim)] leading-relaxed max-w-[34ch]">
                The business operating system named for the god of records. Built in Cairo, fluent in
                Arabic and English.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 flex-1 text-[13px]">
              {[
                { h: "Product", links: [
                  { l: "Features", href: "#product" },
                  { l: "Pricing", href: "#pricing" },
                  { l: "Shopify integration", href: "#product" },
                  { l: "The story", href: "#story" },
                ] },
                { h: "Company", links: [
                  { l: "About", href: "#story" },
                  { l: "Team", href: "#team" },
                  { l: "Careers", href: "mailto:hello@thoth.app?subject=Careers" },
                  { l: "Contact", href: "mailto:hello@thoth.app" },
                ] },
                { h: "Resources", links: [
                  { l: "FAQ", href: "#faq" },
                  { l: "Custom builds", href: "mailto:hello@thoth.app?subject=Custom%20build" },
                  { l: "Help center", href: "mailto:hello@thoth.app?subject=Help" },
                ] },
                { h: "Legal", links: [
                  { l: "Privacy", href: "mailto:hello@thoth.app?subject=Privacy" },
                  { l: "Terms", href: "mailto:hello@thoth.app?subject=Terms" },
                  { l: "Security", href: "#faq" },
                ] },
              ].map((col) => (
                <div key={col.h}>
                  <p className="text-[var(--moon)] font-medium mb-3.5">{col.h}</p>
                  <ul className="space-y-2.5">
                    {col.links.map(({ l, href }) => (
                      <li key={l}>
                        <a href={href} className="text-[var(--moon-dim)] hover:text-[var(--moon)] transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--moon-dim)]">
            <p>© 2026 THOTH · Cairo, Egypt</p>
            <p dir="rtl" lang="ar">تحوت — نظام تشغيل الأعمال</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
