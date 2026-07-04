/**
 * Shopify Kit · Reviews — social proof engine console
 * عدة شوبيفاي · التقييمات — محرك الإثبات الاجتماعي
 *
 * Tabs: Overview (rating health) · Moderation (queue, replies, feature) ·
 * Collection (post-purchase requests, incentives) · Display (live widget
 * customizer) · Settings. Demo mode persists via lib/shopify-kit.
 */

import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "../context/LanguageContext";
import { loadKitState, setAppEnabled, loadAppConfig, saveAppConfig } from "../lib/shopify-kit";
import {
  Star, Check, X, ChevronLeft, MessageSquare, Camera,
  BadgeCheck, Sparkles, Mail, Gift, Reply, Pin,
  Trash2, ShieldAlert, Sun, Moon, TrendingUp, Search as SearchIcon,
  LayoutGrid, List, GalleryHorizontal, Globe, Ban,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────

type WidgetLayout = "grid" | "list" | "carousel";

interface ReviewsConfig {
  // collection
  requestOn: boolean; requestDelayDays: number;
  reminderOn: boolean; reminderDelayDays: number;
  incentiveType: "none" | "points" | "discount";
  incentivePoints: number; incentiveDiscountPct: number;
  photoBonusOn: boolean; photoBonusPoints: number;
  // display
  starColor: string; layout: WidgetLayout;
  showPhotos: boolean; showVerified: boolean; showAvatars: boolean; showDates: boolean;
  // settings
  autoPublishOn: boolean; autoPublishMinStars: number;
  profanityFilter: boolean; richSnippets: boolean;
}

const DEFAULT_CONFIG: ReviewsConfig = {
  requestOn: true, requestDelayDays: 7,
  reminderOn: true, reminderDelayDays: 5,
  incentiveType: "points", incentivePoints: 200, incentiveDiscountPct: 10,
  photoBonusOn: true, photoBonusPoints: 150,
  starColor: "#f59e0b", layout: "grid",
  showPhotos: true, showVerified: true, showAvatars: true, showDates: true,
  autoPublishOn: true, autoPublishMinStars: 4,
  profanityFilter: true, richSnippets: true,
};

const STAR_SWATCHES = ["#f59e0b", "#eab308", "#059669", "#e11d48", "#7c3aed", "#111827"];

// ─── Demo data ───────────────────────────────────────────

type ReviewStatus = "pending" | "published" | "featured" | "rejected" | "spam";

interface Review {
  id: string; stars: number;
  authorEn: string; authorAr: string;
  productEn: string; productAr: string; productEmoji: string;
  bodyEn: string; bodyAr: string;
  status: ReviewStatus; verified: boolean; photos: string[];
  date: string; reply?: string;
}

const REVIEWS_SEED: Review[] = [
  { id: "rv-01", stars: 5, authorEn: "Nour El-Sayed", authorAr: "نور السيد", productEn: "Linen Summer Dress", productAr: "فستان كتان صيفي", productEmoji: "👗",
    bodyEn: "The fabric is unreal — light, breathable, and the fit is exactly as the size guide promised. Wore it to a wedding and got stopped twice.",
    bodyAr: "الخامة غير طبيعية — خفيفة ومريحة والمقاس مظبوط زي دليل المقاسات بالضبط. لبسته في فرح واتسألت عليه مرتين.",
    status: "pending", verified: true, photos: ["📸", "📸"], date: "2026-07-03" },
  { id: "rv-02", stars: 4, authorEn: "Omar Khaled", authorAr: "عمر خالد", productEn: "Oversized Blazer", productAr: "بليزر واسع", productEmoji: "🧥",
    bodyEn: "Great cut and quality stitching. Took one star off because delivery took an extra day, but the blazer itself is superb.",
    bodyAr: "قصة ممتازة وخياطة عالية. نجمة ناقصة لأن التوصيل اتأخر يوم، لكن البليزر نفسه ممتاز.",
    status: "pending", verified: true, photos: [], date: "2026-07-02" },
  { id: "rv-03", stars: 5, authorEn: "Farida Mansour", authorAr: "فريدة منصور", productEn: "Silk Scarf — Nile", productAr: "وشاح حرير — النيل", productEmoji: "🧣",
    bodyEn: "Colors are richer in person. It's become my signature piece — I've already ordered two more as gifts.",
    bodyAr: "الألوان أحلى في الحقيقة. بقت قطعتي المميزة — طلبت اتنين كمان هدايا.",
    status: "featured", verified: true, photos: ["📸"], date: "2026-06-30", reply: "Thank you Farida! The Nile colorway is our favorite too. 💛" },
  { id: "rv-04", stars: 2, authorEn: "Hassan Tarek", authorAr: "حسن طارق", productEn: "Wide-Leg Trousers", productAr: "بنطلون واسع", productEmoji: "👖",
    bodyEn: "Runs small. I followed the size chart and still had to exchange. The exchange process was smooth though.",
    bodyAr: "المقاس صغير. مشيت على جدول المقاسات وبرضه اضطريت أستبدل. بس عملية الاستبدال كانت سهلة.",
    status: "published", verified: true, photos: [], date: "2026-06-28" },
  { id: "rv-05", stars: 5, authorEn: "Salma Ibrahim", authorAr: "سلمى إبراهيم", productEn: "Embroidered Kaftan", productAr: "قفطان مطرز", productEmoji: "✨",
    bodyEn: "Hand embroidery you can feel. Worth every pound — this is craftsmanship you don't find online anymore.",
    bodyAr: "تطريز يدوي تحس بيه. يستاهل كل جنيه — دي حرفية مبقتش موجودة أونلاين.",
    status: "published", verified: true, photos: ["📸", "📸", "📸"], date: "2026-06-26" },
  { id: "rv-06", stars: 1, authorEn: "bot_user_2291", authorAr: "bot_user_2291", productEn: "Linen Summer Dress", productAr: "فستان كتان صيفي", productEmoji: "👗",
    bodyEn: "CHECK MY PROFILE FOR CHEAP DESIGNER BAGS >>> bit.ly/xxxx",
    bodyAr: "CHECK MY PROFILE FOR CHEAP DESIGNER BAGS >>> bit.ly/xxxx",
    status: "spam", verified: false, photos: [], date: "2026-06-25" },
];

const DIST = [
  { stars: 5, count: 812 }, { stars: 4, count: 186 },
  { stars: 3, count: 58 }, { stars: 2, count: 27 }, { stars: 1, count: 13 },
];

// ─── Small UI helpers ────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className={`relative w-9 h-5 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-amber-500" : "bg-muted-foreground/25"}`}>
      <span className={`absolute top-0.5 start-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-4 rtl:-translate-x-4" : ""}`} />
    </button>
  );
}

