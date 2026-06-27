import { Link, useLocation } from "wouter";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  Activity,
  Users,
  Building2,
  Briefcase,
  ShoppingBag,
  Wrench,
  Archive,
  Landmark,
  BookOpen,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Brain,
  Target,
  TrendingUp,
  Shield,
  Calendar,
  Star,
  Radio,
  Map,
  Database,
  UserPlus,
  ShoppingCart,
  BarChart3,
  FileText,
  Layers,
  ClipboardCheck,
  MapPin,
  PenTool,
  Factory,
  ShieldCheck,
  Truck,
  Gift,
  Megaphone,
  Ticket,
  Award,
  GitMerge,
  Bell,
  CreditCard,
  Heart,
  Receipt,
  DollarSign,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { isDemoMode } from "../lib/supabase";
import { useState, useEffect } from "react";
import { getRecentPages, getRouteLabel, trackPageVisit } from "./Breadcrumbs";

// ─── Nav structure ────────────────────────────────────────

const EXEC_NAV = [
  { id: "dashboard", icon: Radio,       labelEn: "Sky Eye",      labelAr: "عين السماء",    path: "/" },
  { id: "queue",     icon: Target,      labelEn: "Work Queue",   labelAr: "أوامر التشغيل", path: "/queue" },
  { id: "forecast",  icon: TrendingUp,  labelEn: "Forecast",     labelAr: "التوقعات",      path: "/forecast" },
  { id: "risk",      icon: Shield,      labelEn: "Alerts",       labelAr: "تنبيهات مهمة",  path: "/risk" },
  { id: "rhythms",   icon: Calendar,    labelEn: "Rhythms",      labelAr: "الإيقاعات",     path: "/rhythms" },
  { id: "exec",      icon: Star,        labelEn: "Executive",    labelAr: "التنفيذي",      path: "/exec" },
] as const;

