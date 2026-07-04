/**
 * Shopify Kit · Wishlist — save, share & win-back console
 * عدة شوبيفاي · قائمة الأمنيات — احفظ وشارك واسترجع
 *
 * Tabs: Overview (KPIs + top wishlisted) · Wishlists (customer lists) ·
 * Alerts (price drop / back in stock / low stock) · Design (live product
 * card preview) · Settings. Demo mode persists via lib/shopify-kit.
 */

import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "../context/LanguageContext";
import { loadKitState, setAppEnabled, loadAppConfig, saveAppConfig } from "../lib/shopify-kit";
import {
  Heart, Check, Search, ChevronLeft, ChevronDown, Users,
  TrendingDown, PackageCheck, Boxes, Bell, Mail, Smartphone,
  MessageSquare, Share2, ShoppingCart, Sparkles, Sun, Moon,
  Link2, Eye, BarChart3,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────

type ButtonStyle = "icon" | "icon_label";
type ButtonPos = "image-corner" | "under-title";
type HeartAnim = "pop" | "pulse" | "none";
type PageLayout = "grid" | "list";

interface WishlistConfig {
  // alerts
  priceDropOn: boolean; priceDropMinPct: number;
  backInStockOn: boolean;
  lowStockOn: boolean; lowStockUnits: number;
  channelEmail: boolean; channelPush: boolean; channelWhatsapp: boolean;
  maxAlertsPerWeek: number;
  // design
  btnStyle: ButtonStyle; btnPos: ButtonPos; anim: HeartAnim;
  color: string; layout: PageLayout;
  labelEn: string; labelAr: string;
  showCount: boolean;
  // settings
  guestWishlist: boolean; mergeOnLogin: boolean;
  multiList: boolean; shareLinks: boolean;
}

const DEFAULT_CONFIG: WishlistConfig = {
  priceDropOn: true, priceDropMinPct: 5,
  backInStockOn: true,
  lowStockOn: true, lowStockUnits: 5,
  channelEmail: true, channelPush: true, channelWhatsapp: false,
  maxAlertsPerWeek: 3,
  btnStyle: "icon", btnPos: "image-corner", anim: "pop",
  color: "#e11d48", layout: "grid",
  labelEn: "Add to wishlist", labelAr: "أضف للأمنيات",
  showCount: true,
  guestWishlist: true, mergeOnLogin: true,
  multiList: true, shareLinks: true,
};

const SWATCHES = ["#e11d48", "#db2777", "#7c3aed", "#0ea5e9", "#059669", "#111827"];

// ─── Demo data ───────────────────────────────────────────

interface TopProduct {
  id: string; nameEn: string; nameAr: string; emoji: string;
  price: number; saves: number; addedToCart: number; stock: number;
}

const TOP_PRODUCTS: TopProduct[] = [
  { id: "tp-01", nameEn: "Linen Summer Dress", nameAr: "فستان كتان صيفي", emoji: "👗", price: 1450, saves: 284, addedToCart: 61, stock: 14 },
  { id: "tp-02", nameEn: "Oversized Blazer", nameAr: "بليزر واسع", emoji: "🧥", price: 2200, saves: 231, addedToCart: 44, stock: 3 },
  { id: "tp-03", nameEn: "Silk Scarf — Nile", nameAr: "وشاح حرير — النيل", emoji: "🧣", price: 680, saves: 198, addedToCart: 52, stock: 0 },
  { id: "tp-04", nameEn: "Wide-Leg Trousers", nameAr: "بنطلون واسع", emoji: "👖", price: 1150, saves: 172, addedToCart: 38, stock: 27 },
  { id: "tp-05", nameEn: "Embroidered Kaftan", nameAr: "قفطان مطرز", emoji: "✨", price: 3400, saves: 149, addedToCart: 19, stock: 8 },
];

interface CustomerWishlist {
  id: string; nameEn: string; nameAr: string; email: string;
  items: { emoji: string; nameEn: string; nameAr: string }[];
  updated: string; shared: boolean;
}

const WISHLISTS: CustomerWishlist[] = [
  { id: "wl-01", nameEn: "Nour El-Sayed", nameAr: "نور السيد", email: "nour.s@gmail.com", updated: "2026-07-03", shared: true,
    items: [{ emoji: "👗", nameEn: "Linen Summer Dress", nameAr: "فستان كتان صيفي" }, { emoji: "🧣", nameEn: "Silk Scarf", nameAr: "وشاح حرير" }, { emoji: "✨", nameEn: "Embroidered Kaftan", nameAr: "قفطان مطرز" }] },
  { id: "wl-02", nameEn: "Omar Khaled", nameAr: "عمر خالد", email: "omar.kh@outlook.com", updated: "2026-07-02", shared: false,
    items: [{ emoji: "🧥", nameEn: "Oversized Blazer", nameAr: "بليزر واسع" }, { emoji: "👖", nameEn: "Wide-Leg Trousers", nameAr: "بنطلون واسع" }] },
  { id: "wl-03", nameEn: "Farida Mansour", nameAr: "فريدة منصور", email: "farida.m@gmail.com", updated: "2026-07-01", shared: true,
    items: [{ emoji: "👗", nameEn: "Linen Summer Dress", nameAr: "فستان كتان صيفي" }, { emoji: "🧥", nameEn: "Oversized Blazer", nameAr: "بليزر واسع" }, { emoji: "👖", nameEn: "Wide-Leg Trousers", nameAr: "بنطلون واسع" }, { emoji: "🧣", nameEn: "Silk Scarf", nameAr: "وشاح حرير" }] },
  { id: "wl-04", nameEn: "Youssef Adel", nameAr: "يوسف عادل", email: "y.adel@yahoo.com", updated: "2026-06-29", shared: false,
    items: [{ emoji: "✨", nameEn: "Embroidered Kaftan", nameAr: "قفطان مطرز" }] },
  { id: "wl-05", nameEn: "Salma Ibrahim", nameAr: "سلمى إبراهيم", email: "salma.ib@gmail.com", updated: "2026-06-27", shared: false,
    items: [{ emoji: "🧣", nameEn: "Silk Scarf", nameAr: "وشاح حرير" }, { emoji: "👗", nameEn: "Linen Summer Dress", nameAr: "فستان كتان صيفي" }] },
];

// ─── Small UI helpers ────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className={`relative w-9 h-5 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-rose-500" : "bg-muted-foreground/25"}`}>
      <span className={`absolute top-0.5 start-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-4 rtl:-translate-x-4" : ""}`} />
    </button>
  );
}

