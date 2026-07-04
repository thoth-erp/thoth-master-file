import { useState, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
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
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const Today = lazy(() => import("./pages/Today"));
const People = lazy(() => import("./pages/People"));
const PersonProfile = lazy(() => import("./pages/PersonProfile360"));
const Organizations = lazy(() => import("./pages/Organizations"));
const OrganizationProfile = lazy(() => import("./pages/Customer360"));
const ActivityFeed = lazy(() => import("./pages/Activity"));
const Work = lazy(() => import("./pages/Work"));
const WorkDetail = lazy(() => import("./pages/WorkDetail"));
const Sales = lazy(() => import("./pages/Sales"));
const SalesDetail = lazy(() => import("./pages/SalesDetail"));
const Finance = lazy(() => import("./pages/Finance"));
const FinanceDetail = lazy(() => import("./pages/FinanceDetail"));
const FinanceDashboardPage = lazy(() => import("./pages/FinanceDashboard"));
const FinanceInvoicesPage = lazy(() => import("./pages/FinanceInvoices"));
const FinanceExpensesPage = lazy(() => import("./pages/FinanceExpenses"));
const FinanceReportsPage = lazy(() => import("./pages/FinanceReports"));
const FinanceBankPage = lazy(() => import("./pages/FinanceBank"));
const FinanceARAPPage = lazy(() => import("./pages/FinanceARAP"));
const Resources = lazy(() => import("./pages/Resources"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const Intelligence = lazy(() => import("./pages/Intelligence"));
const Memory = lazy(() => import("./pages/Memory"));
const DecisionCenter = lazy(() => import("./pages/DecisionCenter"));
const WorkQueue = lazy(() => import("./pages/WorkQueue"));
const ForecastEngine = lazy(() => import("./pages/ForecastEngine"));
const RiskRadar = lazy(() => import("./pages/RiskRadar"));
const OperatingRhythms = lazy(() => import("./pages/OperatingRhythms"));
const ExecutiveMode = lazy(() => import("./pages/ExecutiveMode"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const DataManagement = lazy(() => import("./pages/DataManagement"));
const OperationsPage = lazy(() => import("./pages/Operations"));
const TeamPage = lazy(() => import("./pages/Team"));
const PurchasingPage = lazy(() => import("./pages/Purchasing"));
const ReportsPage = lazy(() => import("./pages/Reports"));
const QuotationsPage = lazy(() => import("./pages/Quotations"));
const ProductsPage = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SalesOrdersPage = lazy(() => import("./pages/SalesOrders"));
const SiteVisitsPage = lazy(() => import("./pages/SiteVisits"));
const DesignsPage = lazy(() => import("./pages/Designs"));
const ProductionPlanningPage = lazy(() => import("./pages/ProductionPlanning"));
const ProductionPage = lazy(() => import("./pages/Production"));
const ProductionExecDashboard = lazy(() => import("./pages/ProductionExecutiveDashboard"));
const QualityControlPage = lazy(() => import("./pages/QualityControl"));
const DeliveryInstallationPage = lazy(() => import("./pages/DeliveryInstallation"));
const HRWorkforcePage = lazy(() => import("./pages/HRWorkforce"));
const HRDashboardPage = lazy(() => import("./pages/HRDashboard"));
const HREmployeeProfilePage = lazy(() => import("./pages/HREmployeeProfile"));
const HRRecruitmentPage = lazy(() => import("./pages/HRRecruitment"));
const HRPayrollPage = lazy(() => import("./pages/HRPayroll"));
const HROrgPage = lazy(() => import("./pages/HROrg"));
const HRCompensationPage = lazy(() => import("./pages/HRCompensation"));
const HRTrainingPage = lazy(() => import("./pages/HRTraining"));
const HRPerformancePage = lazy(() => import("./pages/HRPerformance"));
const HREmployeeRelationsPage = lazy(() => import("./pages/HREmployeeRelations"));
const HRCompliancePage = lazy(() => import("./pages/HRCompliance"));
const HRAnalyticsPage = lazy(() => import("./pages/HRAnalytics"));
const AdvancedToolsPage = lazy(() => import("./pages/AdvancedTools"));
const InventoryPage = lazy(() => import("./pages/Inventory"));
const UsersAccessPage = lazy(() => import("./pages/UsersAccess"));
const AnalyticsPage = lazy(() => import("./pages/Analytics"));
const LoyaltyDashboard = lazy(() => import("./pages/Loyalty"));
const LoyaltyLookup = lazy(() => import("./pages/LoyaltyLookup"));
const LoyaltyMemberPage = lazy(() => import("./pages/LoyaltyMember"));
const LoyaltyTransactionsPage = lazy(() => import("./pages/LoyaltyTransactions"));
const LoyaltyRulesPage = lazy(() => import("./pages/LoyaltyRules"));
const LoyaltySettingsPage = lazy(() => import("./pages/LoyaltySettings"));
const ShopifyConnectionPage = lazy(() => import("./pages/ShopifyConnection"));
const ShopifySyncLogsPage = lazy(() => import("./pages/ShopifySyncLogs"));
const ShopifyKitPage = lazy(() => import("./pages/ShopifyKit"));
const ShopifyWalletPage = lazy(() => import("./pages/ShopifyWallet"));
const ShopifyWishlistPage = lazy(() => import("./pages/ShopifyWishlist"));
const ShopifyReviewsPage = lazy(() => import("./pages/ShopifyReviews"));
const LoyaltyRedemptionsPage = lazy(() => import("./pages/LoyaltyRedemptions"));
const LoyaltyCampaignsPage = lazy(() => import("./pages/LoyaltyCampaigns"));
const LoyaltyAnalyticsPage = lazy(() => import("./pages/LoyaltyAnalytics"));
const LoyaltyRewardsPage = lazy(() => import("./pages/LoyaltyRewards"));
const LoyaltyMergePage = lazy(() => import("./pages/LoyaltyMerge"));
const LoyaltyNotificationsPage = lazy(() => import("./pages/LoyaltyNotifications"));
import AuthCallback from "./pages/AuthCallback";
const AdminSettingsPage = lazy(() => import("./pages/AdminSettings"));
const CodeSettingsPage = lazy(() => import("./pages/CodeSettings"));
const QuotationDesignerPage = lazy(() => import("./pages/QuotationDesigner"));
const InventoryFabricsPage = lazy(() => import("./pages/InventoryFabrics"));
const InventoryMaterialsPage = lazy(() => import("./pages/InventoryMaterials"));
const InventoryEquipmentPage = lazy(() => import("./pages/InventoryEquipment"));
const POSPage = lazy(() => import("./pages/POS"));
const BranchesPage = lazy(() => import("./pages/Branches"));
const CRMPage = lazy(() => import("./pages/CRM"));
const CRMCustomersPage = lazy(() => import("./pages/CRMCustomers"));
const CRMCustomerProfilePage = lazy(() => import("./pages/CRMCustomerProfile"));
const CRMPipelinePage = lazy(() => import("./pages/CRMPipeline"));
const StudioHome = lazy(() => import("./pages/StudioHome"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const StudioDatabases = lazy(() => import("./pages/StudioDatabases"));
const MobileAppBuilder = lazy(() => import("./pages/MobileAppBuilder"));
const AppConfiguration = lazy(() => import("./pages/AppConfiguration"));
const AppAnalytics = lazy(() => import("./pages/AppAnalytics"));
const AppPreview = lazy(() => import("./pages/AppPreview"));
const PushNotificationCenter = lazy(() => import("./pages/PushNotificationCenter"));
import { MemoryProvider } from "./context/MemoryContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { isDemoMode } from "./lib/supabase";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Lists stay fresh for 30s — navigating back re-renders from cache
      // instantly instead of refetching every table on every visit.
      staleTime: 30_000,
      retry: 1,
    },
  },
});

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
      <Suspense fallback={<LoadingScreen />}>
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
        <Route path="/loyalty/settings" component={LoyaltySettingsPage} />
        <Route path="/loyalty" component={LoyaltyDashboard} />

        {/* ── Shopify ── */}
        <Route path="/shopify/integration" component={ShopifyConnectionPage} />
        <Route path="/shopify/sync-logs" component={ShopifySyncLogsPage} />
        <Route path="/shopify/kit/wallet" component={ShopifyWalletPage} />
        <Route path="/shopify/kit/wishlist" component={ShopifyWishlistPage} />
        <Route path="/shopify/kit/reviews" component={ShopifyReviewsPage} />
        <Route path="/shopify/kit" component={ShopifyKitPage} />
        <Route path="/shopify">{() => <Redirect to="/shopify/integration" />}</Route>
        {/* Legacy paths (Shopify used to live under Loyalty) */}
        <Route path="/loyalty/shopify">{() => <Redirect to="/shopify/integration" />}</Route>
        <Route path="/loyalty/sync-logs">{() => <Redirect to="/shopify/sync-logs" />}</Route>

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
      </Suspense>
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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
