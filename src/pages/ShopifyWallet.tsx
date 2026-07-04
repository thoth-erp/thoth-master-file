/**
 * Shopify Kit · Wallet — store credit & cashback console
 * عدة شوبيفاي · المحفظة — رصيد المتجر والكاش باك
 *
 * Tabs: Overview (liability KPIs + activity) · Customers (balances, manual
 * adjust) · Rules (cashback, refunds-to-credit, welcome/birthday/referral,
 * expiry) · Design (live storefront widget customizer) · Settings.
 * Demo mode: config persists to localStorage via lib/shopify-kit.
 */

import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "../context/LanguageContext";
import { loadKitState, setAppEnabled, loadAppConfig, saveAppConfig } from "../lib/shopify-kit";
import {
  Wallet, Check, X, Search, Plus, Minus, ChevronLeft,
  TrendingUp, TrendingDown, Users, Coins, Gift, Cake,
  UserPlus, Clock, Sparkles, RefreshCw, Bell, Mail,
  Smartphone, MessageSquare, ShoppingBag,
  Sun, Moon, AlertTriangle, CreditCard, Crown,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────

type CornerPos = "bottom-right" | "bottom-left" | "top-right" | "top-left";
type LauncherStyle = "icon" | "icon_balance";
type LauncherIcon = "wallet" | "gift" | "sparkles";

interface WalletConfig {
  // rules
  cashbackOn: boolean; cashbackPct: number;
  tierMultipliers: { bronze: number; silver: number; gold: number; vip: number };
  refundToWalletOn: boolean; refundBonusPct: number;
  welcomeOn: boolean; welcomeAmount: number;
  birthdayOn: boolean; birthdayAmount: number;
  referralOn: boolean; referralAdvocate: number; referralFriend: number;
  expiryOn: boolean; expiryMonths: number; expiryReminderDays: number;
  // design
  position: CornerPos; color: string; radius: number;
  launcherStyle: LauncherStyle; launcherIcon: LauncherIcon;
  titleEn: string; titleAr: string;
  // settings
  currency: "EGP" | "SAR" | "AED" | "USD";
  maxBalance: number;
  partialPay: boolean; showInAccount: boolean;
  notifyEmail: boolean; notifySms: boolean; notifyPush: boolean;
}

const DEFAULT_CONFIG: WalletConfig = {
  cashbackOn: true, cashbackPct: 3,
  tierMultipliers: { bronze: 1, silver: 1.25, gold: 1.5, vip: 2 },
  refundToWalletOn: true, refundBonusPct: 5,
  welcomeOn: true, welcomeAmount: 50,
  birthdayOn: true, birthdayAmount: 100,
  referralOn: true, referralAdvocate: 100, referralFriend: 50,
  expiryOn: true, expiryMonths: 12, expiryReminderDays: 14,
  position: "bottom-right", color: "#059669", radius: 16,
  launcherStyle: "icon_balance", launcherIcon: "wallet",
  titleEn: "My Wallet", titleAr: "محفظتي",
  currency: "EGP", maxBalance: 10000,
  partialPay: true, showInAccount: true,
  notifyEmail: true, notifySms: false, notifyPush: true,
};

const SWATCHES = ["#059669", "#0ea5e9", "#7c3aed", "#e11d48", "#d97706", "#111827"];

function fmtMoney(n: number, cur: WalletConfig["currency"], ar: boolean): string {
  const v = n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const label = ar ? ({ EGP: "ج.م", SAR: "ر.س", AED: "د.إ", USD: "$" } as const)[cur] : cur;
  return ar ? `${v} ${label}` : `${label} ${v}`;
}

// ─── Demo data ───────────────────────────────────────────

type TxKind = "earn" | "spend" | "refund" | "gift" | "expire";

interface WalletCustomer {
  id: string; nameEn: string; nameAr: string; email: string;
  tier: "bronze" | "silver" | "gold" | "vip";
  balance: number; lifetimeEarned: number; lifetimeSpent: number;
  lastActivity: string; expiringSoon?: number;
}

const CUSTOMERS_SEED: WalletCustomer[] = [
  { id: "wc-01", nameEn: "Nour El-Sayed", nameAr: "نور السيد", email: "nour.s@gmail.com", tier: "vip", balance: 1840, lifetimeEarned: 6320, lifetimeSpent: 4480, lastActivity: "2026-07-02" },
  { id: "wc-02", nameEn: "Omar Khaled", nameAr: "عمر خالد", email: "omar.kh@outlook.com", tier: "gold", balance: 925, lifetimeEarned: 3150, lifetimeSpent: 2225, lastActivity: "2026-07-01", expiringSoon: 120 },
  { id: "wc-03", nameEn: "Farida Mansour", nameAr: "فريدة منصور", email: "farida.m@gmail.com", tier: "gold", balance: 710, lifetimeEarned: 2890, lifetimeSpent: 2180, lastActivity: "2026-06-28" },
  { id: "wc-04", nameEn: "Youssef Adel", nameAr: "يوسف عادل", email: "y.adel@yahoo.com", tier: "silver", balance: 430, lifetimeEarned: 1260, lifetimeSpent: 830, lastActivity: "2026-06-30" },
  { id: "wc-05", nameEn: "Salma Ibrahim", nameAr: "سلمى إبراهيم", email: "salma.ib@gmail.com", tier: "silver", balance: 285, lifetimeEarned: 940, lifetimeSpent: 655, lastActivity: "2026-06-25", expiringSoon: 60 },
  { id: "wc-06", nameEn: "Karim Fathy", nameAr: "كريم فتحي", email: "karim.f@gmail.com", tier: "bronze", balance: 120, lifetimeEarned: 310, lifetimeSpent: 190, lastActivity: "2026-06-22" },
  { id: "wc-07", nameEn: "Laila Hassan", nameAr: "ليلى حسن", email: "laila.h@gmail.com", tier: "bronze", balance: 75, lifetimeEarned: 75, lifetimeSpent: 0, lastActivity: "2026-06-20" },
];

const ACTIVITY: { kind: TxKind; whoEn: string; whoAr: string; amount: number; noteEn: string; noteAr: string; when: string }[] = [
  { kind: "earn", whoEn: "Nour El-Sayed", whoAr: "نور السيد", amount: 96, noteEn: "3% cashback · order #2841", noteAr: "كاش باك 3% · طلب #2841", when: "2h" },
  { kind: "spend", whoEn: "Omar Khaled", whoAr: "عمر خالد", amount: -250, noteEn: "Applied at checkout · order #2839", noteAr: "استخدم عند الدفع · طلب #2839", when: "5h" },
  { kind: "refund", whoEn: "Farida Mansour", whoAr: "فريدة منصور", amount: 420, noteEn: "Refund to wallet +5% bonus", noteAr: "استرداد للمحفظة + 5% مكافأة", when: "1d" },
  { kind: "gift", whoEn: "Salma Ibrahim", whoAr: "سلمى إبراهيم", amount: 100, noteEn: "Birthday credit 🎂", noteAr: "رصيد عيد الميلاد 🎂", when: "1d" },
  { kind: "earn", whoEn: "Youssef Adel", whoAr: "يوسف عادل", amount: 54, noteEn: "3% cashback · order #2833", noteAr: "كاش باك 3% · طلب #2833", when: "2d" },
  { kind: "expire", whoEn: "Karim Fathy", whoAr: "كريم فتحي", amount: -40, noteEn: "Credit expired (12 months)", noteAr: "انتهت صلاحية الرصيد (12 شهر)", when: "3d" },
];

const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const MONTHS_AR = ["فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو"];
const ISSUED = [5200, 6100, 5800, 7400, 8200, 9100];
const SPENT = [3900, 4400, 4900, 5600, 6300, 7050];

const TIER_PILL: Record<WalletCustomer["tier"], { en: string; ar: string; cls: string }> = {
  bronze: { en: "Bronze", ar: "برونزي", cls: "bg-orange-50 text-orange-700" },
  silver: { en: "Silver", ar: "فضي", cls: "bg-slate-100 text-slate-600" },
  gold:   { en: "Gold", ar: "ذهبي", cls: "bg-amber-50 text-amber-700" },
  vip:    { en: "VIP", ar: "VIP", cls: "bg-violet-50 text-violet-700" },
};

// ─── Small UI helpers ────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className={`relative w-9 h-5 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-emerald-500" : "bg-muted-foreground/25"}`}>
      <span className={`absolute top-0.5 start-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-4 rtl:-translate-x-4" : ""}`} />
    </button>
  );
}

