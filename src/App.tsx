import { useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { OnboardingProvider, useOnboarding } from "./context/OnboardingContext";
import { CommandBarProvider } from "./context/CommandBarContext";
import { CommandBar, useCommandBarShortcut } from "./components/CommandBar";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import AIAssistant from "./components/AIAssistant";
import { Logo } from "./components/Logo";
import Onboarding from "./pages/Onboarding";
import AuthPage from "./pages/AuthPage";
import Landing from "./pages/Landing";
import WorkspaceSetup from "./pages/WorkspaceSetup";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Today from "./pages/Today";
import People from "./pages/People";
import PersonProfile from "./pages/PersonProfile360";
import Organizations from "./pages/Organizations";
import OrganizationProfile from "./pages/Customer360";
import ActivityFeed from "./pages/Activity";
import Work from "./pages/Work";
import WorkDetail from "./pages/WorkDetail";
import Sales from "./pages/Sales";
import SalesDetail from "./pages/SalesDetail";
import Finance from "./pages/Finance";
import FinanceDetail from "./pages/FinanceDetail";
import FinanceDashboardPage from "./pages/FinanceDashboard";
import FinanceInvoicesPage from "./pages/FinanceInvoices";
import FinanceExpensesPage from "./pages/FinanceExpenses";
import FinanceReportsPage from "./pages/FinanceReports";
import FinanceBankPage from "./pages/FinanceBank";
import FinanceARAPPage from "./pages/FinanceARAP";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Intelligence from "./pages/Intelligence";
import Memory from "./pages/Memory";
import DecisionCenter from "./pages/DecisionCenter";
import WorkQueue from "./pages/WorkQueue";
import ForecastEngine from "./pages/ForecastEngine";
import RiskRadar from "./pages/RiskRadar";
import OperatingRhythms from "./pages/OperatingRhythms";
import ExecutiveMode from "./pages/ExecutiveMode";
import Roadmap from "./pages/Roadmap";
import DataManagement from "./pages/DataManagement";
import OperationsPage from "./pages/Operations";
import TeamPage from "./pages/Team";
import PurchasingPage from "./pages/Purchasing";
import ReportsPage from "./pages/Reports";
import QuotationsPage from "./pages/Quotations";
import ProductsPage from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import SalesOrdersPage from "./pages/SalesOrders";
import SiteVisitsPage from "./pages/SiteVisits";
import DesignsPage from "./pages/Designs";
import ProductionPlanningPage from "./pages/ProductionPlanning";
import ProductionPage from "./pages/Production";
import ProductionExecDashboard from "./pages/ProductionExecutiveDashboard";
import QualityControlPage from "./pages/QualityControl";
import DeliveryInstallationPage from "./pages/DeliveryInstallation";
import HRWorkforcePage from "./pages/HRWorkforce";
import HRDashboardPage from "./pages/HRDashboard";
import HREmployeeProfilePage from "./pages/HREmployeeProfile";
import HRRecruitmentPage from "./pages/HRRecruitment";
import HRPayrollPage from "./pages/HRPayroll";
import HROrgPage from "./pages/HROrg";
import HRCompensationPage from "./pages/HRCompensation";
import HRTrainingPage from "./pages/HRTraining";
import HRPerformancePage from "./pages/HRPerformance";
import HREmployeeRelationsPage from "./pages/HREmployeeRelations";
import HRCompliancePage from "./pages/HRCompliance";
import HRAnalyticsPage from "./pages/HRAnalytics";
import AdvancedToolsPage from "./pages/AdvancedTools";
import InventoryPage from "./pages/Inventory";
import UsersAccessPage from "./pages/UsersAccess";
import AnalyticsPage from "./pages/Analytics";
import LoyaltyDashboard from "./pages/Loyalty";
import LoyaltyLookup from "./pages/LoyaltyLookup";
import LoyaltyMemberPage from "./pages/LoyaltyMember";
import LoyaltyTransactionsPage from "./pages/LoyaltyTransactions";
import LoyaltyRulesPage from "./pages/LoyaltyRules";
import LoyaltySettingsPage from "./pages/LoyaltySettings";
import ShopifyConnectionPage from "./pages/ShopifyConnection";
import ShopifySyncLogsPage from "./pages/ShopifySyncLogs";
import LoyaltyRedemptionsPage from "./pages/LoyaltyRedemptions";
import LoyaltyCampaignsPage from "./pages/LoyaltyCampaigns";
import LoyaltyAnalyticsPage from "./pages/LoyaltyAnalytics";
import LoyaltyRewardsPage from "./pages/LoyaltyRewards";
import LoyaltyMergePage from "./pages/LoyaltyMerge";
import LoyaltyNotificationsPage from "./pages/LoyaltyNotifications";
import AuthCallback from "./pages/AuthCallback";
import AdminSettingsPage from "./pages/AdminSettings";
import CodeSettingsPage from "./pages/CodeSettings";
import QuotationDesignerPage from "./pages/QuotationDesigner";
import InventoryFabricsPage from "./pages/InventoryFabrics";
import InventoryMaterialsPage from "./pages/InventoryMaterials";
import InventoryEquipmentPage from "./pages/InventoryEquipment";
import POSPage from "./pages/POS";
import BranchesPage from "./pages/Branches";
import CRMPage from "./pages/CRM";
import CRMCustomersPage from "./pages/CRMCustomers";
import CRMCustomerProfilePage from "./pages/CRMCustomerProfile";
import CRMPipelinePage from "./pages/CRMPipeline";
import StudioHome from "./pages/StudioHome";
import StudioPage from "./pages/StudioPage";
import StudioDatabases from "./pages/StudioDatabases";
import MobileAppBuilder from "./pages/MobileAppBuilder";
import AppConfiguration from "./pages/AppConfiguration";
import AppAnalytics from "./pages/AppAnalytics";
import AppPreview from "./pages/AppPreview";
import PushNotificationCenter from "./pages/PushNotificationCenter";
import { MemoryProvider } from "./context/MemoryContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { isDemoMode } from "./lib/supabase";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// ─── Placeholder for unbuilt modules ─────────────────────

function ModulePlaceholder({ labelEn, labelAr, descEn, descAr }: { labelEn: string; labelAr: string; descEn?: string; descAr?: string }) {
  const { lang } = useLanguage();
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-3 max-w-[320px]">
        <div className="w-10 h-10 rounded-xl bg-muted mx-auto flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded bg-border" />
        </div>
        <div>
          <p className="text-[14px] font-medium text-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>
            {lang === "ar" ? labelAr : labelEn}
          </p>
          <p className="text-[12px] text-muted-foreground mt-1">
            {lang === "ar" ? (descAr || "قريباً إن شاء الله") : (descEn || "Coming soon")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Logo variant="full" size={20} />
        <Loader2 size={16} className="animate-spin text-muted-foreground/50" />
      </div>
    </div>
  );
}

// ─── App shell ────────────────────────────────────────────

function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  useCommandBarShortcut();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen((prev) => !prev)} />
        <main className="flex-1 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <CommandBar />
      <AIAssistant />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <MemoryProvider>
      <CommandBarProvider>
        <ShellInner>{children}</ShellInner>
      </CommandBarProvider>
    </MemoryProvider>
  );
}