function Stars({ n, size = 12, color = "#f59e0b" }: { n: number; size?: number; color?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= n ? color : "none"} style={{ color: i <= n ? color : "#d4d4d8" }} />
      ))}
    </span>
  );
}

const cardCls = "border border-border/40 rounded-xl bg-background";
const inputCls = "h-9 px-3 rounded-xl border border-border/80 bg-card text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors";
const numCls = `${inputCls} w-24 tabular-nums`;

const STATUS_META: Record<ReviewStatus, { en: string; ar: string; cls: string }> = {
  pending:   { en: "Pending", ar: "بانتظار المراجعة", cls: "bg-amber-50 text-amber-700" },
  published: { en: "Published", ar: "منشور", cls: "bg-emerald-50 text-emerald-700" },
  featured:  { en: "Featured", ar: "مميز", cls: "bg-violet-50 text-violet-700" },
  rejected:  { en: "Rejected", ar: "مرفوض", cls: "bg-rose-50 text-rose-600" },
  spam:      { en: "Spam", ar: "سبام", cls: "bg-zinc-100 text-zinc-500" },
};

// ─── Live preview: review widget ─────────────────────────

function ReviewWidgetPreview({ cfg, dark, ar }: { cfg: ReviewsConfig; dark: boolean; ar: boolean }) {
  const frameBg = dark ? "bg-zinc-900" : "bg-white";
  const cardBg = dark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200";
  const frameText = dark ? "text-zinc-100" : "text-zinc-800";
  const softText = dark ? "text-zinc-400" : "text-zinc-500";

  const samples = [
    { stars: 5, name: ar ? "نور" : "Nour", body: ar ? "الخامة غير طبيعية والمقاس مظبوط." : "The fabric is unreal, fit exactly right.", photos: cfg.showPhotos ? 2 : 0, date: ar ? "منذ يومين" : "2d ago" },
    { stars: 4, name: ar ? "عمر" : "Omar", body: ar ? "قصة ممتازة وخياطة عالية الجودة." : "Great cut and quality stitching.", photos: 0, date: ar ? "منذ 4 أيام" : "4d ago" },
    { stars: 5, name: ar ? "فريدة" : "Farida", body: ar ? "الألوان أحلى في الحقيقة. قطعتي المميزة." : "Colors are richer in person. My signature piece.", photos: cfg.showPhotos ? 1 : 0, date: ar ? "منذ أسبوع" : "1w ago" },
  ];
  const shown = cfg.layout === "carousel" ? samples.slice(0, 2) : samples;

  return (
    <div className={`w-full rounded-2xl border border-border/50 overflow-hidden ${frameBg} transition-colors p-5`}>
      {/* Summary header */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className={`text-[26px] font-semibold leading-none ${frameText}`}>4.8</p>
          <Stars n={5} size={11} color={cfg.starColor} />
        </div>
        <div className="flex-1 space-y-1">
          {DIST.slice(0, 3).map(d => (
            <div key={d.stars} className="flex items-center gap-2">
              <span className={`text-[9px] w-3 ${softText}`}>{d.stars}</span>
              <div className={`flex-1 h-1.5 rounded-full ${dark ? "bg-zinc-700" : "bg-zinc-100"}`}>
                <div className="h-full rounded-full" style={{ width: `${(d.count / DIST[0].count) * 100}%`, background: cfg.starColor }} />
              </div>
            </div>
          ))}
        </div>
        <span className={`text-[9.5px] ${softText}`}>{ar ? "1,096 تقييم" : "1,096 reviews"}</span>
      </div>

      {/* Reviews */}
      <div className={
        cfg.layout === "grid" ? "grid grid-cols-2 gap-2.5" :
        cfg.layout === "carousel" ? "flex gap-2.5 overflow-hidden" : "space-y-2.5"
      }>
        {shown.map((r, i) => (
          <div key={i} className={`border rounded-xl p-3 ${cardBg} ${cfg.layout === "carousel" ? "min-w-[46%]" : ""} ${cfg.layout === "grid" && i === 2 ? "col-span-2" : ""}`}>
            <div className="flex items-center gap-2 mb-1.5">
              {cfg.showAvatars && (
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white`} style={{ background: cfg.starColor }}>
                  {r.name[0]}
                </span>
              )}
              <div className="min-w-0">
                <p className={`text-[10.5px] font-medium leading-none ${frameText}`}>{r.name}</p>
                <Stars n={r.stars} size={9} color={cfg.starColor} />
              </div>
              {cfg.showVerified && (
                <span className="ms-auto flex items-center gap-0.5 text-[8px] text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5">
                  <BadgeCheck size={8} />{ar ? "شراء موثق" : "Verified"}
                </span>
              )}
            </div>
            <p className={`text-[10px] leading-relaxed ${softText}`}>{r.body}</p>
            {r.photos > 0 && (
              <div className="flex gap-1.5 mt-2">
                {Array.from({ length: r.photos }).map((_, j) => (
                  <span key={j} className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] ${dark ? "bg-zinc-700" : "bg-zinc-100"}`}>📸</span>
                ))}
              </div>
            )}
            {cfg.showDates && <p className={`text-[8.5px] mt-1.5 ${softText} opacity-70`}>{r.date}</p>}
          </div>
        ))}
      </div>
      {cfg.layout === "carousel" && (
        <div className="flex justify-center gap-1 mt-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.starColor }} />
          <span className={`w-1.5 h-1.5 rounded-full ${dark ? "bg-zinc-700" : "bg-zinc-200"}`} />
          <span className={`w-1.5 h-1.5 rounded-full ${dark ? "bg-zinc-700" : "bg-zinc-200"}`} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════

type Tab = "overview" | "moderation" | "collection" | "display" | "settings";

export default function ShopifyReviewsPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [tab, setTab] = useState<Tab>("overview");
  const [cfg, setCfg] = useState<ReviewsConfig>(() => loadAppConfig("reviews", DEFAULT_CONFIG));
  const [enabled, setEnabled] = useState(() => loadKitState().enabled.reviews);
  const [reviews, setReviews] = useState(REVIEWS_SEED);
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [darkPreview, setDarkPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2200); }

  function update(patch: Partial<ReviewsConfig>) {
    setCfg(prev => {
      const next = { ...prev, ...patch };
      saveAppConfig("reviews", next);
      return next;
    });
  }

  function toggleEnabled(v: boolean) {
    setEnabled(v); setAppEnabled("reviews", v);
    showToast(v ? (ar ? "تم تفعيل التقييمات" : "Reviews enabled") : (ar ? "تم إيقاف التقييمات" : "Reviews disabled"));
  }

  function setStatus(id: string, status: ReviewStatus, msg: string) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    showToast(msg);
  }

  function submitReply(id: string) {
    if (!replyText.trim()) return;
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyText.trim() } : r));
    setReplyingTo(null); setReplyText("");
    showToast(ar ? "تم نشر الرد" : "Reply published");
  }

  const TABS: { key: Tab; en: string; ar: string; badge?: number }[] = [
    { key: "overview", en: "Overview", ar: "نظرة عامة" },
    { key: "moderation", en: "Moderation", ar: "الإدارة", badge: reviews.filter(r => r.status === "pending").length },
    { key: "collection", en: "Collection", ar: "جمع التقييمات" },
    { key: "display", en: "Display", ar: "العرض" },
    { key: "settings", en: "Settings", ar: "الإعدادات" },
  ];

  const totalReviews = DIST.reduce((s, d) => s + d.count, 0);
  const avg = (DIST.reduce((s, d) => s + d.stars * d.count, 0) / totalReviews).toFixed(1);

  const filteredReviews = reviews.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search.length >= 2) {
      const q = search.toLowerCase();
      return r.authorEn.toLowerCase().includes(q) || r.authorAr.includes(q) || r.productEn.toLowerCase().includes(q) || r.bodyEn.toLowerCase().includes(q);
    }
    return true;
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
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm ${enabled ? "" : "grayscale opacity-60"}`}>
            <Star size={21} className="text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-[26px] font-medium text-foreground leading-tight" style={{ fontFamily: "var(--app-font-serif)", letterSpacing: "-0.025em" }}>
              {ar ? "التقييمات" : "Reviews"}
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {ar ? "اجمع وأدر واعرض الإثبات الاجتماعي بالكامل" : "Collect, moderate, and showcase social proof end-to-end"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`text-[11px] ${enabled ? "text-amber-600" : "text-muted-foreground"}`}>
            {enabled ? (ar ? "مفعّل" : "Live") : (ar ? "موقوف" : "Off")}
          </span>
          <Toggle on={enabled} onChange={toggleEnabled} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-border/40 bg-card w-fit mb-6 overflow-x-auto max-w-full">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`h-8 px-3.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {ar ? t.ar : t.en}
            {!!t.badge && (
              <span className={`text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-semibold ${tab === t.key ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-3">
            {/* Big rating */}
            <div className={`${cardCls} p-6 flex flex-col items-center justify-center text-center`}>
              <p className="text-[44px] font-medium leading-none tabular-nums" style={{ fontFamily: "var(--app-font-serif)" }}>{avg}</p>
              <div className="mt-2"><Stars n={5} size={16} color={cfg.starColor} /></div>
              <p className="text-[11px] text-muted-foreground mt-2">{totalReviews.toLocaleString()} {ar ? "تقييم منشور" : "published reviews"}</p>
            </div>
            {/* Distribution */}
            <div className={`${cardCls} p-5`}>
              <h3 className="text-[13.5px] font-medium mb-3.5">{ar ? "توزيع التقييمات" : "Rating distribution"}</h3>
              <div className="space-y-2">
                {DIST.map(d => (
                  <div key={d.stars} className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground w-3 tabular-nums">{d.stars}</span>
                    <Star size={11} fill={cfg.starColor} style={{ color: cfg.starColor }} />
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(d.count / totalReviews) * 100}%`, background: cfg.starColor }} />
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-end">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: TrendingUp, val: "96", labelEn: "New this month", labelAr: "جديد هذا الشهر", cls: "text-emerald-600" },
              { icon: Camera, val: "38%", labelEn: "With photos", labelAr: "بالصور", cls: "text-violet-600" },
              { icon: Reply, val: "87%", labelEn: "Response rate", labelAr: "معدل الرد", cls: "text-blue-600" },
              { icon: Mail, val: "41%", labelEn: "Request → review", labelAr: "طلب ← تقييم", cls: "text-amber-600" },
            ].map((k, i) => (
              <div key={i} className={`${cardCls} p-4`}>
                <k.icon size={14} className={`${k.cls} mb-2`} />
                <p className={`text-[18px] font-medium tabular-nums ${k.cls}`} style={{ fontFamily: "var(--app-font-serif)" }}>{k.val}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ar ? k.labelAr : k.labelEn}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-amber-100 bg-amber-50/40">
            <Sparkles size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-foreground/80 leading-relaxed">
              {ar
                ? "تقييم حسن (نجمتان) عن المقاسات تكرر 3 مرات هذا الشهر على «بنطلون واسع». راجع جدول المقاسات — رد واحد علني جيد يحسّن الثقة أكثر من عشرة تقييمات إيجابية."
                : "Hassan's 2-star sizing complaint is the 3rd this month on \"Wide-Leg Trousers\". Review the size chart — one good public reply builds more trust than ten 5-star reviews."}
            </p>
          </div>
        </div>
      )}

      {/* ── Moderation ── */}
      {tab === "moderation" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "pending", "published", "featured", "rejected", "spam"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`h-8 px-3 rounded-lg text-[11.5px] font-medium transition-colors ${statusFilter === s ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                {s === "all" ? (ar ? "الكل" : "All") : (ar ? STATUS_META[s].ar : STATUS_META[s].en)}
                {s === "pending" && reviews.some(r => r.status === "pending") && (
                  <span className="ms-1.5 text-[9px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">{reviews.filter(r => r.status === "pending").length}</span>
                )}
              </button>
            ))}
            <div className="relative ms-auto">
              <SearchIcon size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={ar ? "بحث..." : "Search..."} className={`${inputCls} w-44 ps-8`} />
            </div>
          </div>

          <div className="space-y-3">
            {filteredReviews.map(r => {
              const sm = STATUS_META[r.status];
              return (
                <div key={r.id} className={`${cardCls} p-5 ${r.status === "spam" ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3.5">
                    <span className="text-[22px] mt-0.5">{r.productEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Stars n={r.stars} color={cfg.starColor} />
                        <p className="text-[13px] font-medium text-foreground">{ar ? r.authorAr : r.authorEn}</p>
                        {r.verified && (
                          <span className="flex items-center gap-0.5 text-[9px] text-emerald-600"><BadgeCheck size={10} />{ar ? "شراء موثق" : "Verified purchase"}</span>
                        )}
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${sm.cls}`}>{ar ? sm.ar : sm.en}</span>
                        <span className="text-[10px] text-muted-foreground/60 ms-auto">{r.date}</span>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground mt-0.5">{ar ? r.productAr : r.productEn}</p>
                      <p className="text-[12.5px] text-foreground/85 leading-relaxed mt-2">{ar ? r.bodyAr : r.bodyEn}</p>
                      {r.photos.length > 0 && (
                        <div className="flex gap-2 mt-2.5">
                          {r.photos.map((p, i) => (
                            <span key={i} className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-[18px]">{p}</span>
                          ))}
                        </div>
                      )}
                      {r.reply && (
                        <div className="mt-3 ms-3 ps-3 border-s-2 border-primary/30">
                          <p className="text-[10px] font-medium text-primary mb-0.5">{ar ? "ردك" : "Your reply"}</p>
                          <p className="text-[11.5px] text-muted-foreground leading-relaxed">{r.reply}</p>
                        </div>
                      )}

                      {/* Reply box */}
                      {replyingTo === r.id ? (
                        <div className="mt-3 flex gap-2">
                          <input autoFocus value={replyText} onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && submitReply(r.id)}
                            placeholder={ar ? "اكتب ردًا علنيًا..." : "Write a public reply..."}
                            className={`${inputCls} flex-1`} />
                          <button onClick={() => submitReply(r.id)}
                            className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90">
                            {ar ? "نشر" : "Post"}
                          </button>
                          <button onClick={() => { setReplyingTo(null); setReplyText(""); }}
                            className="h-9 px-3 rounded-xl border border-border text-[12px] text-muted-foreground hover:bg-muted">
                            {ar ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-3.5">
                          {r.status === "pending" && (
                            <>
                              <button onClick={() => setStatus(r.id, "published", ar ? "تم النشر" : "Published")}
                                className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-medium hover:opacity-90 flex items-center gap-1"><Check size={11} />{ar ? "نشر" : "Approve"}</button>
                              <button onClick={() => setStatus(r.id, "rejected", ar ? "تم الرفض" : "Rejected")}
                                className="h-8 px-3 rounded-lg border border-border/60 text-[11px] text-muted-foreground hover:text-rose-600 hover:border-rose-200 flex items-center gap-1"><X size={11} />{ar ? "رفض" : "Reject"}</button>
                            </>
                          )}
                          {(r.status === "published" || r.status === "featured") && (
                            <button onClick={() => setStatus(r.id, r.status === "featured" ? "published" : "featured", r.status === "featured" ? (ar ? "أُلغي التمييز" : "Unfeatured") : (ar ? "تم التمييز" : "Featured on storefront"))}
                              className={`h-8 px-3 rounded-lg text-[11px] font-medium flex items-center gap-1 ${r.status === "featured" ? "bg-violet-100 text-violet-700" : "border border-border/60 text-muted-foreground hover:text-violet-600 hover:border-violet-200"}`}>
                              <Pin size={11} />{r.status === "featured" ? (ar ? "مميز" : "Featured") : (ar ? "تمييز" : "Feature")}
                            </button>
                          )}
                          {r.status !== "spam" && r.status !== "rejected" && (
                            <button onClick={() => { setReplyingTo(r.id); setReplyText(r.reply || ""); }}
                              className="h-8 px-3 rounded-lg border border-border/60 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1">
                              <Reply size={11} />{r.reply ? (ar ? "تعديل الرد" : "Edit reply") : (ar ? "رد" : "Reply")}
                            </button>
                          )}
                          {r.status === "spam" && (
                            <button onClick={() => setReviews(prev => prev.filter(x => x.id !== r.id))}
                              className="h-8 px-3 rounded-lg border border-border/60 text-[11px] text-muted-foreground hover:text-rose-600 flex items-center gap-1">
                              <Trash2 size={11} />{ar ? "حذف نهائي" : "Delete forever"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredReviews.length === 0 && (
              <div className={`${cardCls} py-12 text-center`}>
                <MessageSquare size={20} className="mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-[12.5px] text-muted-foreground">{ar ? "لا توجد تقييمات هنا" : "Nothing here"}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Collection ── */}
      {tab === "collection" && (
        <div className="space-y-3.5 max-w-[680px]">
          <div className={`${cardCls} p-5`}>
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.requestOn ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                <Mail size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[13.5px] font-medium">{ar ? "طلب تقييم تلقائي" : "Automatic review requests"}</h3>
                  <Toggle on={cfg.requestOn} onChange={v => update({ requestOn: v })} />
                </div>
                <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                  {ar ? "بريد أنيق يُرسل بعد التسليم — التوقيت الصحيح هو كل شيء." : "A beautiful email sent after delivery — timing is everything."}
                </p>
                {cfg.requestOn && (
                  <div className="mt-3.5 pt-3.5 border-t border-border/30 space-y-3">
                    <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      {ar ? "أرسل بعد التسليم بـ" : "Send"}
                      <input type="number" min="1" max="60" value={cfg.requestDelayDays}
                        onChange={e => update({ requestDelayDays: parseInt(e.target.value) || 7 })} className={numCls} />
                      {ar ? "يوم" : "days after delivery"}
                    </label>
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        {ar ? "تذكير واحد بعد" : "One reminder"}
                        <input type="number" min="1" max="30" value={cfg.reminderDelayDays} disabled={!cfg.reminderOn}
                          onChange={e => update({ reminderDelayDays: parseInt(e.target.value) || 5 })} className={`${numCls} disabled:opacity-40`} />
                        {ar ? "يوم إذا لم يقيّم" : "days later if no review"}
                      </label>
                      <Toggle on={cfg.reminderOn} onChange={v => update({ reminderOn: v })} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`${cardCls} p-5`}>
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Gift size={16} /></div>
              <div className="flex-1">
                <h3 className="text-[13.5px] font-medium">{ar ? "حافز التقييم" : "Review incentive"}</h3>
                <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                  {ar ? "كافئ من يقيّم — النقاط تتكامل مباشرة مع وحدة الولاء في ثوث." : "Reward reviewers — points integrate directly with THOTH's Loyalty module."}
                </p>
                <div className="mt-3.5 pt-3.5 border-t border-border/30 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {([["none", ar ? "بدون" : "None"], ["points", ar ? "نقاط ولاء" : "Loyalty points"], ["discount", ar ? "كود خصم" : "Discount code"]] as const).map(([k, l]) => (
                      <button key={k} onClick={() => update({ incentiveType: k })}
                        className={`h-9 rounded-lg border text-[11.5px] transition-colors ${cfg.incentiveType === k ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  {cfg.incentiveType === "points" && (
                    <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      {ar ? "نقاط لكل تقييم" : "Points per review"}
                      <input type="number" min="0" value={cfg.incentivePoints}
                        onChange={e => update({ incentivePoints: parseInt(e.target.value) || 0 })} className={numCls} />
                    </label>
                  )}
                  {cfg.incentiveType === "discount" && (
                    <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      {ar ? "خصم للطلب القادم" : "Discount on next order"}
                      <input type="number" min="0" max="50" value={cfg.incentiveDiscountPct}
                        onChange={e => update({ incentiveDiscountPct: parseInt(e.target.value) || 0 })} className={numCls} />%
                    </label>
                  )}
                  {cfg.incentiveType !== "none" && (
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <Camera size={13} />
                        {ar ? "مكافأة إضافية للصور:" : "Photo bonus:"}
                        <input type="number" min="0" value={cfg.photoBonusPoints} disabled={!cfg.photoBonusOn}
                          onChange={e => update({ photoBonusPoints: parseInt(e.target.value) || 0 })} className={`${numCls} disabled:opacity-40`} />
                        {cfg.incentiveType === "points" ? (ar ? "نقطة" : "pts") : "%"}
                      </label>
                      <Toggle on={cfg.photoBonusOn} onChange={v => update({ photoBonusOn: v })} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Email preview */}
          <div className={`${cardCls} p-5`}>
            <h3 className="text-[13.5px] font-medium mb-3">{ar ? "معاينة بريد الطلب" : "Request email preview"}</h3>
            <div className="rounded-xl border border-border/50 bg-card p-5 max-w-[400px] mx-auto">
              <p className="text-[16px] mb-1" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "كيف كان «فستان كتان صيفي»؟" : "How was your Linen Summer Dress?"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {ar ? "وصلك منذ أسبوع — نحب نسمع رأيك. يأخذ 30 ثانية." : "It arrived a week ago — we'd love your take. Takes 30 seconds."}
              </p>
              <div className="flex justify-center my-4"><Stars n={0} size={26} color={cfg.starColor} /></div>
              {cfg.incentiveType !== "none" && (
                <p className="text-[10.5px] text-center text-amber-700 bg-amber-50 rounded-lg py-2 px-3">
                  {cfg.incentiveType === "points"
                    ? (ar ? `🎁 اكسب ${cfg.incentivePoints} نقطة ولاء مقابل تقييمك` : `🎁 Earn ${cfg.incentivePoints} loyalty points for your review`)
                    : (ar ? `🎁 خصم ${cfg.incentiveDiscountPct}% على طلبك القادم` : `🎁 ${cfg.incentiveDiscountPct}% off your next order`)}
                  {cfg.photoBonusOn && (ar ? ` · +${cfg.photoBonusPoints} للصور` : ` · +${cfg.photoBonusPoints} with photos`)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Display ── */}
      {tab === "display" && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 items-start">
          <div className="space-y-4">
            <div className={`${cardCls} p-5 space-y-4`}>
              <h3 className="text-[13.5px] font-medium">{ar ? "التخطيط" : "Layout"}</h3>
              <div className="grid grid-cols-3 gap-2">
                {([["grid", LayoutGrid, ar ? "شبكة" : "Grid"], ["list", List, ar ? "قائمة" : "List"], ["carousel", GalleryHorizontal, ar ? "شريط" : "Carousel"]] as [WidgetLayout, React.ElementType, string][]).map(([k, I, l]) => (
                  <button key={k} onClick={() => update({ layout: k })}
                    className={`h-16 rounded-lg border flex flex-col items-center justify-center gap-1.5 text-[10.5px] transition-colors ${cfg.layout === k ? "border-primary bg-primary/5 text-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"}`}>
                    <I size={16} />{l}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">{ar ? "لون النجوم" : "Star color"}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {STAR_SWATCHES.map(c => (
                    <button key={c} onClick={() => update({ starColor: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${cfg.starColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                      style={{ background: c }} aria-label={c} />
                  ))}
                  <input type="color" value={cfg.starColor} onChange={e => update({ starColor: e.target.value })}
                    className="w-8 h-8 rounded-full border border-border/60 cursor-pointer bg-transparent p-0.5" aria-label="Custom color" />
                </div>
              </div>
            </div>

            <div className={`${cardCls} p-5 space-y-4`}>
              <h3 className="text-[13.5px] font-medium">{ar ? "العناصر" : "Elements"}</h3>
              {[
                { key: "showPhotos" as const, en: "Customer photos", ar: "صور العملاء", descEn: "Photo strips inside review cards", descAr: "شرائط صور داخل بطاقات التقييم" },
                { key: "showVerified" as const, en: "Verified badge", ar: "شارة الشراء الموثق", descEn: "Marks reviews from real orders", descAr: "تميّز التقييمات من طلبات حقيقية" },
                { key: "showAvatars" as const, en: "Reviewer avatars", ar: "صور المقيّمين", descEn: "Initial circles beside names", descAr: "دوائر الأحرف بجانب الأسماء" },
                { key: "showDates" as const, en: "Review dates", ar: "تواريخ التقييم", descEn: "Relative timestamps for freshness", descAr: "توقيتات نسبية للحداثة" },
              ].map(el => (
                <div key={el.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12.5px] text-foreground">{ar ? el.ar : el.en}</p>
                    <p className="text-[10.5px] text-muted-foreground">{ar ? el.descAr : el.descEn}</p>
                  </div>
                  <Toggle on={cfg[el.key]} onChange={v => update({ [el.key]: v } as Partial<ReviewsConfig>)} />
                </div>
              ))}
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
            <ReviewWidgetPreview cfg={cfg} dark={darkPreview} ar={ar} />
            <p className="text-[10.5px] text-muted-foreground/60 mt-2.5 text-center">
              {ar ? "هكذا يظهر الودجت على صفحة المنتج" : "This is exactly how the widget renders on product pages"}
            </p>
          </div>
        </div>
      )}

      {/* ── Settings ── */}
      {tab === "settings" && (
        <div className="space-y-4 max-w-[620px]">
          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className="text-[13.5px] font-medium">{ar ? "النشر" : "Publishing"}</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12.5px] text-foreground">{ar ? "نشر تلقائي" : "Auto-publish"}</p>
                <p className="text-[10.5px] text-muted-foreground">{ar ? "التقييمات العالية تُنشر فورًا؛ الأقل تنتظر مراجعتك" : "High ratings go live instantly; lower ones wait for you"}</p>
              </div>
              <Toggle on={cfg.autoPublishOn} onChange={v => update({ autoPublishOn: v })} />
            </div>
            {cfg.autoPublishOn && (
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground ps-1">
                {ar ? "انشر تلقائيًا التقييمات من" : "Auto-publish reviews rated"}
                <select value={cfg.autoPublishMinStars} onChange={e => update({ autoPublishMinStars: parseInt(e.target.value) })}
                  className={`${inputCls} w-20 cursor-pointer`}>
                  {[3, 4, 5].map(n => <option key={n} value={n}>{n}★</option>)}
                </select>
                {ar ? "فأعلى" : "and up"}
              </label>
            )}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/30">
              <div className="flex items-center gap-2.5">
                <Ban size={14} className="text-muted-foreground" />
                <div>
                  <p className="text-[12.5px] text-foreground">{ar ? "فلتر الألفاظ" : "Profanity filter"}</p>
                  <p className="text-[10.5px] text-muted-foreground">{ar ? "بالعربية والإنجليزية — يحوّل المخالف لقائمة الانتظار" : "Arabic & English — flags offenders to the pending queue"}</p>
                </div>
              </div>
              <Toggle on={cfg.profanityFilter} onChange={v => update({ profanityFilter: v })} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-muted-foreground" />
                <div>
                  <p className="text-[12.5px] text-foreground">{ar ? "نتائج بحث غنية (SEO)" : "SEO rich snippets"}</p>
                  <p className="text-[10.5px] text-muted-foreground">{ar ? "نجوم التقييم تظهر في نتائج جوجل" : "Star ratings appear directly in Google results"}</p>
                </div>
              </div>
              <Toggle on={cfg.richSnippets} onChange={v => update({ richSnippets: v })} />
            </div>
          </div>

          <div className={`${cardCls} p-5`}>
            <div className="flex items-center gap-2.5 mb-1">
              <ShieldAlert size={14} className="text-muted-foreground" />
              <h3 className="text-[13.5px] font-medium">{ar ? "الحماية من السبام" : "Spam protection"}</h3>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              {ar
                ? "مفعّلة دائمًا: كشف الروابط، بصمة الجهاز، وحد تقييم واحد لكل طلب. التقييمات المشبوهة تذهب لتبويب «سبام» ولا تظهر أبدًا للعملاء."
                : "Always on: link detection, device fingerprinting, and one-review-per-order. Suspicious reviews land in the Spam tab and never reach customers."}
            </p>
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