const cardCls = "border border-border/40 rounded-xl bg-background";
const inputCls = "h-9 px-3 rounded-xl border border-border/80 bg-card text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors";
const numCls = `${inputCls} w-24 tabular-nums`;

function RuleRow({ icon: Icon, titleEn, titleAr, descEn, descAr, on, onToggle, ar, children }: {
  icon: React.ElementType; titleEn: string; titleAr: string; descEn: string; descAr: string;
  on: boolean; onToggle: (v: boolean) => void; ar: boolean; children?: React.ReactNode;
}) {
  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-start gap-3.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${on ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[13.5px] font-medium text-foreground">{ar ? titleAr : titleEn}</h3>
            <Toggle on={on} onChange={onToggle} />
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">{ar ? descAr : descEn}</p>
          {on && children && <div className="mt-3.5 pt-3.5 border-t border-border/30">{children}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Adjust balance modal ────────────────────────────────

function AdjustModal({ customer, cur, ar, onClose, onApply }: {
  customer: WalletCustomer; cur: WalletConfig["currency"]; ar: boolean;
  onClose: () => void; onApply: (delta: number, reason: string) => void;
}) {
  const [mode, setMode] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("goodwill");

  const REASONS = [
    { key: "goodwill", en: "Goodwill gesture", ar: "مجاملة للعميل" },
    { key: "correction", en: "Balance correction", ar: "تصحيح رصيد" },
    { key: "compensation", en: "Order issue compensation", ar: "تعويض عن مشكلة طلب" },
    { key: "promo", en: "Manual promotion", ar: "عرض يدوي" },
  ];

  const amt = parseFloat(amount) || 0;
  const valid = amt > 0 && (mode === "add" || amt <= customer.balance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/25 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-2xl bg-background border border-border/60 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <h3 className="text-[15px] font-medium" style={{ fontFamily: "var(--app-font-serif)" }}>
            {ar ? `تعديل رصيد ${customer.nameAr}` : `Adjust ${customer.nameEn}'s balance`}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>{ar ? "الرصيد الحالي" : "Current balance"}</span>
            <span className="font-medium text-foreground tabular-nums">{fmtMoney(customer.balance, cur, ar)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode("add")}
              className={`h-10 rounded-xl border text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === "add" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
              <Plus size={13} />{ar ? "إضافة رصيد" : "Add credit"}
            </button>
            <button onClick={() => setMode("deduct")}
              className={`h-10 rounded-xl border text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === "deduct" ? "border-rose-300 bg-rose-50 text-rose-700" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
              <Minus size={13} />{ar ? "خصم رصيد" : "Deduct"}
            </button>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">{ar ? "المبلغ" : "Amount"}</label>
            <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
              className={`${inputCls} w-full`} placeholder="0" autoFocus />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">{ar ? "السبب" : "Reason"}</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className={`${inputCls} w-full cursor-pointer`}>
              {REASONS.map(r => <option key={r.key} value={r.key}>{ar ? r.ar : r.en}</option>)}
            </select>
          </div>
          {mode === "deduct" && amt > customer.balance && (
            <p className="text-[11px] text-rose-600 flex items-center gap-1.5"><AlertTriangle size={11} />{ar ? "المبلغ أكبر من الرصيد المتاح" : "Amount exceeds available balance"}</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-border/40 flex justify-end gap-3">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {ar ? "إلغاء" : "Cancel"}
          </button>
          <button disabled={!valid} onClick={() => onApply(mode === "add" ? amt : -amt, reason)}
            className="h-9 px-5 rounded-xl bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40">
            {ar ? "تطبيق" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Storefront live preview ─────────────────────────────

function WidgetPreview({ cfg, dark, ar }: { cfg: WalletConfig; dark: boolean; ar: boolean }) {
  const Icon = cfg.launcherIcon === "wallet" ? Wallet : cfg.launcherIcon === "gift" ? Gift : Sparkles;
  const posCls = {
    "bottom-right": "bottom-3 right-3", "bottom-left": "bottom-3 left-3",
    "top-right": "top-3 right-3", "top-left": "top-3 left-3",
  }[cfg.position];
  const panelSide = cfg.position.endsWith("right") ? "right-3" : "left-3";
  const panelV = cfg.position.startsWith("bottom") ? "bottom-16" : "top-16";

  const frameBg = dark ? "bg-zinc-900" : "bg-white";
  const frameText = dark ? "text-zinc-100" : "text-zinc-800";
  const softText = dark ? "text-zinc-400" : "text-zinc-500";
  const lineBg = dark ? "bg-zinc-700" : "bg-zinc-200";

  return (
    <div className={`relative w-full h-[420px] rounded-2xl border border-border/50 overflow-hidden ${frameBg} transition-colors`}>
      {/* Mock storefront chrome */}
      <div className={`h-10 px-4 flex items-center gap-2 border-b ${dark ? "border-zinc-800" : "border-zinc-100"}`}>
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        <div className={`mx-auto h-5 w-44 rounded-full ${lineBg}`} />
      </div>
      <div className="p-5 space-y-3">
        <div className={`h-4 w-32 rounded ${lineBg}`} />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-2">
              <div className={`h-20 rounded-xl ${lineBg}`} />
              <div className={`h-2.5 w-3/4 rounded ${lineBg}`} />
              <div className={`h-2.5 w-1/2 rounded ${lineBg}`} />
            </div>
          ))}
        </div>
        <div className={`h-2.5 w-2/3 rounded ${lineBg}`} />
        <div className={`h-2.5 w-1/2 rounded ${lineBg}`} />
      </div>

      {/* Open wallet panel */}
      <div className={`absolute ${panelV} ${panelSide} w-[240px] shadow-xl border ${dark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-white"} overflow-hidden`}
        style={{ borderRadius: cfg.radius }}>
        <div className="px-4 py-3 text-white flex items-center gap-2" style={{ background: cfg.color }}>
          <Icon size={14} />
          <span className="text-[12px] font-medium">{ar ? cfg.titleAr : cfg.titleEn}</span>
        </div>
        <div className="p-4">
          <p className={`text-[10px] ${softText}`}>{ar ? "رصيدك" : "Your balance"}</p>
          <p className={`text-[22px] font-semibold tabular-nums ${frameText}`}>{fmtMoney(1840, cfg.currency, ar)}</p>
          <div className={`mt-3 rounded-lg px-3 py-2 text-[10.5px] flex items-center gap-1.5 ${dark ? "bg-zinc-700/60 text-zinc-300" : "bg-zinc-50 text-zinc-600"}`}>
            <Sparkles size={11} style={{ color: cfg.color }} />
            {ar ? `اكسب ${cfg.cashbackPct}% كاش باك على كل طلب` : `Earn ${cfg.cashbackPct}% back on every order`}
          </div>
          <button className="mt-3 w-full h-8 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: cfg.color, borderRadius: Math.max(6, cfg.radius - 6) }}>
            {ar ? "استخدم عند الدفع" : "Apply at checkout"}
          </button>
        </div>
      </div>

      {/* Launcher */}
      <div className={`absolute ${posCls} flex items-center gap-2 px-3 h-10 text-white shadow-lg`}
        style={{ background: cfg.color, borderRadius: cfg.radius }}>
        <Icon size={15} />
        {cfg.launcherStyle === "icon_balance" && (
          <span className="text-[11.5px] font-medium tabular-nums">{fmtMoney(1840, cfg.currency, ar)}</span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════

type Tab = "overview" | "customers" | "rules" | "design" | "settings";

export default function ShopifyWalletPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [tab, setTab] = useState<Tab>("overview");
  const [cfg, setCfg] = useState<WalletConfig>(() => loadAppConfig("wallet", DEFAULT_CONFIG));
  const [enabled, setEnabled] = useState(() => loadKitState().enabled.wallet);
  const [customers, setCustomers] = useState(CUSTOMERS_SEED);
  const [search, setSearch] = useState("");
  const [adjusting, setAdjusting] = useState<WalletCustomer | null>(null);
  const [darkPreview, setDarkPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2200); }

  function update(patch: Partial<WalletConfig>) {
    setCfg(prev => {
      const next = { ...prev, ...patch };
      saveAppConfig("wallet", next);
      return next;
    });
  }

  function toggleEnabled(v: boolean) {
    setEnabled(v); setAppEnabled("wallet", v);
    showToast(v ? (ar ? "تم تفعيل المحفظة" : "Wallet enabled") : (ar ? "تم إيقاف المحفظة" : "Wallet disabled"));
  }

  const TABS: { key: Tab; en: string; ar: string }[] = [
    { key: "overview", en: "Overview", ar: "نظرة عامة" },
    { key: "customers", en: "Customers", ar: "العملاء" },
    { key: "rules", en: "Earning Rules", ar: "قواعد الكسب" },
    { key: "design", en: "Design", ar: "التصميم" },
    { key: "settings", en: "Settings", ar: "الإعدادات" },
  ];

  const totalBalance = customers.reduce((s, c) => s + c.balance, 0);
  const filtered = customers.filter(c => {
    if (search.length < 2) return true;
    const q = search.toLowerCase();
    return c.nameEn.toLowerCase().includes(q) || c.nameAr.includes(q) || c.email.toLowerCase().includes(q);
  });

  const KIND_META: Record<TxKind, { icon: React.ElementType; cls: string }> = {
    earn: { icon: TrendingUp, cls: "bg-emerald-50 text-emerald-600" },
    spend: { icon: ShoppingBag, cls: "bg-blue-50 text-blue-600" },
    refund: { icon: RefreshCw, cls: "bg-violet-50 text-violet-600" },
    gift: { icon: Gift, cls: "bg-pink-50 text-pink-600" },
    expire: { icon: Clock, cls: "bg-muted text-muted-foreground" },
  };

  const maxBar = Math.max(...ISSUED, ...SPENT);

  return (
    <div className="min-h-full py-8 px-7 md:px-10 max-w-[1020px] mx-auto">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-foreground text-background text-[13px] font-medium shadow-lg flex items-center gap-2">
          <Check size={14} />{toast}
        </div>
      )}
      {adjusting && (
        <AdjustModal customer={adjusting} cur={cfg.currency} ar={ar} onClose={() => setAdjusting(null)}
          onApply={(delta, _reason) => {
            setCustomers(prev => prev.map(c => c.id === adjusting.id
              ? { ...c, balance: Math.max(0, c.balance + delta), lifetimeEarned: delta > 0 ? c.lifetimeEarned + delta : c.lifetimeEarned }
              : c));
            setAdjusting(null);
            showToast(delta > 0 ? (ar ? "تمت إضافة الرصيد" : "Credit added") : (ar ? "تم خصم الرصيد" : "Credit deducted"));
          }} />
      )}

      {/* Header */}
      <Link href="/shopify/kit" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
        <ChevronLeft size={12} className={ar ? "rotate-180" : ""} />{ar ? "عدة شوبيفاي" : "Shopify Kit"}
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm ${enabled ? "" : "grayscale opacity-60"}`}>
            <Wallet size={21} className="text-white" />
          </div>
          <div>
            <h1 className="text-[26px] font-medium text-foreground leading-tight" style={{ fontFamily: "var(--app-font-serif)", letterSpacing: "-0.025em" }}>
              {ar ? "المحفظة" : "Wallet"}
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {ar ? "رصيد المتجر والكاش باك على واجهة متجرك" : "Store credit & cashback, live on your storefront"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`text-[11px] ${enabled ? "text-emerald-600" : "text-muted-foreground"}`}>
            {enabled ? (ar ? "مفعّل" : "Live") : (ar ? "موقوف" : "Off")}
          </span>
          <Toggle on={enabled} onChange={toggleEnabled} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-border/40 bg-card w-fit mb-6 overflow-x-auto max-w-full">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`h-8 px-3.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {ar ? t.ar : t.en}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Coins, val: fmtMoney(totalBalance, cfg.currency, ar), labelEn: "Credit outstanding", labelAr: "رصيد قائم", cls: "text-emerald-600" },
              { icon: Users, val: customers.length.toLocaleString(), labelEn: "Active wallets", labelAr: "محفظة نشطة", cls: "text-blue-600" },
              { icon: TrendingUp, val: fmtMoney(ISSUED[5], cfg.currency, ar), labelEn: "Issued this month", labelAr: "صادر هذا الشهر", cls: "text-violet-600" },
              { icon: TrendingDown, val: fmtMoney(SPENT[5], cfg.currency, ar), labelEn: "Spent this month", labelAr: "مستخدم هذا الشهر", cls: "text-amber-600" },
            ].map((k, i) => (
              <div key={i} className={`${cardCls} p-4`}>
                <k.icon size={14} className={`${k.cls} mb-2`} />
                <p className={`text-[18px] font-medium tabular-nums ${k.cls}`} style={{ fontFamily: "var(--app-font-serif)" }}>{k.val}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ar ? k.labelAr : k.labelEn}</p>
              </div>
            ))}
          </div>

          {/* Issued vs spent chart */}
          <div className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13.5px] font-medium">{ar ? "الصادر مقابل المستخدم" : "Issued vs Spent"}</h3>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-500" />{ar ? "صادر" : "Issued"}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-200" />{ar ? "مستخدم" : "Spent"}</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              {ISSUED.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center gap-1" style={{ height: 110 }}>
                    <div className="w-1/3 rounded-t bg-emerald-500" style={{ height: Math.max(4, (v / maxBar) * 110) }} />
                    <div className="w-1/3 rounded-t bg-emerald-200" style={{ height: Math.max(4, (SPENT[i] / maxBar) * 110) }} />
                  </div>
                  <span className="text-[9.5px] text-muted-foreground">{ar ? MONTHS_AR[i] : MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="px-5 py-3.5 border-b border-border/30">
              <h3 className="text-[13.5px] font-medium">{ar ? "أحدث النشاط" : "Recent activity"}</h3>
            </div>
            {ACTIVITY.map((a, i) => {
              const m = KIND_META[a.kind]; const Icon = m.icon;
              return (
                <div key={i} className={`px-5 py-3 flex items-center gap-3 ${i > 0 ? "border-t border-border/20" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.cls}`}><Icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-foreground truncate">{ar ? a.whoAr : a.whoEn}</p>
                    <p className="text-[10.5px] text-muted-foreground truncate">{ar ? a.noteAr : a.noteEn}</p>
                  </div>
                  <span className={`text-[12.5px] font-medium tabular-nums ${a.amount > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {a.amount > 0 ? "+" : ""}{fmtMoney(Math.abs(a.amount), cfg.currency, ar).replace(/^/, a.amount < 0 ? "−" : "")}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 w-6 text-end">{a.when}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Customers ── */}
      {tab === "customers" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-[260px]">
              <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={ar ? "بحث بالاسم أو الإيميل..." : "Search name or email..."}
                className={`${inputCls} w-full ps-8`} />
            </div>
            <span className="text-[11px] text-muted-foreground ms-auto">{filtered.length} {ar ? "محفظة" : "wallets"}</span>
          </div>

          <div className={`${cardCls} overflow-hidden`}>
            {filtered.map((c, i) => {
              const tp = TIER_PILL[c.tier];
              return (
                <div key={c.id} className={`px-5 py-3.5 flex items-center gap-3.5 group hover:bg-muted/30 transition-colors ${i > 0 ? "border-t border-border/20" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {(ar ? c.nameAr : c.nameEn).split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-foreground truncate">{ar ? c.nameAr : c.nameEn}</p>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${tp.cls} flex items-center gap-0.5`}>
                        {c.tier === "vip" && <Crown size={8} />}{ar ? tp.ar : tp.en}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-muted-foreground truncate">{c.email}</p>
                  </div>
                  {c.expiringSoon && (
                    <span className="hidden md:flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                      <Clock size={10} />{fmtMoney(c.expiringSoon, cfg.currency, ar)} {ar ? "تنتهي قريبًا" : "expiring soon"}
                    </span>
                  )}
                  <div className="text-end w-24">
                    <p className="text-[13.5px] font-medium tabular-nums text-emerald-600">{fmtMoney(c.balance, cfg.currency, ar)}</p>
                    <p className="text-[9.5px] text-muted-foreground">{ar ? "الرصيد" : "balance"}</p>
                  </div>
                  <div className="hidden md:block text-end w-24">
                    <p className="text-[12px] tabular-nums text-muted-foreground">{fmtMoney(c.lifetimeEarned, cfg.currency, ar)}</p>
                    <p className="text-[9.5px] text-muted-foreground/60">{ar ? "مكتسب إجمالًا" : "lifetime earned"}</p>
                  </div>
                  <button onClick={() => setAdjusting(c)}
                    className="h-8 px-3 rounded-lg border border-border/60 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                    {ar ? "تعديل" : "Adjust"}
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <Users size={20} className="mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-[12.5px] text-muted-foreground">{ar ? "لا توجد نتائج" : "No wallets match"}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Earning rules ── */}
      {tab === "rules" && (
        <div className="space-y-3.5">
          <RuleRow icon={Coins} ar={ar}
            titleEn="Cashback on orders" titleAr="كاش باك على الطلبات"
            descEn="A percentage of every paid order comes back as wallet credit — the quiet engine of repeat purchases."
            descAr="نسبة من كل طلب مدفوع ترجع كرصيد في المحفظة — المحرك الهادئ لتكرار الشراء."
            on={cfg.cashbackOn} onToggle={v => update({ cashbackOn: v })}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                {ar ? "النسبة الأساسية" : "Base rate"}
                <input type="number" min="0" max="50" step="0.5" value={cfg.cashbackPct}
                  onChange={e => update({ cashbackPct: parseFloat(e.target.value) || 0 })} className={numCls} />%
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] text-muted-foreground">{ar ? "مضاعفات المستويات" : "Tier multipliers"}</span>
                {(Object.keys(cfg.tierMultipliers) as (keyof WalletConfig["tierMultipliers"])[]).map(t => (
                  <label key={t} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${TIER_PILL[t].cls} text-[10.5px] font-medium`}>
                    {ar ? TIER_PILL[t].ar : TIER_PILL[t].en}
                    <input type="number" min="1" max="5" step="0.25" value={cfg.tierMultipliers[t]}
                      onChange={e => update({ tierMultipliers: { ...cfg.tierMultipliers, [t]: parseFloat(e.target.value) || 1 } })}
                      className="w-12 h-6 px-1 rounded-md border border-border/60 bg-white/70 text-[10.5px] tabular-nums text-center focus:outline-none" />×
                  </label>
                ))}
              </div>
            </div>
          </RuleRow>

          <RuleRow icon={RefreshCw} ar={ar}
            titleEn="Refunds to wallet" titleAr="الاسترداد للمحفظة"
            descEn="Offer instant wallet credit instead of a slow card refund — sweetened with a bonus so customers prefer it."
            descAr="اعرض رصيد فوري بدل استرداد بطيء للبطاقة — مع مكافأة صغيرة تخلي العميل يفضله."
            on={cfg.refundToWalletOn} onToggle={v => update({ refundToWalletOn: v })}>
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              {ar ? "مكافأة اختيار الرصيد" : "Bonus for choosing credit"}
              <input type="number" min="0" max="25" value={cfg.refundBonusPct}
                onChange={e => update({ refundBonusPct: parseFloat(e.target.value) || 0 })} className={numCls} />%
            </label>
          </RuleRow>

          <RuleRow icon={UserPlus} ar={ar}
            titleEn="Welcome credit" titleAr="رصيد ترحيبي"
            descEn="Greet every new account with starter credit that nudges the first order."
            descAr="رحّب بكل حساب جديد برصيد يشجع على أول طلب."
            on={cfg.welcomeOn} onToggle={v => update({ welcomeOn: v })}>
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              {ar ? "المبلغ" : "Amount"}
              <input type="number" min="0" value={cfg.welcomeAmount}
                onChange={e => update({ welcomeAmount: parseFloat(e.target.value) || 0 })} className={numCls} />{cfg.currency}
            </label>
          </RuleRow>

          <RuleRow icon={Cake} ar={ar}
            titleEn="Birthday credit" titleAr="رصيد عيد الميلاد"
            descEn="An automatic gift on their birthday — small cost, outsized delight."
            descAr="هدية تلقائية في عيد ميلادهم — تكلفة صغيرة وفرحة كبيرة."
            on={cfg.birthdayOn} onToggle={v => update({ birthdayOn: v })}>
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              {ar ? "المبلغ" : "Amount"}
              <input type="number" min="0" value={cfg.birthdayAmount}
                onChange={e => update({ birthdayAmount: parseFloat(e.target.value) || 0 })} className={numCls} />{cfg.currency}
            </label>
          </RuleRow>

          <RuleRow icon={Gift} ar={ar}
            titleEn="Referral credit" titleAr="رصيد الإحالة"
            descEn="Both sides win: the advocate earns credit when their friend's first order is delivered."
            descAr="الطرفان يكسبان: صاحب الدعوة يكسب رصيد عند تسليم أول طلب لصديقه."
            on={cfg.referralOn} onToggle={v => update({ referralOn: v })}>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                {ar ? "للداعي" : "Advocate gets"}
                <input type="number" min="0" value={cfg.referralAdvocate}
                  onChange={e => update({ referralAdvocate: parseFloat(e.target.value) || 0 })} className={numCls} />{cfg.currency}
              </label>
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                {ar ? "للصديق" : "Friend gets"}
                <input type="number" min="0" value={cfg.referralFriend}
                  onChange={e => update({ referralFriend: parseFloat(e.target.value) || 0 })} className={numCls} />{cfg.currency}
              </label>
            </div>
          </RuleRow>

          <RuleRow icon={Clock} ar={ar}
            titleEn="Credit expiry" titleAr="انتهاء صلاحية الرصيد"
            descEn="Unused credit expires after a window — with a friendly reminder before it does, which itself drives orders."
            descAr="الرصيد غير المستخدم ينتهي بعد فترة — مع تذكير ودود قبلها، وهو نفسه يحرّك الطلبات."
            on={cfg.expiryOn} onToggle={v => update({ expiryOn: v })}>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                {ar ? "ينتهي بعد" : "Expires after"}
                <input type="number" min="1" max="60" value={cfg.expiryMonths}
                  onChange={e => update({ expiryMonths: parseInt(e.target.value) || 12 })} className={numCls} />{ar ? "شهر" : "months"}
              </label>
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                {ar ? "تذكير قبلها بـ" : "Remind"}
                <input type="number" min="1" max="90" value={cfg.expiryReminderDays}
                  onChange={e => update({ expiryReminderDays: parseInt(e.target.value) || 14 })} className={numCls} />{ar ? "يوم" : "days before"}
              </label>
            </div>
          </RuleRow>
        </div>
      )}

      {/* ── Design ── */}
      {tab === "design" && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 items-start">
          {/* Controls */}
          <div className="space-y-4">
            <div className={`${cardCls} p-5 space-y-4`}>
              <h3 className="text-[13.5px] font-medium">{ar ? "المُشغّل" : "Launcher"}</h3>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "الموضع" : "Position"}</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["bottom-right", "bottom-left", "top-right", "top-left"] as CornerPos[]).map(p => (
                    <button key={p} onClick={() => update({ position: p })}
                      className={`h-12 rounded-lg border relative transition-colors ${cfg.position === p ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted"}`}>
                      <span className={`absolute w-2 h-2 rounded-full bg-primary ${
                        p === "bottom-right" ? "bottom-1.5 right-1.5" : p === "bottom-left" ? "bottom-1.5 left-1.5" :
                        p === "top-right" ? "top-1.5 right-1.5" : "top-1.5 left-1.5"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "الأسلوب" : "Style"}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => update({ launcherStyle: "icon" })}
                    className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.launcherStyle === "icon" ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                    {ar ? "أيقونة فقط" : "Icon only"}
                  </button>
                  <button onClick={() => update({ launcherStyle: "icon_balance" })}
                    className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.launcherStyle === "icon_balance" ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                    {ar ? "أيقونة + الرصيد" : "Icon + balance"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "الأيقونة" : "Icon"}</p>
                <div className="flex gap-2">
                  {([["wallet", Wallet], ["gift", Gift], ["sparkles", Sparkles]] as [LauncherIcon, React.ElementType][]).map(([k, I]) => (
                    <button key={k} onClick={() => update({ launcherIcon: k })}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${cfg.launcherIcon === k ? "border-primary bg-primary/5 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                      <I size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${cardCls} p-5 space-y-4`}>
              <h3 className="text-[13.5px] font-medium">{ar ? "الشكل" : "Appearance"}</h3>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "اللون الأساسي" : "Brand color"}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {SWATCHES.map(c => (
                    <button key={c} onClick={() => update({ color: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${cfg.color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                      style={{ background: c }} aria-label={c} />
                  ))}
                  <input type="color" value={cfg.color} onChange={e => update({ color: e.target.value })}
                    className="w-8 h-8 rounded-full border border-border/60 cursor-pointer bg-transparent p-0.5" aria-label="Custom color" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2 flex justify-between">
                  <span>{ar ? "استدارة الحواف" : "Corner radius"}</span><span className="tabular-nums">{cfg.radius}px</span>
                </p>
                <input type="range" min="4" max="28" value={cfg.radius}
                  onChange={e => update({ radius: parseInt(e.target.value) })} className="w-full accent-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">{ar ? "العنوان (EN)" : "Title (EN)"}</label>
                  <input value={cfg.titleEn} onChange={e => update({ titleEn: e.target.value })} className={`${inputCls} w-full`} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">{ar ? "العنوان (AR)" : "Title (AR)"}</label>
                  <input value={cfg.titleAr} onChange={e => update({ titleAr: e.target.value })} className={`${inputCls} w-full`} dir="rtl" />
                </div>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] text-muted-foreground/60 tracking-[0.08em] uppercase">{ar ? "معاينة حية" : "Live preview"}</p>
              <button onClick={() => setDarkPreview(d => !d)}
                className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {darkPreview ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>
            <WidgetPreview cfg={cfg} dark={darkPreview} ar={ar} />
            <p className="text-[10.5px] text-muted-foreground/60 mt-2.5 text-center">
              {ar ? "كل تغيير يظهر فورًا — هكذا سيراه عملاؤك بالضبط" : "Every change renders instantly — exactly what your customers will see"}
            </p>
          </div>
        </div>
      )}

      {/* ── Settings ── */}
      {tab === "settings" && (
        <div className="space-y-4 max-w-[620px]">
          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className="text-[13.5px] font-medium">{ar ? "عام" : "General"}</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12.5px] text-foreground">{ar ? "العملة" : "Currency"}</p>
                <p className="text-[10.5px] text-muted-foreground">{ar ? "تظهر في الودجت وكل الرسائل" : "Shown in the widget and all messages"}</p>
              </div>
              <select value={cfg.currency} onChange={e => update({ currency: e.target.value as WalletConfig["currency"] })}
                className={`${inputCls} cursor-pointer`}>
                {["EGP", "SAR", "AED", "USD"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12.5px] text-foreground">{ar ? "الحد الأقصى للرصيد" : "Max wallet balance"}</p>
                <p className="text-[10.5px] text-muted-foreground">{ar ? "حماية من التراكم غير الطبيعي" : "Guard against abnormal accumulation"}</p>
              </div>
              <input type="number" min="0" value={cfg.maxBalance}
                onChange={e => update({ maxBalance: parseInt(e.target.value) || 0 })} className={`${numCls} w-28`} />
            </div>
          </div>

          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className="text-[13.5px] font-medium flex items-center gap-1.5"><CreditCard size={13} />{ar ? "الدفع" : "Checkout"}</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12.5px] text-foreground">{ar ? "الدفع الجزئي" : "Partial payments"}</p>
                <p className="text-[10.5px] text-muted-foreground">{ar ? "استخدام الرصيد + بطاقة في نفس الطلب" : "Combine wallet credit + card on one order"}</p>
              </div>
              <Toggle on={cfg.partialPay} onChange={v => update({ partialPay: v })} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12.5px] text-foreground">{ar ? "المحفظة في صفحة الحساب" : "Wallet in account page"}</p>
                <p className="text-[10.5px] text-muted-foreground">{ar ? "تبويب محفظة داخل حساب العميل في المتجر" : "A wallet tab inside the customer's store account"}</p>
              </div>
              <Toggle on={cfg.showInAccount} onChange={v => update({ showInAccount: v })} />
            </div>
          </div>

          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className="text-[13.5px] font-medium flex items-center gap-1.5"><Bell size={13} />{ar ? "الإشعارات" : "Notifications"}</h3>
            {[
              { key: "notifyEmail" as const, icon: Mail, en: "Email", ar: "البريد الإلكتروني", descEn: "Earned, spent and expiry reminders", descAr: "الكسب والاستخدام وتذكير الانتهاء" },
              { key: "notifySms" as const, icon: MessageSquare, en: "SMS", ar: "رسائل SMS", descEn: "Short balance updates", descAr: "تحديثات رصيد قصيرة" },
              { key: "notifyPush" as const, icon: Smartphone, en: "Push", ar: "إشعارات الجوال", descEn: "Via your mobile app", descAr: "عبر تطبيق الجوال" },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <n.icon size={14} className="text-muted-foreground" />
                  <div>
                    <p className="text-[12.5px] text-foreground">{ar ? n.ar : n.en}</p>
                    <p className="text-[10.5px] text-muted-foreground">{ar ? n.descAr : n.descEn}</p>
                  </div>
                </div>
                <Toggle on={cfg[n.key]} onChange={v => update({ [n.key]: v } as Partial<WalletConfig>)} />
              </div>
            ))}
          </div>

          <button onClick={() => { update(DEFAULT_CONFIG); showToast(ar ? "تمت إعادة الضبط" : "Reset to defaults"); }}
            className="text-[11.5px] text-muted-foreground hover:text-rose-600 transition-colors">
            {ar ? "إعادة كل الإعدادات للوضع الافتراضي" : "Reset all settings to defaults"}
          </button>
        </div>
      )}
    </div>
  );
}