const CORE_NAV = [
  { id: "today",         icon: LayoutDashboard, labelEn: "Today",        labelAr: "اليوم",           path: "/today" },
  { id: "activity",      icon: Activity,        labelEn: "Activity",     labelAr: "النشاط",          path: "/activity" },
  { id: "organizations", icon: Building2,       labelEn: "Customers",    labelAr: "العملاء",         path: "/organizations" },
  { id: "people",        icon: Users,           labelEn: "Contacts",     labelAr: "جهات الاتصال",    path: "/people" },
  { id: "products",      icon: Layers,          labelEn: "Garments",     labelAr: "الملابس",        path: "/products" },
  { id: "designs",       icon: PenTool,         labelEn: "Designs",      labelAr: "التصميمات",       path: "/designs" },
  { id: "inventory",     icon: Archive,         labelEn: "Fabrics",      labelAr: "الأقمشة",        path: "/inventory" },
  { id: "production",    icon: Factory,         labelEn: "Production",   labelAr: "الإنتاج",        path: "/production" },
  { id: "prod-exec",     icon: BarChart3,       labelEn: "Prod Overview", labelAr: "نظرة الإنتاج",   path: "/production/exec" },
  { id: "quality",       icon: ShieldCheck,     labelEn: "Quality",      labelAr: "الجودة",          path: "/quality" },
  { id: "quotations",    icon: FileText,        labelEn: "Quotations",   labelAr: "عروض الأسعار",    path: "/quotations" },
  { id: "orders",        icon: ClipboardCheck,  labelEn: "Orders",       labelAr: "الطلبات",        path: "/orders" },
  { id: "site-visits",   icon: MapPin,          labelEn: "Consultations", labelAr: "الاستشارات",       path: "/site-visits" },
  { id: "delivery",      icon: Truck,           labelEn: "Delivery",     labelAr: "التسليم",        path: "/delivery" },
  { id: "pos",           icon: CreditCard,      labelEn: "POS",           labelAr: "نقطة البيع",      path: "/pos" },
  { id: "branches",      icon: Building2,       labelEn: "Branches",     labelAr: "الفروع",        path: "/branches" },
  { id: "crm",           icon: Heart,           labelEn: "CRM",           labelAr: "إدارة العملاء",   path: "/crm" },
  { id: "crm-customers", icon: Users,           labelEn: "Customers",    labelAr: "العملاء",        path: "/crm/customers" },
  { id: "crm-pipeline",  icon: Target,          labelEn: "Pipeline",     labelAr: "الصفقات",        path: "/crm/pipeline" },
  { id: "studio",        icon: BookOpen,        labelEn: "Studio",       labelAr: "الاستوديو",      path: "/studio" },
  { id: "sales",         icon: ShoppingBag,     labelEn: "Sales",        labelAr: "المبيعات",        path: "/sales" },
  { id: "work",          icon: Briefcase,       labelEn: "Work",         labelAr: "المهام",          path: "/work" },
  { id: "purchasing",    icon: ShoppingCart,     labelEn: "Purchasing",   labelAr: "المشتريات",       path: "/purchasing" },
  { id: "finance",        icon: Landmark,        labelEn: "Finance",        labelAr: "المالية",         path: "/finance" },
  { id: "fin-dashboard",  icon: LayoutDashboard, labelEn: "Fin Dashboard",  labelAr: "لوحة المالية",   path: "/finance/dashboard" },
  { id: "fin-invoices",   icon: FileText,        labelEn: "Invoices",       labelAr: "الفواتير",       path: "/finance/invoices" },
  { id: "fin-expenses",   icon: Receipt,         labelEn: "Expenses",       labelAr: "المصروفات",      path: "/finance/expenses" },
  { id: "fin-reports",    icon: BarChart3,       labelEn: "Reports",        labelAr: "التقارير",       path: "/finance/reports" },
  { id: "fin-bank",       icon: Landmark,        labelEn: "Bank & Accounts", labelAr: "الحسابات البنكية", path: "/finance/bank" },
  { id: "fin-arap",       icon: DollarSign,      labelEn: "Receivable/Payable", labelAr: "المدينة والدائن", path: "/finance/ar-ap" },
  { id: "hr",              icon: Users,           labelEn: "HR",           labelAr: "الموارد البشرية", path: "/hr" },
  { id: "hr-dashboard",    icon: LayoutDashboard, labelEn: "HR Dashboard", labelAr: "لوحة الموارد",   path: "/hr/dashboard" },
  { id: "hr-employees",    icon: Users,           labelEn: "Employees",    labelAr: "الموظفين",        path: "/hr/employees" },
  { id: "hr-recruitment",  icon: Briefcase,       labelEn: "Recruitment",  labelAr: "التوظيف",        path: "/hr/recruitment" },
  { id: "hr-compensation", icon: CreditCard,      labelEn: "Compensation", labelAr: "الرواتب والمزايا", path: "/hr/compensation" },
  { id: "hr-training",     icon: Award,           labelEn: "Training",     labelAr: "التدريب والتطوير", path: "/hr/training" },
  { id: "hr-performance",  icon: TrendingUp,      labelEn: "Performance",  labelAr: "تقييم الأداء",   path: "/hr/performance" },
  { id: "hr-relations",    icon: Heart,           labelEn: "Relations",    labelAr: "علاقات العمل",   path: "/hr/relations" },
  { id: "hr-compliance",   icon: Shield,          labelEn: "Compliance",   labelAr: "الامتثال",       path: "/hr/compliance" },
  { id: "hr-analytics",    icon: BarChart3,       labelEn: "Analytics",    labelAr: "التحليلات",       path: "/hr/analytics" },
  { id: "hr-payroll",      icon: DollarSign,      labelEn: "Payroll",      labelAr: "الرواتب",        path: "/hr/payroll" },
  { id: "hr-org",          icon: Building2,       labelEn: "Org Structure", labelAr: "هيكل المؤسسة",  path: "/hr/org" },
  { id: "team",          icon: UserPlus,        labelEn: "Team",         labelAr: "الفريق",          path: "/team" },
  { id: "operations",    icon: Wrench,          labelEn: "Operations",   labelAr: "العمليات",        path: "/operations" },
  { id: "analytics",     icon: BarChart3,       labelEn: "Analytics",    labelAr: "التحليلات",       path: "/analytics" },
  { id: "reports",       icon: BarChart3,       labelEn: "Reports",      labelAr: "التقارير",        path: "/reports" },
  { id: "tools",         icon: Wrench,          labelEn: "Tools",        labelAr: "أدوات متقدمة",  path: "/tools" },
  { id: "users",         icon: Shield,          labelEn: "Users",        labelAr: "المستخدمين",     path: "/users" },
  { id: "mobile-apps",   icon: Smartphone,      labelEn: "Mobile Apps",  labelAr: "تطبيقات محمولة",  path: "/mobile-apps" },
] as const;

