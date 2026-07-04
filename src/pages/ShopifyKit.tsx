/**
 * Shopify Kit — storefront app suite hub
 * عدة شوبيفاي — مركز تطبيقات المتجر
 *
 * App-store style gallery for the THOTH storefront apps that run on the
 * connected Shopify store: Wallet (store credit), Wishlist, Reviews.
 * Each card enables/disables the app and links into its full console.
 */

import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "../context/LanguageContext";
import { loadKitState, setAppEnabled, type KitAppKey } from "../lib/shopify-kit";
import {
  Wallet, Heart, Star, Store, Check, ArrowUpRight,
  Wifi, WifiOff, Sparkles, Boxes, Repeat, Layers,
} from "lucide-react";

// ─── App catalog ─────────────────────────────────────────

interface KitApp {
  key: KitAppKey;
  icon: React.ElementType;
  nameEn: string; nameAr: string;
  tagEn: string; tagAr: string;
  descEn: string; descAr: string;
  gradient: string;          // icon tile
  accent: string;            // text accent
  chipBg: string;
  path: string;
  featuresEn: string[]; featuresAr: string[];
  stats: { valEn: string; valAr: string; labelEn: string; labelAr: string }[];
}

const APPS: KitApp[] = [
  {
    key: "wallet", icon: Wallet,
    nameEn: "Wallet", nameAr: "المحفظة",
    tagEn: "Store credit & cashback", tagAr: "رصيد المتجر والكاش باك",
    descEn: "A branded store-credit wallet on your storefront — cashback on every order, instant refunds to credit, gift credit, and one-tap spending at checkout.",
    descAr: "محفظة رصيد بعلامتك التجارية داخل المتجر — كاش باك على كل طلب، استرداد فوري كرصيد، رصيد هدايا، ودفع بلمسة واحدة عند إتمام الشراء.",
    gradient: "from-emerald-500 to-teal-600", accent: "text-emerald-600", chipBg: "bg-emerald-50 text-emerald-700",
    path: "/shopify/kit/wallet",
    featuresEn: ["Cashback rules", "Refund to wallet", "Referral credit", "Checkout integration"],
    featuresAr: ["قواعد الكاش باك", "استرداد للمحفظة", "رصيد الإحالة", "تكامل الدفع"],
    stats: [
      { valEn: "EGP 48.2k", valAr: "48.2 ألف ج.م", labelEn: "Credit in wallets", labelAr: "رصيد في المحافظ" },
      { valEn: "1,284", valAr: "1,284", labelEn: "Active wallets", labelAr: "محفظة نشطة" },
      { valEn: "31%", valAr: "31%", labelEn: "Repeat-order lift", labelAr: "زيادة التكرار" },
    ],
  },
  {
    key: "wishlist", icon: Heart,
    nameEn: "Wishlist", nameAr: "قائمة الأمنيات",
    tagEn: "Save, share & win back", tagAr: "احفظ وشارك واسترجع",
    descEn: "Buttery-smooth wishlists with price-drop and back-in-stock alerts that quietly turn browsers into buyers — guest lists, sharing, and social proof included.",
    descAr: "قوائم أمنيات سلسة مع تنبيهات انخفاض السعر وعودة التوفر تحوّل المتصفحين إلى مشترين — قوائم للزوار ومشاركة وإثبات اجتماعي.",
    gradient: "from-rose-500 to-pink-600", accent: "text-rose-600", chipBg: "bg-rose-50 text-rose-700",
    path: "/shopify/kit/wishlist",
    featuresEn: ["Price-drop alerts", "Back-in-stock", "Guest wishlists", "Share links"],
    featuresAr: ["تنبيه انخفاض السعر", "عودة التوفر", "قوائم الزوار", "روابط مشاركة"],
    stats: [
      { valEn: "3,412", valAr: "3,412", labelEn: "Items wishlisted", labelAr: "منتج محفوظ" },
      { valEn: "18.4%", valAr: "18.4%", labelEn: "Wishlist → cart", labelAr: "من القائمة للسلة" },
      { valEn: "642", valAr: "642", labelEn: "Alerts sent / mo", labelAr: "تنبيه شهريًا" },
    ],
  },
  {
    key: "reviews", icon: Star,
    nameEn: "Reviews", nameAr: "التقييمات",
    tagEn: "Social proof engine", tagAr: "محرك الإثبات الاجتماعي",
    descEn: "Collect gorgeous photo reviews on autopilot, moderate with one tap, reward reviewers with loyalty points, and show it all off in a widget you fully control.",
    descAr: "اجمع تقييمات بالصور تلقائيًا، وأدرها بلمسة، وكافئ المقيّمين بنقاط الولاء، واعرضها في ودجت تتحكم فيه بالكامل.",
    gradient: "from-amber-400 to-orange-500", accent: "text-amber-600", chipBg: "bg-amber-50 text-amber-700",
    path: "/shopify/kit/reviews",
    featuresEn: ["Photo reviews", "Auto-requests", "Loyalty rewards", "SEO rich snippets"],
    featuresAr: ["تقييمات بالصور", "طلبات تلقائية", "مكافآت الولاء", "نتائج بحث غنية"],
    stats: [
      { valEn: "4.8 ★", valAr: "4.8 ★", labelEn: "Average rating", labelAr: "متوسط التقييم" },
      { valEn: "1,096", valAr: "1,096", labelEn: "Published reviews", labelAr: "تقييم منشور" },
      { valEn: "38%", valAr: "38%", labelEn: "With photos", labelAr: "بالصور" },
    ],
  },
];