const cardCls = "border border-border/40 rounded-xl bg-background";
const inputCls = "h-9 px-3 rounded-xl border border-border/80 bg-card text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors";
const numCls = `${inputCls} w-24 tabular-nums`;

function AlertRow({ icon: Icon, titleEn, titleAr, descEn, descAr, on, onToggle, ar, children }: {
  icon: React.ElementType; titleEn: string; titleAr: string; descEn: string; descAr: string;
  on: boolean; onToggle: (v: boolean) => void; ar: boolean; children?: React.ReactNode;
}) {
  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-start gap-3.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${on ? "bg-rose-50 text-rose-600" : "bg-muted text-muted-foreground"}`}>
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

// ─── Live preview: storefront product card ───────────────

function ProductCardPreview({ cfg, dark, ar }: { cfg: WishlistConfig; dark: boolean; ar: boolean }) {
  const [saved, setSaved] = useState(true);

  const frameBg = dark ? "bg-zinc-900" : "bg-white";
  const cardBg = dark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200";
  const frameText = dark ? "text-zinc-100" : "text-zinc-800";
  const softText = dark ? "text-zinc-400" : "text-zinc-500";
  const lineBg = dark ? "bg-zinc-700" : "bg-zinc-200";

  const animCls = cfg.anim === "pop" ? "active:scale-75 transition-transform duration-150"
    : cfg.anim === "pulse" ? (saved ? "animate-pulse" : "") : "";

  const heartBtn = (
    <button onClick={() => setSaved(s => !s)}
      className={`flex items-center gap-1.5 ${cfg.btnStyle === "icon" ? "w-8 h-8 justify-center" : "h-8 px-3"} rounded-full shadow-sm border ${dark ? "bg-zinc-900/90 border-zinc-700" : "bg-white/95 border-zinc-200"} ${animCls}`}
      style={{ color: saved ? cfg.color : undefined }}>
      <Heart size={14} fill={saved ? cfg.color : "none"} className={saved ? "" : softText} style={saved ? { color: cfg.color } : {}} />
      {cfg.btnStyle === "icon_label" && (
        <span className={`text-[10.5px] font-medium ${saved ? "" : softText}`} style={saved ? { color: cfg.color } : {}}>
          {saved ? (ar ? "محفوظ" : "Saved") : (ar ? cfg.labelAr : cfg.labelEn)}
        </span>
      )}
    </button>
  );

  return (
    <div className={`relative w-full rounded-2xl border border-border/50 overflow-hidden ${frameBg} transition-colors p-6`}>
      <div className="max-w-[250px] mx-auto">
        <div className={`rounded-2xl border overflow-hidden ${cardBg} shadow-sm`}>
          {/* image area */}
          <div className={`relative h-44 ${dark ? "bg-zinc-700/50" : "bg-gradient-to-br from-rose-50 to-orange-50"} flex items-center justify-center`}>
            <span className="text-[52px]">👗</span>
            {cfg.btnPos === "image-corner" && (
              <div className="absolute top-2.5 end-2.5">{heartBtn}</div>
            )}
            {cfg.showCount && (
              <span className={`absolute bottom-2.5 start-2.5 text-[9.5px] px-2 py-1 rounded-full ${dark ? "bg-zinc-900/80 text-zinc-300" : "bg-white/90 text-zinc-600"} shadow-sm flex items-center gap-1`}>
                <Heart size={9} style={{ color: cfg.color }} fill={cfg.color} />
                {ar ? "284 شخص يريده" : "284 people want this"}
              </span>
            )}
          </div>
          {/* body */}
          <div className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[12.5px] font-medium truncate ${frameText}`}>{ar ? "فستان كتان صيفي" : "Linen Summer Dress"}</p>
                <p className={`text-[11px] mt-0.5 ${softText}`}>{ar ? "1,450 ج.م" : "EGP 1,450"}</p>
              </div>
              {cfg.btnPos === "under-title" && heartBtn}
            </div>
            <button className="mt-3 w-full h-8 rounded-lg text-[10.5px] font-medium text-white flex items-center justify-center gap-1.5"
              style={{ background: dark ? "#fafafa" : "#18181b", color: dark ? "#18181b" : "#fafafa" }}>
              <ShoppingCart size={11} />{ar ? "أضف للسلة" : "Add to cart"}
            </button>
          </div>
        </div>
        {/* skeleton neighbors hint */}
        <div className="grid grid-cols-2 gap-3 mt-4 opacity-40">
          {[0, 1].map(i => (
            <div key={i} className="space-y-1.5">
              <div className={`h-16 rounded-xl ${lineBg}`} />
              <div className={`h-2 w-3/4 rounded ${lineBg}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════

type Tab = "overview" | "wishlists" | "alerts" | "design" | "settings";

export default function ShopifyWishlistPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [tab, setTab] = useState<Tab>("overview");
  const [cfg, setCfg] = useState<WishlistConfig>(() => loadAppConfig("wishlist", DEFAULT_CONFIG));
  const [enabled, setEnabled] = useState(() => loadKitState().enabled.wishlist);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [darkPreview, setDarkPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2200); }

  function update(patch: Partial<WishlistConfig>) {
    setCfg(prev => {
      const next = { ...prev, ...patch };
      saveAppConfig("wishlist", next);
      return next;
    });
  }

  function toggleEnabled(v: boolean) {
    setEnabled(v); setAppEnabled("wishlist", v);
    showToast(v ? (ar ? "تم تفعيل قائمة الأمنيات" : "Wishlist enabled") : (ar ? "تم إيقاف قائمة الأمنيات" : "Wishlist disabled"));
  }

  const TABS: { key: Tab; en: string; ar: string }[] = [
    { key: "overview", en: "Overview", ar: "نظرة عامة" },
    { key: "wishlists", en: "Wishlists", ar: "القوائم" },
    { key: "alerts", en: "Alerts", ar: "التنبيهات" },
    { key: "design", en: "Design", ar: "التصميم" },
    { key: "settings", en: "Settings", ar: "الإعدادات" },
  ];

  const totalSaves = TOP_PRODUCTS.reduce((s, p) => s + p.saves, 0);
  const maxSaves = Math.max(...TOP_PRODUCTS.map(p => p.saves));

  const filteredLists = WISHLISTS.filter(w => {
    if (search.length < 2) return true;
    const q = search.toLowerCase();
    return w.nameEn.toLowerCase().includes(q) || w.nameAr.includes(q) || w.email.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-full py-8 px-7 md:px-10 max-w-[1020px] mx-auto">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-foreground text-background text-[13px] font-medium shadow-lg flex items-center gap-2">
          <Check size={14} />{toast}
        </div>
      )}

      {/* Header */}
      <Link href="/shopify/kit" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
        <ChevronLeft size={12} className={ar ? "rotate-180" : ""} />{ar ? "عدة شوبيفاي" : "Shopify Kit"}
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm ${enabled ? "" : "grayscale opacity-60"}`}>
            <Heart size={21} className="text-white" />
          </div>
          <div>
            <h1 className="text-[26px] font-medium text-foreground leading-tight" style={{ fontFamily: "var(--app-font-serif)", letterSpacing: "-0.025em" }}>
              {ar ? "قائمة الأمنيات" : "Wishlist"}
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {ar ? "احفظ وشارك وتنبيهات تحوّل المتصفح إلى مشترٍ" : "Save, share, and alerts that turn browsers into buyers"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`text-[11px] ${enabled ? "text-rose-600" : "text-muted-foreground"}`}>
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
              { icon: Heart, val: totalSaves.toLocaleString(), labelEn: "Items wishlisted", labelAr: "منتج محفوظ", cls: "text-rose-600" },
              { icon: Users, val: "1,027", labelEn: "Wishlisters", labelAr: "عميل لديه قائمة", cls: "text-blue-600" },
              { icon: ShoppingCart, val: "18.4%", labelEn: "Wishlist → cart", labelAr: "من القائمة للسلة", cls: "text-emerald-600" },
              { icon: Bell, val: "642", labelEn: "Alerts sent / mo", labelAr: "تنبيه شهريًا", cls: "text-violet-600" },
            ].map((k, i) => (
              <div key={i} className={`${cardCls} p-4`}>
                <k.icon size={14} className={`${k.cls} mb-2`} />
                <p className={`text-[18px] font-medium tabular-nums ${k.cls}`} style={{ fontFamily: "var(--app-font-serif)" }}>{k.val}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ar ? k.labelAr : k.labelEn}</p>
              </div>
            ))}
          </div>

          {/* Top wishlisted products */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="px-5 py-3.5 border-b border-border/30 flex items-center justify-between">
              <h3 className="text-[13.5px] font-medium flex items-center gap-1.5"><BarChart3 size={13} />{ar ? "الأكثر حفظًا" : "Most wishlisted"}</h3>
              <span className="text-[10px] text-muted-foreground">{ar ? "آخر 30 يوم" : "Last 30 days"}</span>
            </div>
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.id} className={`px-5 py-3.5 flex items-center gap-3.5 ${i > 0 ? "border-t border-border/20" : ""}`}>
                <span className="text-[22px] w-8 text-center">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-foreground truncate">{ar ? p.nameAr : p.nameEn}</p>
                    {p.stock === 0 && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600">{ar ? "نفد" : "Out of stock"}</span>}
                    {p.stock > 0 && p.stock <= 5 && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{ar ? `باقي ${p.stock}` : `${p.stock} left`}</span>}
                  </div>
                  <div className="h-1.5 rounded-full bg-muted mt-1.5 max-w-[220px]">
                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${(p.saves / maxSaves) * 100}%` }} />
                  </div>
                </div>
                <div className="text-end w-16">
                  <p className="text-[13.5px] font-medium tabular-nums text-rose-600">{p.saves}</p>
                  <p className="text-[9.5px] text-muted-foreground">{ar ? "حفظ" : "saves"}</p>
                </div>
                <div className="hidden md:block text-end w-20">
                  <p className="text-[12px] tabular-nums text-muted-foreground">{p.addedToCart}</p>
                  <p className="text-[9.5px] text-muted-foreground/60">{ar ? "أضيف للسلة" : "to cart"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Insight strip */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-rose-100 bg-rose-50/40">
            <Sparkles size={14} className="text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-foreground/80 leading-relaxed">
              {ar
                ? "«وشاح حرير — النيل» نفد من المخزون وعليه 198 حفظ. أعد التخزين وسيرسل التطبيق تنبيهات «عاد للتوفر» تلقائيًا — طلبات شبه مضمونة."
                : "\"Silk Scarf — Nile\" is out of stock with 198 saves. Restock it and the app auto-sends back-in-stock alerts — near-guaranteed orders."}
            </p>
          </div>
        </div>
      )}

      {/* ── Wishlists ── */}
      {tab === "wishlists" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-[260px]">
              <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={ar ? "بحث بالاسم أو الإيميل..." : "Search name or email..."}
                className={`${inputCls} w-full ps-8`} />
            </div>
            <span className="text-[11px] text-muted-foreground ms-auto">{filteredLists.length} {ar ? "قائمة" : "wishlists"}</span>
          </div>

          <div className={`${cardCls} overflow-hidden`}>
            {filteredLists.map((w, i) => {
              const open = expanded === w.id;
              return (
                <div key={w.id} className={i > 0 ? "border-t border-border/20" : ""}>
                  <button onClick={() => setExpanded(open ? null : w.id)}
                    className="w-full px-5 py-3.5 flex items-center gap-3.5 hover:bg-muted/30 transition-colors text-start">
                    <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
                      {(ar ? w.nameAr : w.nameEn).split(" ").map(s => s[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-foreground truncate">{ar ? w.nameAr : w.nameEn}</p>
                        {w.shared && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-0.5">
                            <Share2 size={8} />{ar ? "مشاركة" : "Shared"}
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-muted-foreground truncate">{w.email}</p>
                    </div>
                    <div className="flex -space-x-1.5 rtl:space-x-reverse">
                      {w.items.slice(0, 4).map((it, j) => (
                        <span key={j} className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[12px]">{it.emoji}</span>
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums w-14 text-end">{w.items.length} {ar ? "منتج" : "items"}</span>
                    <ChevronDown size={14} className={`text-muted-foreground/50 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 ps-[68px]">
                      <div className="flex flex-wrap gap-2">
                        {w.items.map((it, j) => (
                          <span key={j} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-muted/60 text-foreground/80">
                            <span>{it.emoji}</span>{ar ? it.nameAr : it.nameEn}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mt-2.5 flex items-center gap-1">
                        <Eye size={10} />{ar ? `آخر تحديث ${w.updated}` : `Last updated ${w.updated}`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredLists.length === 0 && (
              <div className="py-12 text-center">
                <Heart size={20} className="mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-[12.5px] text-muted-foreground">{ar ? "لا توجد نتائج" : "No wishlists match"}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Alerts ── */}
      {tab === "alerts" && (
        <div className="space-y-3.5">
          <AlertRow icon={TrendingDown} ar={ar}
            titleEn="Price-drop alerts" titleAr="تنبيهات انخفاض السعر"
            descEn="When a saved item's price drops, the customer hears about it first — the single highest-converting message in e-commerce."
            descAr="لما سعر منتج محفوظ ينخفض، العميل يعرف أولًا — أعلى رسالة تحويلًا في التجارة الإلكترونية."
            on={cfg.priceDropOn} onToggle={v => update({ priceDropOn: v })}>
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              {ar ? "أرسل فقط إذا انخفض السعر" : "Only send when price drops"}
              <input type="number" min="1" max="90" value={cfg.priceDropMinPct}
                onChange={e => update({ priceDropMinPct: parseInt(e.target.value) || 1 })} className={numCls} />% {ar ? "أو أكثر" : "or more"}
            </label>
          </AlertRow>

          <AlertRow icon={PackageCheck} ar={ar}
            titleEn="Back-in-stock alerts" titleAr="تنبيهات عودة التوفر"
            descEn="Sold-out items with saves become a restock waitlist. The moment inventory lands, everyone who wanted it knows."
            descAr="المنتجات النافدة المحفوظة تتحول لقائمة انتظار. لحظة وصول المخزون، كل من أرادها يعرف."
            on={cfg.backInStockOn} onToggle={v => update({ backInStockOn: v })} />

          <AlertRow icon={Boxes} ar={ar}
            titleEn="Low-stock urgency" titleAr="تنبيه قرب النفاد"
            descEn="A gentle 'almost gone' nudge when a saved item is running out — honest urgency, not fake timers."
            descAr="تنبيه لطيف «قارب على النفاد» عندما يوشك منتج محفوظ على الانتهاء — استعجال صادق بلا عدادات مزيفة."
            on={cfg.lowStockOn} onToggle={v => update({ lowStockOn: v })}>
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              {ar ? "أرسل عندما يتبقى" : "Send when stock falls below"}
              <input type="number" min="1" max="50" value={cfg.lowStockUnits}
                onChange={e => update({ lowStockUnits: parseInt(e.target.value) || 1 })} className={numCls} />{ar ? "قطعة" : "units"}
            </label>
          </AlertRow>

          {/* Channels & throttle */}
          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className="text-[13.5px] font-medium flex items-center gap-1.5"><Bell size={13} />{ar ? "القنوات والحدود" : "Channels & limits"}</h3>
            {[
              { key: "channelEmail" as const, icon: Mail, en: "Email", ar: "البريد الإلكتروني" },
              { key: "channelPush" as const, icon: Smartphone, en: "Push notification", ar: "إشعار الجوال" },
              { key: "channelWhatsapp" as const, icon: MessageSquare, en: "WhatsApp", ar: "واتساب" },
            ].map(c => (
              <div key={c.key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <c.icon size={14} className="text-muted-foreground" />
                  <p className="text-[12.5px] text-foreground">{ar ? c.ar : c.en}</p>
                </div>
                <Toggle on={cfg[c.key]} onChange={v => update({ [c.key]: v } as Partial<WishlistConfig>)} />
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/30">
              <div>
                <p className="text-[12.5px] text-foreground">{ar ? "حد التنبيهات" : "Alert throttle"}</p>
                <p className="text-[10.5px] text-muted-foreground">{ar ? "أقصى عدد تنبيهات لكل عميل أسبوعيًا — الاحترام يبيع" : "Max alerts per customer per week — respect converts"}</p>
              </div>
              <input type="number" min="1" max="14" value={cfg.maxAlertsPerWeek}
                onChange={e => update({ maxAlertsPerWeek: parseInt(e.target.value) || 1 })} className={numCls} />
            </div>
          </div>
        </div>
      )}

      {/* ── Design ── */}
      {tab === "design" && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 items-start">
          <div className="space-y-4">
            <div className={`${cardCls} p-5 space-y-4`}>
              <h3 className="text-[13.5px] font-medium">{ar ? "زر القلب" : "Wishlist button"}</h3>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "الأسلوب" : "Style"}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => update({ btnStyle: "icon" })}
                    className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.btnStyle === "icon" ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                    {ar ? "قلب فقط" : "Heart only"}
                  </button>
                  <button onClick={() => update({ btnStyle: "icon_label" })}
                    className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.btnStyle === "icon_label" ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                    {ar ? "قلب + نص" : "Heart + label"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "الموضع" : "Placement"}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => update({ btnPos: "image-corner" })}
                    className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.btnPos === "image-corner" ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                    {ar ? "ركن الصورة" : "Image corner"}
                  </button>
                  <button onClick={() => update({ btnPos: "under-title" })}
                    className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.btnPos === "under-title" ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                    {ar ? "بجانب الاسم" : "Beside title"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "حركة الحفظ" : "Save animation"}</p>
                <div className="grid grid-cols-3 gap-2">
                  {([["pop", ar ? "نبضة" : "Pop"], ["pulse", ar ? "وميض" : "Pulse"], ["none", ar ? "بدون" : "None"]] as [HeartAnim, string][]).map(([k, l]) => (
                    <button key={k} onClick={() => update({ anim: k })}
                      className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.anim === k ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {cfg.btnStyle === "icon_label" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">{ar ? "النص (EN)" : "Label (EN)"}</label>
                    <input value={cfg.labelEn} onChange={e => update({ labelEn: e.target.value })} className={`${inputCls} w-full`} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">{ar ? "النص (AR)" : "Label (AR)"}</label>
                    <input value={cfg.labelAr} onChange={e => update({ labelAr: e.target.value })} className={`${inputCls} w-full`} dir="rtl" />
                  </div>
                </div>
              )}
            </div>

            <div className={`${cardCls} p-5 space-y-4`}>
              <h3 className="text-[13.5px] font-medium">{ar ? "الشكل" : "Appearance"}</h3>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "لون القلب" : "Heart color"}</p>
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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12.5px] text-foreground">{ar ? "عداد الإثبات الاجتماعي" : "Social-proof counter"}</p>
                  <p className="text-[10.5px] text-muted-foreground">{ar ? "«284 شخص يريده» على بطاقة المنتج" : "\"284 people want this\" on the product card"}</p>
                </div>
                <Toggle on={cfg.showCount} onChange={v => update({ showCount: v })} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "تخطيط صفحة القائمة" : "Wishlist page layout"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {([["grid", ar ? "شبكة" : "Grid"], ["list", ar ? "قائمة" : "List"]] as [PageLayout, string][]).map(([k, l]) => (
                    <button key={k} onClick={() => update({ layout: k })}
                      className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.layout === k ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] text-muted-foreground/60 tracking-[0.08em] uppercase">{ar ? "معاينة حية — جرّب القلب" : "Live preview — try the heart"}</p>
              <button onClick={() => setDarkPreview(d => !d)}
                className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {darkPreview ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>
            <ProductCardPreview cfg={cfg} dark={darkPreview} ar={ar} />
            <p className="text-[10.5px] text-muted-foreground/60 mt-2.5 text-center">
              {ar ? "اضغط القلب في المعاينة لتجربة الحركة" : "Click the heart in the preview to feel the animation"}
            </p>
          </div>
        </div>
      )}

      {/* ── Settings ── */}
      {tab === "settings" && (
        <div className="space-y-4 max-w-[620px]">
          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className="text-[13.5px] font-medium">{ar ? "السلوك" : "Behavior"}</h3>
            {[
              { key: "guestWishlist" as const, en: "Guest wishlists", ar: "قوائم الزوار", descEn: "Visitors can save without an account — stored locally until they sign up", descAr: "الزوار يحفظون بدون حساب — تُخزن محليًا حتى يسجلوا" },
              { key: "mergeOnLogin" as const, en: "Merge on login", ar: "الدمج عند الدخول", descEn: "Guest list merges into the account list on sign-in, nothing lost", descAr: "قائمة الزائر تندمج مع قائمة الحساب عند الدخول، لا شيء يضيع" },
              { key: "multiList" as const, en: "Multiple lists", ar: "قوائم متعددة", descEn: "\"Summer looks\", \"Gift ideas\" — customers organize their own lists", descAr: "«إطلالات الصيف»، «أفكار هدايا» — العملاء ينظمون قوائمهم" },
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12.5px] text-foreground">{ar ? s.ar : s.en}</p>
                  <p className="text-[10.5px] text-muted-foreground">{ar ? s.descAr : s.descEn}</p>
                </div>
                <Toggle on={cfg[s.key]} onChange={v => update({ [s.key]: v } as Partial<WishlistConfig>)} />
              </div>
            ))}
          </div>

          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className="text-[13.5px] font-medium flex items-center gap-1.5"><Link2 size={13} />{ar ? "المشاركة" : "Sharing"}</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12.5px] text-foreground">{ar ? "روابط مشاركة عامة" : "Public share links"}</p>
                <p className="text-[10.5px] text-muted-foreground">{ar ? "قوائم قابلة للمشاركة — مثالية لهدايا الأعياد والزفاف" : "Shareable lists — perfect for gifting seasons and registries"}</p>
              </div>
              <Toggle on={cfg.shareLinks} onChange={v => update({ shareLinks: v })} />
            </div>
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
