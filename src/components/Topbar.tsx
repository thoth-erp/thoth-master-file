import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Menu, LogIn, LogOut, User, Settings, HelpCircle,
  Keyboard, Moon, Sun, Languages, ChevronDown, Shield, CreditCard,
  Palette, Eye, BellOff, Clock, MapPin, Building2, Star, Zap,
  MessageSquare, FileText, AlertTriangle, Check, ExternalLink,
  Smartphone, Monitor, Globe, Bookmark, Archive, Hash, BarChart3, BookOpen,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCommandBar } from "../context/CommandBarContext";
import { useLocation, Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import { NotificationsPanel, useUnreadCount } from "./NotificationsPanel";
import { ThemeToggle } from "./ThemeToggle";

const routeLabels: Record<string, { en: string; ar: string }> = {
  "/":              { en: "Dashboard",     ar: "لوحة التحكم" },
  "/today":         { en: "Today",         ar: "اليوم" },
  "/activity":      { en: "Activity",      ar: "النشاط" },
  "/people":        { en: "Contacts",      ar: "جهات الاتصال" },
  "/organizations": { en: "Customers",     ar: "العملاء" },
  "/products":      { en: "Products",      ar: "المنتجات" },
  "/quotations":    { en: "Quotations",    ar: "عروض الأسعار" },
  "/orders":        { en: "Orders",        ar: "الطلبات" },
  "/work":          { en: "Work",          ar: "المهام" },
  "/sales":         { en: "Sales",         ar: "المبيعات" },
  "/operations":    { en: "Operations",    ar: "العمليات" },
  "/inventory":     { en: "Inventory",     ar: "المخزن" },
  "/resources":     { en: "Resources",     ar: "الخامات والمعدات" },
  "/finance":       { en: "Finance",       ar: "الحسابات" },
  "/intelligence":  { en: "Intelligence",  ar: "الذكاء" },
  "/memory":        { en: "Memory",        ar: "الذاكرة" },
  "/decisions":     { en: "Decisions",     ar: "القرارات" },
  "/queue":         { en: "Work Queue",    ar: "أوامر التشغيل" },
  "/forecast":      { en: "Forecast",      ar: "التوقعات" },
  "/risk":          { en: "Alerts",        ar: "تنبيهات" },
  "/rhythms":       { en: "Rhythms",       ar: "الإيقاعات" },
  "/exec":          { en: "Executive",     ar: "التنفيذي" },
  "/team":          { en: "Team",          ar: "الفريق" },
  "/purchasing":    { en: "Purchasing",    ar: "المشتريات" },
  "/reports":       { en: "Reports",       ar: "التقارير" },
  "/roadmap":       { en: "Roadmap",       ar: "خارطة الطريق" },
  "/data":          { en: "Data",          ar: "إدارة البيانات" },
  "/settings":      { en: "Settings",      ar: "الإعدادات" },
  "/users":         { en: "Users",         ar: "المستخدمين" },
  "/pos":           { en: "POS",           ar: "نقطة البيع" },
  "/branches":      { en: "Branches",      ar: "الفروع" },
  "/hr":            { en: "HR",            ar: "الموارد البشرية" },
  "/quality":       { en: "Quality",       ar: "الجودة" },
  "/production":    { en: "Production",    ar: "الإنتاج" },
  "/delivery":      { en: "Delivery",      ar: "التوصيل" },
  "/designs":       { en: "Designs",       ar: "التصميمات" },
  "/analytics":     { en: "Analytics",     ar: "التحليلات" },
  "/loyalty":       { en: "Loyalty",       ar: "الولاء" },
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { lang, setLang } = useLanguage();
  const { openBar } = useCommandBar();
  const [location] = useLocation();
  const { user, isAuthenticated, signOut, workspace } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = useUnreadCount();

  const pageLabel = routeLabels[location]
    ?? Object.entries(routeLabels).find(([path]) => path !== "/" && location.startsWith(path + "/"))?.[1]
    ?? { en: "THOTH", ar: "ثوث" };
  const ar = lang === "ar";

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setProfileOpen(false); setNotifOpen(false); }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleSignOut = useCallback(async () => {
    setProfileOpen(false);
    await signOut();
  }, [signOut]);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "user@thoth.app";
  const userInitials = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="h-[56px] shrink-0 flex items-center px-4 gap-3 thoth-glass border-b sticky top-0 z-30">

      {/* ── Left: Hamburger + breadcrumb ── */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button onClick={onMenuClick} aria-label="Menu"
          className="md:hidden w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Menu size={17} strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="thoth-eyebrow hidden sm:inline select-none">THOTH</span>
          <span className="text-border/80 text-xs hidden sm:inline select-none">/</span>
          <h1 className="text-[13px] font-medium text-foreground truncate" style={{ letterSpacing: "-0.01em" }}>
            {ar ? pageLabel.ar : pageLabel.en}
          </h1>
        </div>
      </div>

      {/* ── Center: Search ── */}
      <button onClick={openBar}
        className="hidden md:flex items-center gap-2 flex-1 max-w-[360px] h-8 ps-3 pe-3 rounded-xl border border-border/70 bg-card/80 text-[13px] text-muted-foreground/70 hover:bg-card hover:border-border/90 hover:text-muted-foreground transition-all duration-150 cursor-text select-none">
        <Search size={13} strokeWidth={1.75} className="shrink-0" />
        <span className="flex-1 text-start truncate">{ar ? "ابحث في ثوث..." : "Search THOTH…"}</span>
        <kbd className="shrink-0 hidden lg:inline-flex items-center text-[10px] text-muted-foreground/40 border border-border/50 rounded px-1.5 py-0.5 font-sans">⌘K</kbd>
      </button>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1 text-muted-foreground">
        {/* Mobile search */}
        <button onClick={openBar} aria-label="Search"
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:text-foreground hover:bg-accent transition-colors">
          <Search size={16} strokeWidth={1.75} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button aria-label="Notifications" onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:text-foreground hover:bg-accent transition-colors">
            <Bell size={15} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute top-1 end-1 min-w-[14px] h-[14px] rounded-full bg-primary ring-1 ring-background flex items-center justify-center text-[8px] text-white font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <div className="w-px h-4 bg-border/60 mx-1.5" />

        <ThemeToggle />

        <div className="w-px h-4 bg-border/60 mx-1.5" />

        {/* Language */}
        <button onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="h-7 px-2.5 rounded-md shrink-0 text-[11px] font-medium tracking-wide text-muted-foreground border border-border/60 bg-card/60 hover:text-foreground hover:bg-card hover:border-border transition-all select-none">
          {lang === "en" ? "AR" : "EN"}
        </button>

        <div className="w-px h-4 bg-border/60 mx-1.5" />

        {/* Profile dropdown */}
        {isAuthenticated ? (
          <div className="relative" ref={profileRef}>
            <button onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-accent transition-colors group">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                {userInitials}
              </div>
              <div className="hidden md:flex flex-col items-start min-w-0">
                <span className="text-[11px] font-medium text-foreground truncate max-w-[100px] leading-tight">{userName}</span>
                <span className="text-[9px] text-muted-foreground truncate max-w-[100px] leading-tight">{userEmail}</span>
              </div>
              <ChevronDown size={12} className={`text-muted-foreground/50 transition-transform hidden md:block ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full end-0 mt-2 w-[280px] bg-background rounded-xl border border-border/60 shadow-xl z-50 overflow-hidden"
                >
                  {/* User Header */}
                  <div className="px-4 py-3.5 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[13px] font-bold shrink-0">
                        {userInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">{userName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                            {workspace?.role || "owner"}
                          </span>
                          {workspace?.plan && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium capitalize">
                              {workspace.plan}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="px-2 py-2 border-b border-border/30">
                    <p className="px-2 py-1 text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">{ar ? "سريع" : "Quick"}</p>
                    <Link href="/settings" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <Settings size={13} className="text-muted-foreground" />
                      {ar ? "الإعدادات" : "Settings"}
                    </Link>
                    <Link href="/users" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <Shield size={13} className="text-muted-foreground" />
                      {ar ? "المستخدمين والصلاحيات" : "Users & Access"}
                    </Link>
                    <Link href="/analytics" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <BarChart3 size={13} className="text-muted-foreground" />
                      {ar ? "التحليلات" : "Analytics"}
                    </Link>
                    <Link href="/reports" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <FileText size={13} className="text-muted-foreground" />
                      {ar ? "التقارير" : "Reports"}
                    </Link>
                  </div>

                  {/* Workspace */}
                  <div className="px-2 py-2 border-b border-border/30">
                    <p className="px-2 py-1 text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">{ar ? "المساحة" : "Workspace"}</p>
                    <div className="px-2.5 py-2 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold shrink-0">
                        {workspace?.name?.charAt(0) || "T"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-foreground truncate">{workspace?.name || "THOTH"}</p>
                        <p className="text-[9px] text-muted-foreground">{workspace?.plan || "pro"} plan</p>
                      </div>
                      <ExternalLink size={10} className="text-muted-foreground/40 shrink-0" />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="px-2 py-2 border-b border-border/30">
                    <p className="px-2 py-1 text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">{ar ? "التفضيلات" : "Preferences"}</p>
                    <button onClick={() => { setLang(lang === "en" ? "ar" : "en"); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <Languages size={13} className="text-muted-foreground" />
                      <span className="flex-1 text-start">{ar ? "اللغة" : "Language"}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{lang === "en" ? "English" : "العربية"}</span>
                    </button>
                    <button onClick={() => openBar()}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <Keyboard size={13} className="text-muted-foreground" />
                      <span className="flex-1 text-start">{ar ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}</span>
                      <kbd className="text-[9px] text-muted-foreground/50 border border-border/40 rounded px-1 py-0.5">⌘K</kbd>
                    </button>
                  </div>

                  {/* Help & Support */}
                  <div className="px-2 py-2 border-b border-border/30">
                    <a href="https://thoth.app/help" target="_blank" rel="noopener"
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <HelpCircle size={13} className="text-muted-foreground" />
                      <span className="flex-1 text-start">{ar ? "المساعدة والدعم" : "Help & Support"}</span>
                      <ExternalLink size={10} className="text-muted-foreground/40" />
                    </a>
                    <a href="https://thoth.app/docs" target="_blank" rel="noopener"
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <BookOpen size={13} className="text-muted-foreground" />
                      <span className="flex-1 text-start">{ar ? "التوثيق" : "Documentation"}</span>
                      <ExternalLink size={10} className="text-muted-foreground/40" />
                    </a>
                    <a href="https://thoth.app/changelog" target="_blank" rel="noopener"
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/50 transition-colors">
                      <Zap size={13} className="text-muted-foreground" />
                      <span className="flex-1 text-start">{ar ? "سجل التحديثات" : "What's New"}</span>
                    </a>
                  </div>

                  {/* Sign Out */}
                  <div className="px-2 py-2">
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-rose-500 hover:bg-rose-50 transition-colors">
                      <LogOut size={13} />
                      {ar ? "تسجيل الخروج" : "Sign Out"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button onClick={() => setAuthOpen(true)}
            className="h-7 px-3 rounded-lg text-[11.5px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <LogIn size={12} strokeWidth={2} />
            {ar ? "دخول" : "Sign in"}
          </button>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
