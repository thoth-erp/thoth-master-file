/**
 * WorkspaceSetup — Premium Admin Onboarding
 * إعداد المشغل — تجربة انضمام متكاملة
 *
 * Flow:
 * 0. Welcome to THOTH Fashion
 * 1. Business Discovery — what describes your fashion business
 * 2. Company Size — team size & structure
 * 3. Pain Points — multi-select problems (Select All)
 * 4. Smart Module Builder — recommended modules (Select All)
 * 5. Production Flow — interactive production stages (Select All)
 * 6. Branches — setup business locations
 * 7. Team Setup — invite team members & assign roles
 * 8. POS Setup — registers & payment methods
 * 9. Settings — currency, language, tax rate
 * 10. Company Details — name, logo, phone, address
 * 11. Launch THOTH Fashion
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getSupabaseClient, isDemoMode } from "../lib/supabase";
import { ROLE_TEMPLATES } from "../lib/permissions";
import {
  Loader2, ChevronRight, ChevronLeft, Check, Sparkles,
  ArrowRight, Rocket, Factory, AlertCircle,
  Scissors, Cpu, Layers, Box, Paintbrush, Clock, ClipboardCheck, Package, Truck, Home, Wrench,
  Users, Building2, ShoppingCart, BarChart3, DollarSign, Archive,
  PenTool, Hammer, MapPin, Plus, X, Trash2, CreditCard, Smartphone,
  Zap, Target, Shield, Activity, Star, Crown, Globe, Languages,
  Banknote, Receipt, Settings, Briefcase, UserPlus, Send,
  Eye, EyeOff, ToggleRight, ToggleLeft, Store, Tag, Gift,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES & DATA
// ═══════════════════════════════════════════════════════════

interface OnboardingState {
  businessType: string;
  companySize: string;
  painPoints: string[];
  enabledModules: string[];
  productionStages: string[];
  branches: BranchSetup[];
  teamMembers: TeamMemberSetup[];
  posRegisters: POSSetup[];
  currency: string;
  language: string;
  taxRate: string;
  companyName: string;
  phone: string;
  address: string;
  country: string;
  city: string;
}

interface BranchSetup {
  name: string;
  type: string;
  address: string;
}

interface TeamMemberSetup {
  name: string;
  email: string;
  role: string;
  department: string;
}

interface POSSetup {
  name: string;
  branchIndex: number;
  floatAmount: string;
}

const INITIAL: OnboardingState = {
  businessType: "", companySize: "", painPoints: [], enabledModules: [],
  productionStages: [], branches: [{ name: "", type: "showroom", address: "" }],
  teamMembers: [], posRegisters: [], currency: "EGP", language: "en",
  taxRate: "15", companyName: "", phone: "", address: "", country: "", city: "",
};

// Business types
const BUSINESS_TYPES = [
  { id: "fashion_brand", en: "Fashion Brand", ar: "براند أزياء", icon: Sparkles, color: "#8C6FAE", gradient: "from-violet-500 to-purple-600" },
  { id: "garment_factory", en: "Garment Factory", ar: "مصنع ملابس", icon: Factory, color: "#10B981", gradient: "from-emerald-500 to-teal-600" },
  { id: "haute_couture", en: "Haute Couture", ar: "أزياء عليا", icon: Crown, color: "#F43F5E", gradient: "from-rose-500 to-pink-600" },
  { id: "retail_brand", en: "Fashion Retail", ar: "تجزئة أزياء", icon: ShoppingCart, color: "#3B82F6", gradient: "from-blue-500 to-indigo-600" },
  { id: "textile", en: "Textile & Fabrics", ar: "أقمشة ونسيج", icon: Layers, color: "#F59E0B", gradient: "from-yellow-500 to-amber-600" },
  { id: "accessories", en: "Accessories & Leather", ar: "إكسسوارات وجلد", icon: Star, color: "#0EA5E9", gradient: "from-sky-500 to-blue-600" },
  { id: "bridal", en: "Bridal & Evening", ar: "فساتين أعراس وسهرة", icon: Gift, color: "#EC4899", gradient: "from-pink-500 to-rose-600" },
  { id: "other", en: "Other", ar: "أخرى", icon: Box, color: "#64748B", gradient: "from-slate-500 to-zinc-600" },
];

// Company sizes
const SIZES = [
  { id: "solo", en: "Only me", ar: "أنا بس", icon: UserPlus, sub: "Solo founder", subAr: "مؤسس واحد" },
  { id: "small", en: "2–10 employees", ar: "٢–١٠ موظفين", icon: Users, sub: "Small team", subAr: "فريق صغير" },
  { id: "medium", en: "10–50 employees", ar: "١٠–٥٠ موظف", icon: Building2, sub: "Growing business", subAr: "بيكبر" },
  { id: "large", en: "50–100 employees", ar: "٥٠–١٠٠ موظف", icon: Factory, sub: "Established factory", subAr: "مصنع مستقر" },
  { id: "enterprise", en: "100+ employees", ar: "١٠٠+ موظف", icon: Crown, sub: "Enterprise operation", subAr: "عملية مؤسسية" },
];

// Pain points
const PAIN_POINTS = [
  { id: "inventory", en: "Inventory & Stock", ar: "إدارة المخزن", icon: Archive, color: "#F59E0B" },
  { id: "production", en: "Production Tracking", ar: "متابعة الإنتاج", icon: Factory, color: "#F97316" },
  { id: "costing", en: "Costing & Pricing", ar: "التكاليف والأسعار", icon: DollarSign, color: "#10B981" },
  { id: "finance", en: "Finance & Payments", ar: "الحسابات والفلوس", icon: Banknote, color: "#8B5CF6" },
  { id: "purchasing", en: "Purchasing & Suppliers", ar: "المشتريات والموردين", icon: ShoppingCart, color: "#3B82F6" },
  { id: "customers", en: "Customer Management", ar: "إدارة العملاء", icon: Users, color: "#06B6D4" },
  { id: "sales", en: "Sales & Quotations", ar: "المبيعات والعروض", icon: Target, color: "#EC4899" },
  { id: "delivery", en: "Delivery & Installation", ar: "التوصيل والتركيب", icon: Truck, color: "#2563EB" },
  { id: "hr", en: "HR & Workforce", ar: "الموارد البشرية", icon: Briefcase, color: "#7C3AED" },
  { id: "analytics", en: "Analytics & Reports", ar: "التحليلات والتقارير", icon: BarChart3, color: "#0EA5E9" },
  { id: "quality", en: "Quality Control", ar: "مراقبة الجودة", icon: Shield, color: "#059669" },
  { id: "pos", en: "Point of Sale", ar: "نقطة البيع", icon: CreditCard, color: "#D946EF" },
  { id: "loyalty", en: "Loyalty Program", ar: "برنامج الولاء", icon: Gift, color: "#14B8A6" },
  { id: "multi_branch", en: "Multi-Branch", ar: "فروع متعددة", icon: MapPin, color: "#EA580C" },
  { id: "scheduling", en: "Scheduling & Planning", ar: "التخطيط والجداول", icon: Clock, color: "#8B5CF6" },
  { id: "design", en: "Design Management", ar: "إدارة التصميمات", icon: PenTool, color: "#E07A5F" },
];

// Modules
const MODULES = [
  { id: "production", en: "Production", ar: "الإنتاج", icon: Factory, color: "#F97316",
    desc: "Track manufacturing stages, assignments, and progress", descAr: "تتبع مراحل التصنيع والتعيينات والتقدم",
    impact: "40% fewer delays", impactAr: "٤٠٪ تأخيرات أقل" },
  { id: "inventory", en: "Inventory", ar: "المخزن", icon: Archive, color: "#F59E0B",
    desc: "Real-time stock levels, reorder alerts, warehouse tracking", descAr: "كميات فورية، تنبيهات إعادة طلب، تتبع المخزن",
    impact: "25% less waste", impactAr: "٢٥٪ هدر أقل" },
  { id: "purchasing", en: "Purchasing", ar: "المشتريات", icon: ShoppingCart, color: "#3B82F6",
    desc: "Purchase orders, vendor management, approval flow", descAr: "أوامر شراء، إدارة موردين، سير موافقات",
    impact: "30% faster procurement", impactAr: "٣٠٪ مشتريات أسرع" },
  { id: "finance", en: "Finance", ar: "الحسابات", icon: DollarSign, color: "#10B981",
    desc: "Invoicing, payments, expenses, cash flow", descAr: "فواتير، مدفوعات، مصاريف، تدفق نقدي",
    impact: "Real-time cash visibility", impactAr: "رؤية فورية للنقد" },
  { id: "analytics", en: "Analytics", ar: "التحليلات", icon: BarChart3, color: "#8B5CF6",
    desc: "Executive dashboard, KPIs, smart insights", descAr: "لوحة تنفيذية، مؤشرات، تحليلات ذكية",
    impact: "Data-driven decisions", impactAr: "قرارات مبنية على بيانات" },
  { id: "delivery", en: "Delivery", ar: "التوصيل", icon: Truck, color: "#2563EB",
    desc: "Delivery scheduling, installation tracking", descAr: "جدولة التوصيل، متابعة التركيب",
    impact: "On-time delivery", impactAr: "تسليم في الموعد" },
  { id: "hr", en: "HR & Team", ar: "الموارد البشرية", icon: Users, color: "#7C3AED",
    desc: "Employee management, attendance, departments", descAr: "إدارة الموظفين، الحضور، الأقسام",
    impact: "Better team management", impactAr: "إدارة أفضل للفريق" },
  { id: "quality", en: "Quality Control", ar: "مراقبة الجودة", icon: Shield, color: "#059669",
    desc: "QC checkpoints, inspections, standards", descAr: "نقاط فحص الجودة، معايير",
    impact: "Fewer defects", impactAr: "عيوب أقل" },
  { id: "pos", en: "Point of Sale", ar: "نقطة البيع", icon: CreditCard, color: "#D946EF",
    desc: "Multi-register POS, payment processing, receipts", descAr: "نقطة بيع متعددة، معالجة مدفوعات، إيصالات",
    impact: "Fast checkout", impactAr: "خروج سريع" },
  { id: "loyalty", en: "Loyalty Program", ar: "برنامج الولاء", icon: Gift, color: "#14B8A6",
    desc: "Customer loyalty points, rewards, campaigns", descAr: "نقاط ولاء العملاء، مكافآت، حملات",
    impact: "35% repeat customers", impactAr: "٣٥٪ عائدون" },
  { id: "design", en: "Design Studio", ar: "ستوديو التصميم", icon: PenTool, color: "#E07A5F",
    desc: "Design briefs, measurements, file management", descAr: "بريفات التصميم، مقاسات، إدارة ملفات",
    impact: "Streamlined design", impactAr: "تصميم مُبسّط" },
  { id: "quotations", en: "Quotations", ar: "عروض الأسعار", icon: Receipt, color: "#06B6D4",
    desc: "Create, send, convert quotations to orders", descAr: "إنشاء وإرسال وتحويل عروض الأسعار",
    impact: "Faster closing", impactAr: "إغلاق أسرع" },
];

// Production stages (fashion-focused)
const PROD_STAGES = [
  { id: "pattern_making", en: "Pattern Making", ar: "عمل أنماط", icon: PenTool, color: "#E07A5F" },
  { id: "cutting", en: "Cutting", ar: "تقطيع", icon: Scissors, color: "#3B82F6" },
  { id: "sewing", en: "Sewing", ar: "خياطة", icon: Hammer, color: "#F59E0B" },
  { id: "embroidery", en: "Embroidery", ar: "تطريز", icon: Star, color: "#EC4899" },
  { id: "finishing", en: "Finishing", ar: "تشطيب", icon: Paintbrush, color: "#F97316" },
  { id: "pressing", en: "Pressing", ar: "كوي", icon: Box, color: "#8B5CF6" },
  { id: "quality_check", en: "Quality Check", ar: "فحص الجودة", icon: ClipboardCheck, color: "#10B981" },
  { id: "packaging", en: "Packaging", ar: "تغليف", icon: Package, color: "#14B8A6" },
  { id: "shipping", en: "Shipping", ar: "شحن", icon: Truck, color: "#2563EB" },
];

// Branch types
const BRANCH_TYPES = [
  { id: "showroom", en: "Showroom", ar: "معرض" },
  { id: "factory", en: "Factory", ar: "مصنع" },
  { id: "warehouse", en: "Warehouse", ar: "مخزن" },
  { id: "retail", en: "Retail Store", ar: "متجر تجزئة" },
  { id: "office", en: "Office", ar: "مكتب" },
];

// Countries
const COUNTRIES = [
  { en: "Egypt", ar: "مصر" }, { en: "Saudi Arabia", ar: "السعودية" }, { en: "UAE", ar: "الإمارات" },
  { en: "Kuwait", ar: "الكويت" }, { en: "Qatar", ar: "قطر" }, { en: "Bahrain", ar: "البحرين" },
  { en: "Oman", ar: "عمان" }, { en: "Jordan", ar: "الأردن" }, { en: "Iraq", ar: "العراق" },
  { en: "Lebanon", ar: "لبنان" }, { en: "Morocco", ar: "المغرب" }, { en: "Tunisia", ar: "تونس" },
  { en: "Libya", ar: "ليبيا" }, { en: "Sudan", ar: "السودان" }, { en: "Other", ar: "أخرى" },
];

const CURRENCIES = [
  { id: "EGP", en: "Egyptian Pound (EGP)", ar: "جنيه مصري", symbol: "ج.م" },
  { id: "SAR", en: "Saudi Riyal (SAR)", ar: "ريال سعودي", symbol: "ر.س" },
  { id: "AED", en: "UAE Dirham (AED)", ar: "درهم إماراتي", symbol: "د.إ" },
  { id: "KWD", en: "Kuwaiti Dinar (KWD)", ar: "دينار كويتي", symbol: "د.ك" },
  { id: "QAR", en: "Qatari Riyal (QAR)", ar: "ريال قطري", symbol: "ر.ق" },
  { id: "BHD", en: "Bahraini Dinar (BHD)", ar: "دينار بحريني", symbol: "د.ب" },
  { id: "USD", en: "US Dollar (USD)", ar: "دولار أمريكي", symbol: "$" },
];

// Module recommendation engine
function recommendModules(state: OnboardingState): string[] {
  const mods = new Set<string>(["production"]);
  const pp = state.painPoints;
  if (pp.includes("inventory") || pp.includes("production")) mods.add("inventory");
  if (pp.includes("purchasing") || pp.includes("inventory")) mods.add("purchasing");
  if (pp.includes("costing") || pp.includes("finance")) mods.add("finance");
  if (pp.includes("analytics") || pp.includes("costing")) mods.add("analytics");
  if (pp.includes("delivery")) mods.add("delivery");
  if (pp.includes("hr")) mods.add("hr");
  if (pp.includes("production") || pp.includes("quality")) mods.add("quality");
  if (pp.includes("customers") || pp.includes("sales")) { mods.add("quotations"); mods.add("analytics"); }
  if (pp.includes("pos")) mods.add("pos");
  if (pp.includes("loyalty")) mods.add("loyalty");
  if (pp.includes("design")) mods.add("design");
  if (pp.includes("multi_branch")) { mods.add("pos"); mods.add("hr"); }
  if (state.companySize === "large" || state.companySize === "enterprise") {
    mods.add("analytics"); mods.add("hr"); mods.add("finance"); mods.add("quality");
  }
  return Array.from(mods);
}

const TOTAL_STEPS = 12;

// ═══════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════

const pageV: Variants = {
  enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.97, transition: { duration: 0.25 } }),
};

const cardV: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeV: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ═══════════════════════════════════════════════════════════
// STEP PROGRESS
// ═══════════════════════════════════════════════════════════

function StepProgress({ step, ar }: { step: number; ar: boolean }) {
  const labels = ar
    ? ["ترحيب", "نوع العمل", "الحجم", "المشاكل", "الأدوار", "الإنتاج", "الفروع", "الفريق", "الكاشير", "الإعدادات", "البيانات", "إطلاق"]
    : ["Welcome", "Business", "Size", "Problems", "Modules", "Production", "Branches", "Team", "POS", "Settings", "Details", "Launch"];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-muted-foreground/60 font-medium">
          {ar ? `${step + 1} من ${TOTAL_STEPS}` : `${step + 1} of ${TOTAL_STEPS}`}
        </span>
        <span className="text-[10px] text-muted-foreground/60 font-medium">{labels[step]}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1 rounded-full flex-1 ${i <= step ? "bg-primary" : "bg-muted/30"}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SELECT ALL BUTTON
// ═══════════════════════════════════════════════════════════

function SelectAllButton({ allSelected, onClick, ar }: { allSelected: boolean; onClick: () => void; ar: boolean }) {
  return (
    <button onClick={onClick} className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
      allSelected ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
    }`}>
      {allSelected ? (ar ? "إلغاء الكل" : "Deselect All") : (ar ? "اختار الكل" : "Select All")}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function WorkspaceSetup() {
  const { user, refreshWorkspace } = useAuth();
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [state, setState] = useState<OnboardingState>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const upd = useCallback(<K extends keyof OnboardingState>(key: K, val: OnboardingState[K]) => {
    setState(prev => ({ ...prev, [key]: val }));
  }, []);

  const toggleArr = useCallback((key: "painPoints" | "enabledModules" | "productionStages", val: string) => {
    setState(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  }, []);

  const toggleAll = useCallback((key: "painPoints" | "enabledModules" | "productionStages", allIds: string[]) => {
    setState(prev => {
      const allSelected = allIds.every(id => prev[key].includes(id));
      return { ...prev, [key]: allSelected ? [] : allIds };
    });
  }, []);

  function next() { setDir(1); setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)); }
  function prev() { setDir(-1); setStep(s => Math.max(s - 1, 0)); }
  function skip() { setDir(1); setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)); }

  useEffect(() => {
    if (step === 3) {
      const rec = recommendModules(state);
      setState(prev => ({ ...prev, enabledModules: rec }));
    }
  }, [step]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // ─── Branch helpers ────────────────────────────────────
  function addBranch() {
    setState(prev => ({ ...prev, branches: [...prev.branches, { name: "", type: "showroom", address: "" }] }));
  }
  function updateBranch(idx: number, patch: Partial<BranchSetup>) {
    setState(prev => ({ ...prev, branches: prev.branches.map((b, i) => i === idx ? { ...b, ...patch } : b) }));
  }
  function removeBranch(idx: number) {
    if (state.branches.length <= 1) return;
    setState(prev => ({ ...prev, branches: prev.branches.filter((_, i) => i !== idx) }));
  }

  // ─── Team helpers ──────────────────────────────────────
  function addTeamMember() {
    setState(prev => ({ ...prev, teamMembers: [...prev.teamMembers, { name: "", email: "", role: "viewer", department: "" }] }));
  }
  function updateTeamMember(idx: number, patch: Partial<TeamMemberSetup>) {
    setState(prev => ({ ...prev, teamMembers: prev.teamMembers.map((m, i) => i === idx ? { ...m, ...patch } : m) }));
  }
  function removeTeamMember(idx: number) {
    setState(prev => ({ ...prev, teamMembers: prev.teamMembers.filter((_, i) => i !== idx) }));
  }

  // ─── POS helpers ───────────────────────────────────────
  function addPOS() {
    setState(prev => ({ ...prev, posRegisters: [...prev.posRegisters, { name: "", branchIndex: 0, floatAmount: "1000" }] }));
  }
  function updatePOS(idx: number, patch: Partial<POSSetup>) {
    setState(prev => ({ ...prev, posRegisters: prev.posRegisters.map((p, i) => i === idx ? { ...p, ...patch } : p) }));
  }
  function removePOS(idx: number) {
    setState(prev => ({ ...prev, posRegisters: prev.posRegisters.filter((_, i) => i !== idx) }));
  }

  // ─── Save & Launch ──────────────────────────────────────
  async function handleLaunch() {
    setSaving(true);
    setError(null);
    const enabledModules = state.enabledModules.length > 0 ? state.enabledModules : recommendModules(state);

    if (isDemoMode) {
      const ob = {
        completed: true,
        businessType: state.businessType,
        companySize: state.companySize,
        painPoints: state.painPoints,
        productionStages: state.productionStages,
        enabled_modules: enabledModules,
        branches: state.branches,
        currency: state.currency,
        defaultLanguage: state.language,
        taxRate: state.taxRate,
        companyName: state.companyName,
        phone: state.phone,
        address: state.address,
        country: state.country,
        city: state.city,
        language: lang,
      };
      localStorage.setItem("thoth_onboarding", JSON.stringify(ob));
      window.location.reload();
      return;
    }

    try {
      const sb = getSupabaseClient();
      if (!sb || !user) throw new Error("No connection");

      const businessLabel = BUSINESS_TYPES.find(b => b.id === state.businessType)?.en || "Factory";
      const name = state.companyName || `${businessLabel}`;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}-${Date.now().toString(36)}`;

      const { data: ws, error: wsErr } = await sb
        .from("workspaces")
        .insert({
          name, slug, owner_id: user.id,
          plan: state.companySize === "enterprise" ? "enterprise" : state.companySize === "large" ? "pro" : "starter",
          settings: {
            enabled_modules: enabledModules, business_type: state.businessType,
            company_size: state.companySize, pain_points: state.painPoints,
            production_stages: state.productionStages, branches: state.branches,
            currency: state.currency, tax_rate: state.taxRate,
            company_name: state.companyName, phone: state.phone,
            address: state.address, country: state.country, city: state.city,
          },
        } as any)
        .select()
        .single();
      if (wsErr) throw wsErr;
      const wsData = ws as { id: string };

      const { error: memErr } = await sb.from("workspace_members").insert({
        workspace_id: wsData.id, user_id: user.id, role: "owner", status: "active",
      } as any);
      if (memErr) throw memErr;

      await refreshWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  // ─── Can proceed ────────────────────────────────────────
  function canNext(): boolean {
    switch (step) {
      case 0: return true;
      case 1: return !!state.businessType;
      case 2: return !!state.companySize;
      case 3: return state.painPoints.length > 0;
      case 4: return state.enabledModules.length > 0;
      case 5: return state.productionStages.length >= 1;
      case 6: return true;
      case 7: return true;
      case 8: return true;
      case 9: return true;
      case 10: return true;
      default: return true;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER STEPS
  // ═══════════════════════════════════════════════════════════

  function renderStep() {
    switch (step) {

      // ─── 0: Welcome ──────────────────────────────────────
      case 0:
        return (
          <div className="flex flex-col items-center justify-center text-center px-4 min-h-[65vh]">
            <motion.div
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.3 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 flex items-center justify-center mb-6"
            >
              <Sparkles size={36} className="text-primary" />
            </motion.div>
            <motion.h1 variants={fadeV} custom={1} initial="hidden" animate="visible"
              className="text-[36px] md:text-[48px] font-bold tracking-tight"
              style={{ fontFamily: "var(--app-font-serif)", letterSpacing: "-0.04em" }}>
              THOTH
            </motion.h1>
            <motion.p variants={fadeV} custom={2} initial="hidden" animate="visible"
              className="text-[15px] text-muted-foreground mt-3 max-w-md leading-relaxed">
              {ar ? "هنبني نظام تشغيل شركتك في دقيقة واحدة." : "Build your company's operating system in one minute."}
            </motion.p>
            <motion.button variants={fadeV} custom={4} initial="hidden" animate="visible"
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={next}
              className="mt-10 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] font-semibold flex items-center gap-2 shadow-lg shadow-primary/20">
              {ar ? "يلا نبدأ" : "Let's Begin"}
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight size={16} />
              </motion.div>
            </motion.button>
            <motion.p variants={fadeV} custom={5} initial="hidden" animate="visible" className="text-[10px] text-muted-foreground/40 mt-4">
              {ar ? "دقيقة واحدة" : "Takes about 1 minute"}
            </motion.p>
          </div>
        );

      // ─── 1: Business Type ────────────────────────────────
      case 1:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-8">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "إيه أقرب وصف لشغلك؟" : "What best describes your business?"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1.5">{ar ? "اختار واحد" : "Choose one"}</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {BUSINESS_TYPES.map((type, i) => {
                const Icon = type.icon;
                const sel = state.businessType === type.id;
                return (
                  <motion.button key={type.id} variants={cardV} custom={i} initial="hidden" animate="visible"
                    whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.96 }}
                    onClick={() => { upd("businessType", type.id); setTimeout(next, 300); }}
                    className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                      sel ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border/30 hover:border-border/60"
                    }`}>
                    <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br ${type.gradient}`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <p className="text-[12px] font-semibold">{ar ? type.ar : type.en}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      // ─── 2: Company Size ─────────────────────────────────
      case 2:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-8">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "حجم الفريق" : "How big is your team?"}
              </h2>
            </motion.div>
            <div className="flex flex-col gap-2.5 max-w-lg mx-auto">
              {SIZES.map((size, i) => {
                const Icon = size.icon;
                const sel = state.companySize === size.id;
                return (
                  <motion.button key={size.id} variants={cardV} custom={i} initial="hidden" animate="visible"
                    whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { upd("companySize", size.id); setTimeout(next, 300); }}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
                      sel ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border/30 hover:border-border/60"
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sel ? "bg-primary/12" : "bg-muted/40"}`}>
                      <Icon size={18} className={sel ? "text-primary" : "text-muted-foreground"} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold">{ar ? size.ar : size.en}</p>
                      <p className="text-[10px] text-muted-foreground">{ar ? size.subAr : size.sub}</p>
                    </div>
                    {sel && <Check size={16} className="text-primary" />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      // ─── 3: Pain Points (SELECT ALL) ─────────────────────
      case 3:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-6">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "إيه المشاكل اللي عايز تحلها؟" : "What problems do you want to solve?"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1">{ar ? "اختار كل ما ينطبق" : "Select all that apply"}</p>
            </motion.div>
            <div className="max-w-3xl mx-auto mb-3 flex justify-end">
              <SelectAllButton allSelected={PAIN_POINTS.every(p => state.painPoints.includes(p.id))} onClick={() => toggleAll("painPoints", PAIN_POINTS.map(p => p.id))} ar={ar} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
              {PAIN_POINTS.map((pp, i) => {
                const Icon = pp.icon;
                const sel = state.painPoints.includes(pp.id);
                return (
                  <motion.button key={pp.id} variants={cardV} custom={i} initial="hidden" animate="visible"
                    whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}
                    onClick={() => toggleArr("painPoints", pp.id)}
                    className={`relative p-3.5 rounded-xl border-2 text-center transition-all ${
                      sel ? "border-primary bg-primary/5 shadow-md" : "border-border/30 hover:border-border/60"
                    }`}>
                    {sel && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center z-10"><Check size={8} className="text-white" strokeWidth={3} /></div>}
                    <div className="w-9 h-9 rounded-lg mx-auto mb-1.5 flex items-center justify-center" style={{ backgroundColor: `${pp.color}12` }}>
                      <Icon size={16} style={{ color: pp.color }} />
                    </div>
                    <p className="text-[11px] font-medium leading-tight">{ar ? pp.ar : pp.en}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      // ─── 4: Modules (SELECT ALL) ─────────────────────────
      case 4:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-6">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "الأدوات المقترحة" : "Recommended modules"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1">{ar ? "بناءً على إجاباتك — عدّل كما تحب" : "Based on your answers — customize freely"}</p>
            </motion.div>
            <div className="max-w-3xl mx-auto mb-3 flex justify-end">
              <SelectAllButton allSelected={MODULES.every(m => state.enabledModules.includes(m.id))} onClick={() => toggleAll("enabledModules", MODULES.map(m => m.id))} ar={ar} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-3xl mx-auto">
              {MODULES.map((mod, i) => {
                const Icon = mod.icon;
                const sel = state.enabledModules.includes(mod.id);
                const isRec = recommendModules(state).includes(mod.id);
                return (
                  <motion.button key={mod.id} variants={cardV} custom={i} initial="hidden" animate="visible"
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    onClick={() => toggleArr("enabledModules", mod.id)}
                    className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      sel ? "border-primary bg-primary/5 shadow-md" : "border-border/30 hover:border-border/60"
                    }`}>
                    {isRec && <span className="absolute top-2 right-2 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{ar ? "مقترح" : "Rec"}</span>}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${mod.color}12` }}>
                      <Icon size={16} style={{ color: mod.color }} />
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      <p className="text-[12px] font-semibold">{ar ? mod.ar : mod.en}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{ar ? mod.descAr : mod.desc}</p>
                      <p className="text-[9px] text-primary font-medium mt-1 flex items-center gap-1">
                        <Zap size={8} /> {ar ? mod.impactAr : mod.impact}
                      </p>
                    </div>
                    <div className={`absolute bottom-3 right-3 w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${sel ? "border-primary bg-primary" : "border-border/40"}`}>
                      {sel && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      // ─── 5: Production Stages (SELECT ALL) ───────────────
      case 5:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-6">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "ابني خط الإنتاج" : "Build your production flow"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1">{ar ? "اختار كل المراحل اللي تستخدمها" : "Select all stages you use"}</p>
            </motion.div>
            <div className="max-w-3xl mx-auto mb-3 flex justify-end">
              <SelectAllButton allSelected={PROD_STAGES.every(s => state.productionStages.includes(s.id))} onClick={() => toggleAll("productionStages", PROD_STAGES.map(s => s.id))} ar={ar} />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
              {PROD_STAGES.map((stage, i) => {
                const Icon = stage.icon;
                const sel = state.productionStages.includes(stage.id);
                return (
                  <motion.button key={stage.id} variants={cardV} custom={i} initial="hidden" animate="visible"
                    whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}
                    onClick={() => toggleArr("productionStages", stage.id)}
                    className={`relative p-3.5 rounded-xl border-2 text-center transition-all ${
                      sel ? "border-primary bg-primary/5 shadow-md" : "border-border/30 hover:border-border/60"
                    }`}>
                    {sel && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center z-10"><Check size={8} className="text-white" strokeWidth={3} /></div>}
                    <div className="w-10 h-10 rounded-lg mx-auto mb-1.5 flex items-center justify-center" style={{ backgroundColor: `${stage.color}12` }}>
                      <Icon size={18} style={{ color: stage.color }} />
                    </div>
                    <p className="text-[11px] font-semibold">{ar ? stage.ar : stage.en}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      // ─── 6: Branches ─────────────────────────────────────
      case 6:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-6">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "فروعك" : "Your Branches"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1">{ar ? "أضف فروع شركتك — ممكن تضيفها بعدين" : "Add your business locations — you can add more later"}</p>
            </motion.div>
            <div className="max-w-xl mx-auto space-y-3">
              {state.branches.map((branch, idx) => (
                <motion.div key={idx} variants={cardV} custom={idx} initial="hidden" animate="visible"
                  className="p-4 rounded-xl border border-border/40 space-y-2.5 relative">
                  {state.branches.length > 1 && (
                    <button onClick={() => removeBranch(idx)} className="absolute top-3 right-3 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    <input value={branch.name} onChange={e => updateBranch(idx, { name: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder={ar ? "اسم الفرع" : "Branch name"} />
                    <select value={branch.type} onChange={e => updateBranch(idx, { type: e.target.value })}
                      className="w-full h-9 px-2 rounded-lg border border-border bg-background text-[12px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30">
                      {BRANCH_TYPES.map(t => <option key={t.id} value={t.id}>{ar ? t.ar : t.en}</option>)}
                    </select>
                  </div>
                  <input value={branch.address} onChange={e => updateBranch(idx, { address: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder={ar ? "العنوان (اختياري)" : "Address (optional)"} />
                </motion.div>
              ))}
              <button onClick={addBranch} className="w-full h-10 rounded-xl border border-dashed border-border/60 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors flex items-center justify-center gap-1.5">
                <Plus size={12} /> {ar ? "إضافة فرع" : "Add Branch"}
              </button>
            </div>
          </div>
        );

      // ─── 7: Team Setup ───────────────────────────────────
      case 7:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-6">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "فريقك" : "Your Team"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1">{ar ? "أضف أعضاء الفريق — ممكن ترسل دعوات بعدين" : "Add team members — you can invite more later"}</p>
            </motion.div>
            <div className="max-w-xl mx-auto space-y-3">
              {state.teamMembers.map((member, idx) => (
                <motion.div key={idx} variants={cardV} custom={idx} initial="hidden" animate="visible"
                  className="p-4 rounded-xl border border-border/40 space-y-2.5 relative">
                  <button onClick={() => removeTeamMember(idx)} className="absolute top-3 right-3 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors">
                    <Trash2 size={11} />
                  </button>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input value={member.name} onChange={e => updateTeamMember(idx, { name: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder={ar ? "الاسم" : "Name"} />
                    <input value={member.email} onChange={e => updateTeamMember(idx, { email: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="Email" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <select value={member.role} onChange={e => updateTeamMember(idx, { role: e.target.value })}
                      className="w-full h-9 px-2 rounded-lg border border-border bg-background text-[11px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30">
                      {ROLE_TEMPLATES.map(t => <option key={t.id} value={t.id}>{ar ? t.ar : t.en}</option>)}
                    </select>
                    <input value={member.department} onChange={e => updateTeamMember(idx, { department: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder={ar ? "القسم" : "Department"} />
                  </div>
                </motion.div>
              ))}
              <button onClick={addTeamMember} className="w-full h-10 rounded-xl border border-dashed border-border/60 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors flex items-center justify-center gap-1.5">
                <UserPlus size={12} /> {ar ? "إضافة عضو" : "Add Member"}
              </button>
            </div>
          </div>
        );

      // ─── 8: POS Setup ────────────────────────────────────
      case 8:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-6">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "أجهزة الكاشير" : "POS Registers"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1">{ar ? "أضف أجهزة نقاط البيع — ممكن تضيفها بعدين" : "Add POS registers — you can add more later"}</p>
            </motion.div>
            <div className="max-w-xl mx-auto space-y-3">
              {state.posRegisters.map((pos, idx) => (
                <motion.div key={idx} variants={cardV} custom={idx} initial="hidden" animate="visible"
                  className="p-4 rounded-xl border border-border/40 space-y-2.5 relative">
                  <button onClick={() => removePOS(idx)} className="absolute top-3 right-3 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors">
                    <Trash2 size={11} />
                  </button>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input value={pos.name} onChange={e => updatePOS(idx, { name: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder={ar ? "اسم الكاشير" : "Register name"} />
                    <select value={pos.branchIndex} onChange={e => updatePOS(idx, { branchIndex: Number(e.target.value) })}
                      className="w-full h-9 px-2 rounded-lg border border-border bg-background text-[11px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30">
                      {state.branches.map((b, bi) => <option key={bi} value={bi}>{b.name || `${ar ? "فرع" : "Branch"} ${bi + 1}`}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{ar ? "الرصيد الافتتاحي:" : "Float:"}</span>
                    <input value={pos.floatAmount} onChange={e => updatePOS(idx, { floatAmount: e.target.value })}
                      className="w-24 h-8 px-2 rounded-lg border border-border bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="1000" />
                  </div>
                </motion.div>
              ))}
              <button onClick={addPOS} className="w-full h-10 rounded-xl border border-dashed border-border/60 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors flex items-center justify-center gap-1.5">
                <CreditCard size={12} /> {ar ? "إضافة كاشير" : "Add Register"}
              </button>
            </div>
          </div>
        );

      // ─── 9: Settings ─────────────────────────────────────
      case 9:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-8">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "الإعدادات" : "Settings"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1">{ar ? "العملة واللغة والضريبة" : "Currency, language, and tax"}</p>
            </motion.div>
            <div className="max-w-md mx-auto space-y-5">
              {/* Currency */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-2 block flex items-center gap-1.5">
                  <Banknote size={11} /> {ar ? "العملة" : "Currency"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CURRENCIES.map(c => (
                    <button key={c.id} onClick={() => upd("currency", c.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        state.currency === c.id ? "border-primary bg-primary/5" : "border-border/30 hover:border-border/60"
                      }`}>
                      <p className="text-[13px] font-semibold">{c.symbol} {c.id}</p>
                      <p className="text-[10px] text-muted-foreground">{ar ? c.ar : c.en}</p>
                    </button>
                  ))}
                </div>
              </div>
              {/* Language */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-2 block flex items-center gap-1.5">
                  <Languages size={11} /> {ar ? "اللغة الافتراضية" : "Default Language"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: "en", en: "English", ar: "الإنجليزية" }, { id: "ar", en: "العربية", ar: "العربية" }].map(l => (
                    <button key={l.id} onClick={() => upd("language", l.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        state.language === l.id ? "border-primary bg-primary/5" : "border-border/30 hover:border-border/60"
                      }`}>
                      <p className="text-[13px] font-semibold">{l.en}</p>
                    </button>
                  ))}
                </div>
              </div>
              {/* Tax Rate */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-2 block flex items-center gap-1.5">
                  <Receipt size={11} /> {ar ? "معدل الضريبة" : "Tax Rate"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["0", "5", "10", "15"].map(rate => (
                    <button key={rate} onClick={() => upd("taxRate", rate)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        state.taxRate === rate ? "border-primary bg-primary/5" : "border-border/30 hover:border-border/60"
                      }`}>
                      <p className="text-[16px] font-bold">{rate}%</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // ─── 10: Company Details ──────────────────────────────
      case 10:
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-8">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "بيانات الشركة" : "Company Details"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-1">{ar ? "ممكن تكملها بعدين" : "You can complete later"}</p>
            </motion.div>
            <motion.div variants={fadeV} custom={1} initial="hidden" animate="visible" className="max-w-md mx-auto space-y-3">
              <input value={state.companyName} onChange={e => upd("companyName", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={ar ? "اسم الشركة" : "Company Name"} />
              <input value={state.phone} onChange={e => upd("phone", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={ar ? "رقم الهاتف" : "Phone"} />
              <input value={state.address} onChange={e => upd("address", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={ar ? "العنوان" : "Address"} />
              <div className="grid grid-cols-2 gap-2.5">
                <select value={state.country} onChange={e => upd("country", e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border/60 bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                  <option value="">{ar ? "الدولة" : "Country"}</option>
                  {COUNTRIES.map(c => <option key={c.en} value={c.en}>{ar ? c.ar : c.en}</option>)}
                </select>
                <input value={state.city} onChange={e => upd("city", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={ar ? "المدينة" : "City"} />
              </div>
            </motion.div>
          </div>
        );

      // ─── 11: Launch ──────────────────────────────────────
      case 11: {
        const enabledMods = state.enabledModules.length > 0 ? state.enabledModules : recommendModules(state);
        return (
          <div className="px-4 py-6">
            <motion.div variants={fadeV} custom={0} initial="hidden" animate="visible" className="text-center mb-8">
              <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? "كل حاجة جاهزة!" : "Everything is ready!"}
              </h2>
            </motion.div>
            <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
              <motion.div variants={cardV} custom={0} initial="hidden" animate="visible" className="p-4 rounded-xl border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{ar ? "الأدوار" : "Modules"}</p>
                <p className="text-[20px] font-bold text-primary" style={{ fontFamily: "var(--app-font-serif)" }}>{enabledMods.length}</p>
              </motion.div>
              <motion.div variants={cardV} custom={1} initial="hidden" animate="visible" className="p-4 rounded-xl border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{ar ? "الفروع" : "Branches"}</p>
                <p className="text-[20px] font-bold text-primary" style={{ fontFamily: "var(--app-font-serif)" }}>{state.branches.length}</p>
              </motion.div>
              <motion.div variants={cardV} custom={2} initial="hidden" animate="visible" className="p-4 rounded-xl border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{ar ? "الفريق" : "Team"}</p>
                <p className="text-[20px] font-bold text-primary" style={{ fontFamily: "var(--app-font-serif)" }}>{state.teamMembers.length + 1}</p>
              </motion.div>
              <motion.div variants={cardV} custom={3} initial="hidden" animate="visible" className="p-4 rounded-xl border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{ar ? "المراحل" : "Stages"}</p>
                <p className="text-[20px] font-bold text-primary" style={{ fontFamily: "var(--app-font-serif)" }}>{state.productionStages.length}</p>
              </motion.div>
              <motion.div variants={cardV} custom={4} initial="hidden" animate="visible" className="p-4 rounded-xl border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{ar ? "العملة" : "Currency"}</p>
                <p className="text-[20px] font-bold text-primary" style={{ fontFamily: "var(--app-font-serif)" }}>{state.currency}</p>
              </motion.div>
              <motion.div variants={cardV} custom={5} initial="hidden" animate="visible" className="p-4 rounded-xl border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{ar ? "الضريبة" : "Tax"}</p>
                <p className="text-[20px] font-bold text-primary" style={{ fontFamily: "var(--app-font-serif)" }}>{state.taxRate}%</p>
              </motion.div>
            </div>
          </div>
        );
      }

      default: return null;
    }
  }

  const isWelcome = step === 0;
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-background overflow-y-auto relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/[0.03] to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-violet-500/[0.02] to-transparent blur-3xl" />
      </div>

      {!isWelcome && (
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 px-6 py-3 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <p className="text-[13px] font-bold tracking-tight shrink-0" style={{ fontFamily: "var(--app-font-serif)" }}>THOTH</p>
            <div className="flex-1"><StepProgress step={step} ar={ar} /></div>
          </div>
        </motion.div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto pb-28">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={pageV} initial="enter" animate="center" exit="exit">
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] flex items-center gap-2 shadow-xl max-w-md">
          <AlertCircle size={14} /> {error}
        </motion.div>
      )}

      {!isWelcome && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-6 py-4 bg-background/90 backdrop-blur-lg border-t border-border/20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={prev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={14} /> {ar ? "رجوع" : "Back"}
            </motion.button>
            <div className="flex items-center gap-2">
              {step > 0 && step < TOTAL_STEPS - 1 && (
                <button onClick={skip} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                  {ar ? "تخطي" : "Skip"}
                </button>
              )}
              {isLast ? (
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={handleLaunch} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-lg shadow-primary/20 disabled:opacity-40">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                  {ar ? "إطلاق THOTH" : "Launch THOTH"}
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={next} disabled={!canNext()}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-lg shadow-primary/20 disabled:opacity-40">
                  {ar ? "التالي" : "Continue"}
                  <ChevronRight size={14} />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