const COMING_SOON = [
  { icon: Boxes, en: "Bundles & Upsell", ar: "الحزم والبيع الإضافي" },
  { icon: Repeat, en: "Subscriptions", ar: "الاشتراكات" },
  { icon: Layers, en: "Size Guide", ar: "دليل المقاسات" },
];

// ─── Toggle ──────────────────────────────────────────────

function Toggle({ on, onChange, accentBg }: { on: boolean; onChange: (v: boolean) => void; accentBg: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${on ? accentBg : "bg-muted-foreground/25"}`}
    >
      <span className={`absolute top-0.5 start-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-4 rtl:-translate-x-4" : ""}`} />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════

export default function ShopifyKitPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [kit, setKit] = useState(loadKitState());
  const [toast, setToast] = useState<string | null>(null);

  // Store connection comes from the Integration hub's saved state.
  const storeConn = (() => {
    try {
      const raw = localStorage.getItem("thoth_shopify_integration");
      if (!raw) return null;
      const p = JSON.parse(raw);
      return p?.store_url ? { url: p.store_url as string, connected: p.status === "connected" } : null;
    } catch { return null; }
  })();

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2200); }

  function toggleApp(app: KitAppKey, name: string, on: boolean) {
    setKit(setAppEnabled(app, on));
    showToast(on ? (ar ? `تم تفعيل ${name}` : `${name} enabled`) : (ar ? `تم إيقاف ${name}` : `${name} disabled`));
  }

  const enabledCount = APPS.filter(a => kit.enabled[a.key]).length;

  return (
    <div className="min-h-full py-8 px-7 md:px-10 max-w-[1020px] mx-auto">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-foreground text-background text-[13px] font-medium shadow-lg flex items-center gap-2">
          <Check size={14} />{toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] text-muted-foreground/60 tracking-[0.08em] uppercase mb-2">{ar ? "شوبيفاي" : "Shopify"}</p>
          <h1 className="text-[26px] font-medium text-foreground leading-tight" style={{ fontFamily: "var(--app-font-serif)", letterSpacing: "-0.025em" }}>
            {ar ? "عدة شوبيفاي" : "Shopify Kit"}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1.5 max-w-[520px]">
            {ar
              ? "تطبيقات متجر من ثوث تعمل مباشرة على واجهة متجرك — بدون تطبيقات خارجية، بيانات واحدة، تجربة واحدة."
              : "THOTH-native storefront apps running directly on your store — no third-party apps, one data source, one experience."}
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground border border-border/50 rounded-full px-3 py-1.5 whitespace-nowrap">
          {enabledCount}/{APPS.length} {ar ? "مفعّل" : "enabled"}
        </span>
      </div>

      {/* Store connection strip */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${storeConn?.connected ? "border-emerald-200 bg-emerald-50/40" : "border-border/40 bg-background"}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${storeConn?.connected ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
          {storeConn?.connected ? <Wifi size={15} /> : <WifiOff size={15} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-foreground truncate">
            {storeConn?.connected
              ? (ar ? "المتجر متصل" : "Store connected")
              : (ar ? "لا يوجد متجر متصل" : "No store connected")}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {storeConn?.url || (ar ? "اربط متجرك لتشغيل التطبيقات على الواجهة" : "Connect your store to run these apps on your storefront")}
          </p>
        </div>
        <Link href="/shopify/integration"
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-border/60 text-[12px] text-foreground hover:bg-muted transition-colors whitespace-nowrap">
          <Store size={12} />{storeConn?.connected ? (ar ? "إدارة الاتصال" : "Manage") : (ar ? "اتصال" : "Connect")}
        </Link>
      </div>

      {/* App cards */}
      <div className="space-y-4">
        {APPS.map(app => {
          const Icon = app.icon;
          const on = kit.enabled[app.key];
          return (
            <div key={app.key}
              className={`border rounded-2xl bg-background overflow-hidden transition-all hover:shadow-sm ${on ? "border-border/50" : "border-border/30"}`}>
              <div className="p-5 md:p-6 flex flex-col md:flex-row gap-5">
                {/* Icon tile */}
                <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-sm ${on ? "" : "grayscale opacity-60"} transition-all`}>
                  <Icon size={24} className="text-white" strokeWidth={2} />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-[17px] font-medium text-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>
                      {ar ? app.nameAr : app.nameEn}
                    </h2>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${app.chipBg}`}>
                      {ar ? app.tagAr : app.tagEn}
                    </span>
                    <span className="flex items-center gap-1.5 ms-auto">
                      <span className={`text-[10px] ${on ? app.accent : "text-muted-foreground"}`}>
                        {on ? (ar ? "مفعّل" : "Enabled") : (ar ? "موقوف" : "Off")}
                      </span>
                      <Toggle on={on} onChange={(v) => toggleApp(app.key, ar ? app.nameAr : app.nameEn, v)}
                        accentBg={app.key === "wallet" ? "bg-emerald-500" : app.key === "wishlist" ? "bg-rose-500" : "bg-amber-500"} />
                    </span>
                  </div>

                  <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1.5 max-w-[560px]">
                    {ar ? app.descAr : app.descEn}
                  </p>

                  {/* Feature chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(ar ? app.featuresAr : app.featuresEn).map(f => (
                      <span key={f} className="text-[10.5px] px-2 py-1 rounded-md bg-muted/60 text-muted-foreground">{f}</span>
                    ))}
                  </div>

                  {/* Stats + CTA */}
                  <div className="flex items-end justify-between mt-4 pt-4 border-t border-border/30 gap-3 flex-wrap">
                    <div className="flex gap-6">
                      {app.stats.map((s, i) => (
                        <div key={i}>
                          <p className={`text-[15px] font-medium tabular-nums ${on ? app.accent : "text-muted-foreground"}`} style={{ fontFamily: "var(--app-font-serif)" }}>
                            {ar ? s.valAr : s.valEn}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{ar ? s.labelAr : s.labelEn}</p>
                        </div>
                      ))}
                    </div>
                    <Link href={app.path}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[12.5px] font-medium hover:opacity-90 transition-opacity">
                      {ar ? "فتح التطبيق" : "Open app"}<ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming soon */}
      <div className="mt-8">
        <p className="text-[11px] text-muted-foreground/60 tracking-[0.08em] uppercase mb-3 flex items-center gap-1.5">
          <Sparkles size={11} />{ar ? "قريبًا في العدة" : "Coming to the kit"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {COMING_SOON.map(cs => {
            const Icon = cs.icon;
            return (
              <div key={cs.en} className="border border-dashed border-border/50 rounded-xl px-4 py-3.5 flex items-center gap-3 opacity-70">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-[12.5px] text-foreground">{ar ? cs.ar : cs.en}</p>
                  <p className="text-[10px] text-muted-foreground">{ar ? "قريبًا" : "Coming soon"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