// Map nav item IDs to the module keys chosen at onboarding.
// Items NOT in this map are always visible (foundational: today, activity,
// customers, contacts, branches, team, users). Everything mapped here only
// shows when its module was selected — so the sidebar reflects the user's setup.
const NAV_MODULE_MAP: Record<string, string> = {
  // Sell
  sales: "sales", quotations: "sales", orders: "sales", crm: "sales",
  "crm-customers": "sales", "crm-pipeline": "sales", pos: "pos",
  // Make
  production: "production", "prod-exec": "production", work: "production",
  operations: "production", quality: "quality",
  // Design
  designs: "design", studio: "design",
  // Stock
  products: "inventory", inventory: "inventory", purchasing: "purchasing",
  // Deliver
  delivery: "delivery", "site-visits": "delivery",
  // Money
  finance: "finance", "fin-dashboard": "finance", "fin-invoices": "finance",
  "fin-expenses": "finance", "fin-reports": "finance", "fin-bank": "finance",
  "fin-arap": "finance",
  // People
  hr: "hr", "hr-dashboard": "hr", "hr-employees": "hr", "hr-recruitment": "hr",
  "hr-compensation": "hr", "hr-training": "hr", "hr-performance": "hr",
  "hr-relations": "hr", "hr-compliance": "hr", "hr-analytics": "hr",
  "hr-payroll": "hr", "hr-org": "hr",
  // Grow
  analytics: "analytics", reports: "analytics",
};

const LOYALTY_NAV = [
  { id: "loyalty",         icon: Gift,         labelEn: "Loyalty",       labelAr: "الولاء",           path: "/loyalty" },
  { id: "loyalty-lookup",  icon: Users,        labelEn: "Staff Lookup",  labelAr: "بحث العملاء",     path: "/loyalty/lookup" },
  { id: "loyalty-tx",      icon: BarChart3,    labelEn: "Transactions",  labelAr: "المعاملات",        path: "/loyalty/transactions" },
  { id: "loyalty-rules",      icon: Layers,       labelEn: "Rules",         labelAr: "القواعد",          path: "/loyalty/rules" },
  { id: "loyalty-redemptions",icon: Ticket,      labelEn: "Redemptions",   labelAr: "الاستبدال",        path: "/loyalty/redemptions" },
  { id: "loyalty-campaigns", icon: Megaphone,    labelEn: "Campaigns",     labelAr: "الحملات",          path: "/loyalty/campaigns" },
  { id: "loyalty-rewards",  icon: Award,        labelEn: "Rewards",       labelAr: "المكافآت",         path: "/loyalty/rewards" },
  { id: "loyalty-analytics",icon: TrendingUp,   labelEn: "Analytics",     labelAr: "التحليلات",        path: "/loyalty/analytics" },
  { id: "loyalty-merge",    icon: GitMerge,     labelEn: "Merge",         labelAr: "الدمج",            path: "/loyalty/merge" },
  { id: "loyalty-notify",   icon: Bell,         labelEn: "Notifications", labelAr: "الإشعارات",        path: "/loyalty/notifications" },
  { id: "loyalty-shopify",   icon: ShoppingCart,  labelEn: "Shopify",       labelAr: "شوبيفاي",          path: "/loyalty/shopify" },
  { id: "loyalty-settings",  icon: Settings,     labelEn: "Settings",      labelAr: "الإعدادات",        path: "/loyalty/settings" },
] as const;

const INTEL_NAV = [
  { id: "intelligence", icon: Sparkles, labelEn: "Intelligence", labelAr: "الذكاء",    path: "/intelligence" },
  { id: "memory",       icon: Brain,    labelEn: "Memory",       labelAr: "الذاكرة",   path: "/memory" },
  { id: "decisions",    icon: Target,   labelEn: "Decisions",    labelAr: "القرارات",  path: "/decisions" },
] as const;

// ─── THOTH symbol ─────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ─── Props ────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

// ─── Nav item ─────────────────────────────────────────────