// ─── App routes (shared between demo and production) ──────

function AppRoutes() {
  return (
    <Shell>
      <Switch>
        {/* ── Executive OS ── */}
        <Route path="/" component={ExecutiveDashboard} />
        <Route path="/queue" component={WorkQueue} />
        <Route path="/forecast" component={ForecastEngine} />
        <Route path="/risk" component={RiskRadar} />
        <Route path="/rhythms" component={OperatingRhythms} />
        <Route path="/exec" component={ExecutiveMode} />

        {/* ── Core modules ── */}
        <Route path="/today" component={Today} />
        <Route path="/people/:id" component={PersonProfile} />
        <Route path="/people" component={People} />
        <Route path="/organizations/:id" component={OrganizationProfile} />
        <Route path="/organizations" component={Organizations} />
        <Route path="/activity" component={ActivityFeed} />
        <Route path="/work/:id" component={WorkDetail} />
        <Route path="/work" component={Work} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/quotations/designer/:templateId" component={QuotationDesignerPage} />
        <Route path="/quotations/designer" component={QuotationDesignerPage} />
        <Route path="/quotations" component={QuotationsPage} />
        <Route path="/orders" component={SalesOrdersPage} />
        <Route path="/site-visits" component={SiteVisitsPage} />
        <Route path="/designs" component={DesignsPage} />
        <Route path="/production" component={ProductionPage} />
        <Route path="/production/exec" component={ProductionExecDashboard} />
        <Route path="/quality" component={QualityControlPage} />
        <Route path="/delivery" component={DeliveryInstallationPage} />
        <Route path="/hr/dashboard" component={HRDashboardPage} />
        <Route path="/hr/employees/:id" component={HREmployeeProfilePage} />
        <Route path="/hr/employees" component={HRWorkforcePage} />
        <Route path="/hr/recruitment" component={HRRecruitmentPage} />
        <Route path="/hr/compensation" component={HRCompensationPage} />
        <Route path="/hr/training" component={HRTrainingPage} />
        <Route path="/hr/performance" component={HRPerformancePage} />
        <Route path="/hr/relations" component={HREmployeeRelationsPage} />
        <Route path="/hr/compliance" component={HRCompliancePage} />
        <Route path="/hr/analytics" component={HRAnalyticsPage} />
        <Route path="/hr/payroll" component={HRPayrollPage} />
        <Route path="/hr/org" component={HROrgPage} />
        <Route path="/hr" component={HRDashboardPage} />
        <Route path="/tools" component={AdvancedToolsPage} />
        <Route path="/pos" component={POSPage} />
        <Route path="/branches" component={BranchesPage} />
        <Route path="/crm/customers/:id" component={CRMCustomerProfilePage} />
        <Route path="/crm/customers" component={CRMCustomersPage} />
        <Route path="/crm/pipeline" component={CRMPipelinePage} />
        <Route path="/crm" component={CRMPage} />
        {/* ── Mobile Apps ── */}
        <Route path="/mobile-apps/dashboard" component={MobileAppBuilder} />
        <Route path="/mobile-apps/config/:id" component={AppConfiguration} />
        <Route path="/mobile-apps/notifications" component={PushNotificationCenter} />
        <Route path="/mobile-apps/analytics" component={AppAnalytics} />
        <Route path="/mobile-apps/preview/:id" component={AppPreview} />
        <Route path="/mobile-apps" component={MobileAppBuilder} />

        <Route path="/studio/home" component={StudioHome} />
        <Route path="/studio/databases" component={StudioDatabases} />
        <Route path="/studio/:id" component={StudioPage} />
        <Route path="/studio" component={StudioHome} />
        <Route path="/sales/:id" component={SalesDetail} />
        <Route path="/sales" component={Sales} />
        <Route path="/operations" component={OperationsPage} />
        <Route path="/purchasing" component={PurchasingPage} />
        <Route path="/inventory/fabrics" component={InventoryFabricsPage} />
        <Route path="/inventory/materials" component={InventoryMaterialsPage} />
        <Route path="/inventory/equipment" component={InventoryEquipmentPage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/resources/:id" component={ResourceDetail} />
        <Route path="/resources" component={Resources} />
        <Route path="/finance/dashboard" component={FinanceDashboardPage} />
        <Route path="/finance/invoices/:id" component={FinanceDetail} />
        <Route path="/finance/invoices" component={FinanceInvoicesPage} />
        <Route path="/finance/expenses" component={FinanceExpensesPage} />
        <Route path="/finance/reports" component={FinanceReportsPage} />
        <Route path="/finance/bank" component={FinanceBankPage} />
        <Route path="/finance/ar-ap" component={FinanceARAPPage} />
        <Route path="/finance/:id" component={FinanceDetail} />
        <Route path="/finance" component={FinanceDashboardPage} />
        <Route path="/knowledge">
          <ModulePlaceholder labelEn="Knowledge Base" labelAr="قاعدة المعرفة" descEn="Documents, policies, and company knowledge" descAr="الملفات والسياسات ومعلومات الشركة" />
        </Route>

        {/* ── Loyalty ── */}
        <Route path="/loyalty/members/:id" component={LoyaltyMemberPage} />
        <Route path="/loyalty/lookup" component={LoyaltyLookup} />
        <Route path="/loyalty/transactions" component={LoyaltyTransactionsPage} />
        <Route path="/loyalty/rules" component={LoyaltyRulesPage} />
        <Route path="/loyalty/redemptions" component={LoyaltyRedemptionsPage} />
        <Route path="/loyalty/campaigns" component={LoyaltyCampaignsPage} />
        <Route path="/loyalty/analytics" component={LoyaltyAnalyticsPage} />
        <Route path="/loyalty/rewards" component={LoyaltyRewardsPage} />
        <Route path="/loyalty/merge" component={LoyaltyMergePage} />
        <Route path="/loyalty/notifications" component={LoyaltyNotificationsPage} />
        <Route path="/loyalty/shopify" component={ShopifyConnectionPage} />
        <Route path="/loyalty/sync-logs" component={ShopifySyncLogsPage} />
        <Route path="/loyalty/settings" component={LoyaltySettingsPage} />
        <Route path="/loyalty" component={LoyaltyDashboard} />

        {/* ── Intelligence layer ── */}
        <Route path="/intelligence" component={Intelligence} />
        <Route path="/memory" component={Memory} />
        <Route path="/decisions" component={DecisionCenter} />

        <Route path="/users" component={UsersAccessPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/team" component={TeamPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/data" component={DataManagement} />
        <Route path="/settings/codes" component={CodeSettingsPage} />
        <Route path="/settings" component={AdminSettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

// ─── Router ───────────────────────────────────────────────

function Router() {
  const { onboardingData } = useOnboarding();
  const { isAuthenticated, loading, workspace, workspaceLoading } = useAuth();
  // Subscribe to wouter's location — reading window.location.pathname here
  // doesn't re-render on client-side navigate(), so the landing page's
  // Sign in / Begin free buttons changed the URL without changing the view.
  const [path] = useLocation();

  // ── Public landing page: reachable in every mode ──────────
  if (path === "/welcome") return <Landing />;

  // ── Demo mode ──
  if (isDemoMode) {
    if (!onboardingData?.completed) {
      // The landing IS the launch page; its CTAs (→ /auth) open onboarding.
      if (path === "/") return <Landing />;
      return <WorkspaceSetup />;
    }
    // No auth in demo — the landing's door leads straight into the app.
    if (path === "/auth") return <Redirect to="/" />;
    return <AppRoutes />;
  }

  // ── OAuth callback: always render before auth guards ────────
  // This prevents the black/blank page issue where the auth callback
  // URL is intercepted by the auth guards before Supabase can
  // process the code/token from the redirect.
  if (path.startsWith("/auth/callback")) {
    return <AuthCallback />;
  }

  // ── Production mode: require Supabase authentication ──────
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) {
    // Logged-out visitors land on the marketing page; /auth is the door in.
    if (path === "/") return <Landing />;
    return <AuthPage />;
  }
  if (workspaceLoading) return <LoadingScreen />;
  if (!workspace) return <WorkspaceSetup />;

  return <AppRoutes />;
}

// ─── Root ─────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <AuthProvider>
              <OnboardingProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
                <Toaster />
              </OnboardingProvider>
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