interface NavItemProps {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, path, isActive, collapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={path}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2.5 px-3 py-2 rounded-lg
        transition-all duration-150 select-none
        ${collapsed ? "justify-center" : ""}
        ${isActive
          ? "thoth-primary-selected text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        }
      `}
    >
      <Icon
        size={15}
        strokeWidth={isActive ? 2 : 1.75}
        className="shrink-0"
      />
      {!collapsed && (
        <span className="text-[13px] leading-none truncate">{label}</span>
      )}
      {/* Collapsed tooltip */}
      {collapsed && (
        <div className="
          pointer-events-none absolute start-full ms-2.5 z-50
          px-2.5 py-1.5 rounded-lg
          bg-popover border border-border text-foreground shadow-md
          text-[12px] whitespace-nowrap
          opacity-0 group-hover:opacity-100
          translate-x-0 transition-opacity duration-150
        ">
          {label}
        </div>
      )}
    </Link>
  );
}

// ─── Section label ────────────────────────────────────────

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div className="my-1 border-t border-border/30 mx-1" />;
  }
  return (
    <p className="px-3 pt-3 pb-1 text-[9px] text-muted-foreground/40 tracking-[0.1em] uppercase font-medium">
      {label}
    </p>
  );
}

// ─── Sidebar content ──────────────────────────────────────

function SidebarContent({
  collapsed,
  setCollapsed,
  onNavClick,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onNavClick?: () => void;
}) {
  const { lang, isRtl } = useLanguage();
  const { onboardingData } = useOnboarding();
  const { workspace } = useAuth();
  const [location] = useLocation();

  const wsSettings = workspace?.settings as Record<string, unknown> | undefined;
  // Modules the user enabled at onboarding. In demo mode the workspace is a
  // synthetic default (all modules on), so the user's onboarding choice wins;
  // in live mode the workspace settings are authoritative.
  const wsModules = wsSettings?.enabled_modules as string[] | undefined;
  const enabledModules = isDemoMode
    ? (onboardingData?.enabled_modules ?? wsModules)
    : (wsModules ?? onboardingData?.enabled_modules);
  const companyName = (wsSettings?.company_name as string) || onboardingData?.companyName || workspace?.name || "THOTH";
  const industry = (wsSettings?.industry as string) || onboardingData?.industry || "";
  const country = (wsSettings?.country as string) || "";
  const city = (wsSettings?.city as string) || "";
  const locationLabel = [city, country].filter(Boolean).join(", ") || industry;
  const initials = getInitials(companyName);

  // Track page visits for recently visited
  const [recentPages, setRecentPages] = useState<string[]>([]);
  useEffect(() => {
    if (location && location !== "/") {
      trackPageVisit(location);
    }
    setRecentPages(getRecentPages().filter(p => p !== location).slice(0, 4));
  }, [location]);

  function isActive(path: string) {
    return path === "/" ? location === "/" : location.startsWith(path);
  }

  return (
    <div className="flex flex-col h-full thoth-glass relative">

      {/* Logo row */}
      <div className="h-[56px] flex items-center px-4 shrink-0 overflow-hidden">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Logo variant="mark" size={22} />
          {!collapsed && (
            <Logo variant="wordmark" size={15} />
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="
              hidden md:flex w-6 h-6 rounded-md shrink-0
              items-center justify-center
              text-muted-foreground hover:text-foreground hover:bg-sidebar-accent
              transition-colors duration-150
            "
          >
            {isRtl ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">

        {/* Executive OS */}
        <SectionLabel label={lang === "ar" ? "لوحة التحكم" : "Executive OS"} collapsed={collapsed} />
        {EXEC_NAV.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={lang === "ar" ? item.labelAr : item.labelEn}
            path={item.path}
            isActive={isActive(item.path)}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}

        {/* Core — filtered by enabled modules */}
        <SectionLabel label={lang === "ar" ? "الأساسي" : "Core"} collapsed={collapsed} />
        {CORE_NAV.filter((item) => {
          const moduleKey = NAV_MODULE_MAP[item.id];
          if (!moduleKey) return true; // always visible (foundational)
          if (!enabledModules) return true; // no filtering if not configured
          return enabledModules.includes(moduleKey);
        }).map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={lang === "ar" ? item.labelAr : item.labelEn}
            path={item.path}
            isActive={isActive(item.path)}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}

        {/* Loyalty — only when the module is enabled */}
        {(!enabledModules || enabledModules.includes("loyalty")) && (
          <>
            <SectionLabel label={lang === "ar" ? "الولاء" : "Loyalty"} collapsed={collapsed} />
            {LOYALTY_NAV.map((item) => (
              <NavItem
                key={item.id}
                id={item.id}
                icon={item.icon}
                label={lang === "ar" ? item.labelAr : item.labelEn}
                path={item.path}
                isActive={isActive(item.path)}
                collapsed={collapsed}
                onClick={onNavClick}
              />
            ))}
          </>
        )}

        {/* Intelligence */}
        <SectionLabel label={lang === "ar" ? "الذكاء" : "Intelligence"} collapsed={collapsed} />
        {INTEL_NAV.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={lang === "ar" ? item.labelAr : item.labelEn}
            path={item.path}
            isActive={isActive(item.path)}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}

        {/* Recently Visited */}
        {!collapsed && recentPages.length > 0 && (
          <>
            <SectionLabel label={lang === "ar" ? "الأخيرة" : "Recent"} collapsed={collapsed} />
            {recentPages.map(path => {
              const label = getRouteLabel(path, lang);
              // Find matching icon from nav items
              const allNav = [...EXEC_NAV, ...CORE_NAV, ...LOYALTY_NAV, ...INTEL_NAV];
              const navItem = allNav.find(n => n.path === path);
              const Icon = navItem?.icon || Activity;
              return (
                <NavItem
                  key={`recent-${path}`}
                  id={`recent-${path}`}
                  icon={Icon}
                  label={label}
                  path={path}
                  isActive={isActive(path)}
                  collapsed={collapsed}
                  onClick={onNavClick}
                />
              );
            })}
          </>
        )}

        <div className="my-2 border-t border-border/40 mx-1" />

        <NavItem
          id="data"
          icon={Database}
          label={lang === "ar" ? "إدارة البيانات" : "Data"}
          path="/data"
          isActive={location === "/data"}
          collapsed={collapsed}
          onClick={onNavClick}
        />
        <NavItem
          id="roadmap"
          icon={Map}
          label={lang === "ar" ? "خارطة الطريق" : "Roadmap"}
          path="/roadmap"
          isActive={location === "/roadmap"}
          collapsed={collapsed}
          onClick={onNavClick}
        />
        <NavItem
          id="settings"
          icon={Settings}
          label={lang === "ar" ? "الإعدادات" : "Settings"}
          path="/settings"
          isActive={location === "/settings"}
          collapsed={collapsed}
          onClick={onNavClick}
        />
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="
            hidden md:flex mx-auto mb-2 w-7 h-7 rounded-lg
            items-center justify-center
            text-muted-foreground hover:text-foreground hover:bg-sidebar-accent
            transition-colors duration-150
          "
        >
          {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>
      )}

      {/* User / company area */}
      <div className="p-3 border-t border-border/40 shrink-0 flex items-center gap-2.5 overflow-hidden">
        <div
          className="
            w-8 h-8 rounded-lg shrink-0
            bg-primary/10 text-primary
            flex items-center justify-center
            text-[10px] font-semibold tracking-wide select-none
          "
          aria-label={companyName}
        >
          {initials}
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-[12.5px] font-medium text-foreground truncate leading-tight">
              {companyName}
            </span>
            {locationLabel && (
              <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                {locationLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (always visible, collapsible) ── */}
      <aside
        className={`
          hidden md:block h-full shrink-0
          border-e border-sidebar-border/60
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[60px]" : "w-[220px]"}
        `}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </aside>

      {/* ── Mobile sidebar (drawer overlay) ── */}
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]
          md:hidden
          transition-opacity duration-200
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`
          fixed top-0 start-0 bottom-0 z-50
          w-[260px]
          md:hidden
          transition-transform duration-300 ease-in-out
          border-e border-sidebar-border/60
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ direction: "inherit" }}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="
            absolute top-4 end-4 z-10
            w-7 h-7 rounded-lg
            flex items-center justify-center
            text-muted-foreground hover:text-foreground hover:bg-sidebar-accent
            transition-colors
          "
        >
          <X size={15} />
        </button>

        <SidebarContent
          collapsed={false}
          setCollapsed={() => {}}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}
