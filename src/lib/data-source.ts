/**
 * Data Adapter Layer
 *
 * Unified interface that switches transparently between demo data
 * (static arrays) and live Supabase data based on env vars.
 *
 * Table mapping (schema → adapter key):
 *   work_items      → ds.work_items
 *   activity_events → ds.activity_events
 *   (all others match their Supabase table names exactly)
 */

import { supabase, isDemoMode } from "./supabase";
import { DataError, ValidationError, type DataOp } from "./errors";
import { reportError } from "./sentry";
import { validateMoneyWrite } from "./schemas/money-schemas";

/** H3 backstop: money writes are schema-checked in BOTH modes before they
 *  touch the store. User input problems, not system failures — no Sentry. */
function guardWrite(op: DataOp, table: string, payload: Record<string, unknown>, workspaceId: string): void {
  const issues = validateMoneyWrite(table, payload);
  if (issues) throw new ValidationError(op, table, issues, workspaceId);
}
import { loadDeals } from "../data/sales";
import { loadWorkItems } from "../data/work";
import { loadInvoices, loadPayments, loadExpenses } from "../data/finance";
import { PEOPLE } from "../data/people";
import { ORGANIZATIONS } from "../data/organizations";
import { loadResources } from "../data/resources";
import type { Database } from "./database.types";
import {
  DEMO_BRANCHES, DEMO_EMPLOYEES, DEMO_ATTENDANCE, DEMO_LEAVE_REQUESTS,
  DEMO_SITE_VISITS, DEMO_MEASUREMENTS, DEMO_DESIGN_BRIEFS, DEMO_DESIGN_FILES,
  DEMO_DESIGN_COMMENTS, DEMO_PRODUCTION_ORDERS, DEMO_CUTTING_ITEMS, DEMO_STAGE_LOG,
  DEMO_QC_INSPECTIONS, DEMO_QC_DEFECTS, DEMO_DELIVERIES, DEMO_INSTALLATIONS,
  DEMO_COST_ENTRIES, DEMO_MATERIAL_REQUIREMENTS, DEMO_ACTIVITY_EVENTS,
  DEMO_SALES_ORDERS, DEMO_QUOTATIONS, DEMO_PURCHASE_ITEMS,
  DEMO_VENDORS, DEMO_INVENTORY, DEMO_STOCK_MOVEMENTS, DEMO_MAINTENANCE,
  DEMO_PRODUCTS, DEMO_POS_REGISTERS, DEMO_POS_TRANSACTIONS, DEMO_POS_TXN_ITEMS,
  DEMO_BRANCH_INVENTORY,
} from "./demo-seed";

type Tables = Database["public"]["Tables"];

// ─── Demo data converters ─────────────────────────────────
// Convert static data shapes → DB Row shapes so all pages
// can use ONE field convention (name_en, name_ar, metadata).

function convertPeople(): Tables["people"]["Row"][] {
  return PEOPLE.map(p => ({
    id: p.id,
    workspace_id: "demo",
    name_en: p.name,
    name_ar: p.nameAr || null,
    email: p.email,
    phone: p.phone,
    type: p.type,
    status: p.status,
    tags: [p.type],
    metadata: {
      company: p.company, companyAr: p.companyAr,
      role: p.role, roleAr: p.roleAr,
      avatarColor: p.avatarColor,
      address: p.address, addressAr: p.addressAr,
      city: p.city, cityAr: p.cityAr,
      country: p.country, countryAr: p.countryAr,
      website: p.website, linkedin: p.linkedin,
      bioEn: p.bioEn, bioAr: p.bioAr,
      lastContactEn: p.lastContactEn, lastContactAr: p.lastContactAr,
      roles: p.roles, metrics: p.metrics,
      activity: p.activity, notes: p.notes,
      files: p.files, related: p.related,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as unknown as Tables["people"]["Row"][];
}

function convertOrganizations(): Tables["organizations"]["Row"][] {
  return ORGANIZATIONS.map(o => ({
    id: o.id,
    workspace_id: "demo",
    name_en: o.nameEn,
    name_ar: o.nameAr || null,
    type: o.type,
    status: o.status,
    industry: o.industryEn,
    website: o.website || null,
    email: o.email || null,
    phone: o.phone || null,
    tags: [o.relationship, o.lifecycle],
    metadata: {
      relationship: o.relationship,
      lifecycle: o.lifecycle,
      industryAr: o.industryAr,
      founded: o.founded, headcount: o.headcount,
      healthScore: o.healthScore,
      addressEn: o.addressEn, addressAr: o.addressAr,
      ownerEn: o.ownerEn, ownerAr: o.ownerAr,
      descEn: o.descEn, descAr: o.descAr,
      avatarColor: o.avatarColor,
      branches: o.branches,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as unknown as Tables["organizations"]["Row"][];
}

function convertDeals(): Tables["deals"]["Row"][] {
  return loadDeals().map(d => ({
    id: d.id,
    workspace_id: "demo",
    title_en: d.titleEn,
    title_ar: d.titleAr || null,
    value: d.value,
    currency: d.currency || "SAR",
    stage: d.stage,
    probability: d.probability,
    org_name_en: d.orgNameEn || null,
    org_name_ar: d.orgNameAr || null,
    contact_name_en: d.contactNameEn || null,
    contact_name_ar: d.contactNameAr || null,
    owner_en: d.ownerEn || null,
    owner_ar: d.ownerAr || null,
    expected_close: d.expectedCloseDateISO || null,
    organization_id: d.orgId || null,
    tags: [],
    metadata: {
      descEn: d.descEn, descAr: d.descAr,
      priority: d.priority,
      contactRole: d.contactRole,
      relatedWorkIds: d.relatedWorkIds,
      expectedCloseDateEn: d.expectedCloseDateEn,
      expectedCloseDateAr: d.expectedCloseDateAr,
      createdEn: d.createdEn, createdAr: d.createdAr,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as unknown as Tables["deals"]["Row"][];
}

function convertWorkItems(): Tables["work_items"]["Row"][] {
  return loadWorkItems().map(w => ({
    id: w.id,
    workspace_id: "demo",
    title_en: w.titleEn,
    title_ar: w.titleAr || null,
    type: w.kind as Tables["work_items"]["Row"]["type"],
    status: w.status as Tables["work_items"]["Row"]["status"],
    priority: w.priority as Tables["work_items"]["Row"]["priority"],
    progress: w.progress,
    due_date: w.dueDateISO || null,
    assignee_id: null,
    organization_id: w.relatedOrgId || null,
    tags: [w.kind],
    metadata: {
      descEn: w.descEn, descAr: w.descAr,
      assigneeEn: w.assigneeEn, assigneeAr: w.assigneeAr,
      relatedPersonId: w.relatedPersonId,
      relatedPersonNameEn: w.relatedPersonNameEn,
      relatedPersonNameAr: w.relatedPersonNameAr,
      relatedOrgNameEn: w.relatedOrgNameEn,
      relatedOrgNameAr: w.relatedOrgNameAr,
      dueDateEn: w.dueDateEn, dueDateAr: w.dueDateAr,
      createdEn: w.createdEn, createdAr: w.createdAr,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as unknown as Tables["work_items"]["Row"][];
}

function convertInvoices(): Tables["invoices"]["Row"][] {
  return loadInvoices().map(i => ({
    id: i.id,
    workspace_id: "demo",
    number: i.number,
    org_name_en: i.orgNameEn,
    org_name_ar: i.orgNameAr || null,
    organization_id: i.orgId || null,
    deal_id: i.relatedDealId || null,
    amount: i.amount,
    currency: i.currency || "SAR",
    status: i.status,
    paid_amount: i.paidAmount || 0,
    issue_date: i.issueDateEn || null,
    due_date: i.dueDateISO || null,
    tags: [],
    metadata: {
      titleEn: i.titleEn, titleAr: i.titleAr,
      contactNameEn: i.contactNameEn, contactNameAr: i.contactNameAr,
      dueDateEn: i.dueDateEn, dueDateAr: i.dueDateAr,
      issueDateEn: i.issueDateEn, issueDateAr: i.issueDateAr,
      noteEn: i.noteEn, noteAr: i.noteAr,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as unknown as Tables["invoices"]["Row"][];
}

function convertPayments(): Tables["payments"]["Row"][] {
  return loadPayments().map(p => ({
    id: p.id,
    workspace_id: "demo",
    invoice_id: p.invoiceId,
    amount: p.amount,
    currency: p.currency || "SAR",
    method: p.method,
    date: p.dateEn,
    reference: p.referenceEn || null,
    metadata: {
      invoiceNumber: p.invoiceNumber,
      dateAr: p.dateAr,
      referenceAr: p.referenceAr,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as unknown as Tables["payments"]["Row"][];
}

function convertExpenses(): Tables["expenses"]["Row"][] {
  return loadExpenses().map(e => ({
    id: e.id,
    workspace_id: "demo",
    vendor_en: e.vendorEn,
    vendor_ar: e.vendorAr || null,
    category: e.category,
    amount: e.amount,
    currency: e.currency || "SAR",
    status: e.status,
    date: e.dateEn,
    description_en: e.descEn,
    description_ar: e.descAr || null,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as unknown as Tables["expenses"]["Row"][];
}

function convertResources(): Tables["resources"]["Row"][] {
  return loadResources().map(r => ({
    id: r.id,
    workspace_id: "demo",
    name_en: r.nameEn,
    name_ar: r.nameAr || null,
    type: r.type,
    utilization: r.utilization,
    department: null,
    skills: [],
    metadata: {
      status: r.status,
      descEn: r.descEn, descAr: r.descAr,
      ownerEn: r.ownerEn, ownerAr: r.ownerAr,
      locationEn: r.locationEn, locationAr: r.locationAr,
      value: r.value, currency: r.currency,
      sku: r.sku, quantity: r.quantity, unitCost: r.unitCost,
      assignedToEn: r.assignedToEn, assignedToAr: r.assignedToAr,
      relatedWorkId: r.relatedWorkId,
      purchaseDateEn: r.purchaseDateEn, purchaseDateAr: r.purchaseDateAr,
      maintenance: r.maintenance,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as unknown as Tables["resources"]["Row"][];
}

// ─── Generic CRUD shape ────────────────────────────────────

/** Server-side pagination options (H2). */
export interface PageOpts {
  /** 0-based page index. Default 0. */
  page?: number;
  /** Rows per page, 1–500. Default 50. */
  pageSize?: number;
  /** Column to sort by. Default "created_at". */
  orderBy?: string;
  /** Sort direction. Default false (newest first). */
  ascending?: boolean;
  /** Equality filters; array values use contains (e.g. skills). */
  filters?: Record<string, unknown>;
  /** Case-insensitive substring match across columns (OR).
   *  Supports jsonb paths like "metadata->>so_number". */
  search?: { columns: string[]; term: string };
}

export interface PagedResult<T> {
  rows: T[];
  /** Exact total matching rows (all pages), for pager UI + counts. */
  total: number;
  page: number;
  pageSize: number;
}

export interface EntityAdapter<T> {
  list(workspaceId: string, filters?: Record<string, unknown>): Promise<T[]>;
  listPaged(workspaceId: string, opts?: PageOpts): Promise<PagedResult<T>>;
  get(workspaceId: string, id: string): Promise<T | null>;
  create(workspaceId: string, data: Partial<T>): Promise<T | null>;
  update(workspaceId: string, id: string, data: Partial<T>): Promise<T | null>;
  remove(workspaceId: string, id: string): Promise<boolean>;
}

function clampPage(opts: PageOpts): { page: number; pageSize: number } {
  return {
    page: Math.max(0, opts.page ?? 0),
    pageSize: Math.min(500, Math.max(1, opts.pageSize ?? 50)),
  };
}

// ─── Supabase adapter factory ──────────────────────────────

function makeSupabaseAdapter<T extends { id: string; workspace_id: string }>(
  table: keyof Tables
): EntityAdapter<T> {
  // H1 "loud errors": report to Sentry with context, then THROW.
  // The old behavior (console.error + return []/null) rendered failures
  // as empty lists and silently-dropped saves.
  function fail(op: DataOp, detail: string, workspaceId: string, cause?: unknown): never {
    const err = new DataError(op, table as string, detail, { workspaceId, cause });
    reportError(err, { table, op, workspaceId, cause });
    throw err;
  }

  return {
    async list(workspaceId, filters) {
      if (!supabase) fail("list", "no database connection (live mode without Supabase client)", workspaceId);
      let query = supabase.from(table as string).select("*").eq("workspace_id", workspaceId);
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          query = query.eq(k, v as string);
        }
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) fail("list", error.message, workspaceId, error);
      return (data ?? []) as T[];
    },

    async listPaged(workspaceId, opts = {}) {
      if (!supabase) fail("list", "no database connection (live mode without Supabase client)", workspaceId);
      const { page, pageSize } = clampPage(opts);
      let query = supabase
        .from(table as string)
        .select("*", { count: "exact" })
        .eq("workspace_id", workspaceId);
      if (opts.filters) {
        for (const [k, v] of Object.entries(opts.filters)) {
          query = Array.isArray(v) ? query.contains(k, v) : query.eq(k, v as string);
        }
      }
      const term = opts.search?.term.trim().replace(/[,()%]/g, "") ?? "";
      if (opts.search && term) {
        query = query.or(opts.search.columns.map((c) => `${c}.ilike.%${term}%`).join(","));
      }
      const { data, error, count } = await query
        .order(opts.orderBy ?? "created_at", { ascending: opts.ascending ?? false })
        .range(page * pageSize, page * pageSize + pageSize - 1);
      if (error) fail("list", error.message, workspaceId, error);
      return { rows: (data ?? []) as T[], total: count ?? 0, page, pageSize };
    },

    async get(workspaceId, id) {
      if (!supabase) fail("get", "no database connection (live mode without Supabase client)", workspaceId);
      const { data, error } = await supabase
        .from(table as string)
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("id", id)
        .maybeSingle();
      // Not-found is a legitimate result (pages branch on null), not a failure.
      if (error) fail("get", error.message, workspaceId, error);
      return (data ?? null) as T | null;
    },

    async create(workspaceId, payload) {
      if (!supabase) fail("create", "no database connection (live mode without Supabase client)", workspaceId);
      guardWrite("create", table as string, payload as Record<string, unknown>, workspaceId);
      const { data, error } = await supabase
        .from(table as string)
        .insert({ ...payload, workspace_id: workspaceId } as never)
        .select()
        .single();
      if (error) fail("create", error.message, workspaceId, error);
      return data as T;
    },

    async update(workspaceId, id, payload) {
      if (!supabase) fail("update", "no database connection (live mode without Supabase client)", workspaceId);
      guardWrite("update", table as string, payload as Record<string, unknown>, workspaceId);
      const { data, error } = await supabase
        .from(table as string)
        .update({ ...payload, updated_at: new Date().toISOString() } as never)
        .eq("workspace_id", workspaceId)
        .eq("id", id)
        .select()
        .single();
      // .single() errors when 0 rows matched — that means the write DIDN'T
      // happen (bad id or RLS), which callers must hear about loudly.
      if (error) fail("update", error.message, workspaceId, error);
      return data as T;
    },

    async remove(workspaceId, id) {
      if (!supabase) fail("remove", "no database connection (live mode without Supabase client)", workspaceId);
      const { error } = await supabase
        .from(table as string)
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("id", id);
      if (error) fail("remove", error.message, workspaceId, error);
      return true;
    },
  };
}

// ─── Demo adapters (wrap static data as async) ────────────

/** Resolve a column value on a demo row; supports "metadata->>key" jsonb paths. */
function demoCol(row: Record<string, unknown>, col: string): unknown {
  const jsonb = col.match(/^(\w+)->>(\w+)$/);
  if (jsonb) {
    const outer = row[jsonb[1]];
    return outer && typeof outer === "object" ? (outer as Record<string, unknown>)[jsonb[2]] : undefined;
  }
  return row[col];
}

function makeDemoAdapter<T>(loader: () => T[], table = "demo"): EntityAdapter<T> {
  return {
    async list() { return loader(); },

    // Mirrors the Supabase listPaged semantics so pages behave identically
    // in demo and live mode (filters → eq/contains, search → OR ilike).
    async listPaged(_ws, opts = {}) {
      const { page, pageSize } = clampPage(opts);
      let rows = loader() as Array<Record<string, unknown>>;
      if (opts.filters) {
        rows = rows.filter((r) => Object.entries(opts.filters!).every(([k, v]) =>
          Array.isArray(v)
            ? Array.isArray(r[k]) && v.every((x) => (r[k] as unknown[]).includes(x))
            : r[k] === v));
      }
      const term = opts.search?.term.trim().toLowerCase() ?? "";
      if (opts.search && term) {
        rows = rows.filter((r) => opts.search!.columns.some((c) => {
          const v = demoCol(r, c);
          return typeof v === "string" && v.toLowerCase().includes(term);
        }));
      }
      const ob = opts.orderBy ?? "created_at";
      const asc = opts.ascending ?? false;
      // Plain <> comparison, NOT localeCompare: ISO dates/codes compare
      // correctly bytewise, and ICU collation is ~50x slower — it turned
      // the 100k load-test sort into seconds.
      rows = [...rows].sort((a, b) => {
        const av = a[ob], bv = b[ob];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        let cmp: number;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else { const as = String(av), bs = String(bv); cmp = as < bs ? -1 : as > bs ? 1 : 0; }
        return asc ? cmp : -cmp;
      });
      return {
        rows: rows.slice(page * pageSize, (page + 1) * pageSize) as T[],
        total: rows.length,
        page,
        pageSize,
      };
    },
    async get(_ws, id) { return loader().find((r: unknown) => (r as { id: string }).id === id) ?? null; },
    async create(ws, data) {
      guardWrite("create", table, data as Record<string, unknown>, ws);
      console.warn("[DS] Demo mode — create is ephemeral");
      return { ...data, id: `demo-${Date.now()}` } as T;
    },
    async update(ws, _id, data) {
      guardWrite("update", table, data as Record<string, unknown>, ws);
      console.warn("[DS] Demo mode — update is ephemeral");
      return data as T;
    },
    async remove() {
      console.warn("[DS] Demo mode — delete is ephemeral");
      return true;
    },
  };
}

// ─── DataSource interface ──────────────────────────────────

export interface DataSource {
  mode: "demo" | "live";
  deals:           EntityAdapter<Tables["deals"]["Row"]>;
  invoices:        EntityAdapter<Tables["invoices"]["Row"]>;
  payments:        EntityAdapter<Tables["payments"]["Row"]>;
  expenses:        EntityAdapter<Tables["expenses"]["Row"]>;
  people:          EntityAdapter<Tables["people"]["Row"]>;
  organizations:   EntityAdapter<Tables["organizations"]["Row"]>;
  work_items:      EntityAdapter<Tables["work_items"]["Row"]>;
  resources:       EntityAdapter<Tables["resources"]["Row"]>;
  activity_events: EntityAdapter<Tables["activity_events"]["Row"]>;
  site_visits: EntityAdapter<Tables["site_visits"]["Row"]>;
  measurements: EntityAdapter<Tables["measurements"]["Row"]>;
  measurement_attachments: EntityAdapter<Tables["measurement_attachments"]["Row"]>;
  design_briefs: EntityAdapter<Tables["design_briefs"]["Row"]>;
  design_files: EntityAdapter<Tables["design_files"]["Row"]>;
  design_comments: EntityAdapter<Tables["design_comments"]["Row"]>;
  production_orders: EntityAdapter<Tables["production_orders"]["Row"]>;
  cutting_list_items: EntityAdapter<Tables["cutting_list_items"]["Row"]>;
  production_stage_log: EntityAdapter<Tables["production_stage_log"]["Row"]>;
  qc_inspections: EntityAdapter<Tables["qc_inspections"]["Row"]>;
  qc_defects: EntityAdapter<Tables["qc_defects"]["Row"]>;
  deliveries: EntityAdapter<Tables["deliveries"]["Row"]>;
  installations: EntityAdapter<Tables["installations"]["Row"]>;
  employees: EntityAdapter<Tables["employees"]["Row"]>;
  attendance: EntityAdapter<Tables["attendance"]["Row"]>;
  leave_requests: EntityAdapter<Tables["leave_requests"]["Row"]>;
  cost_entries: EntityAdapter<Tables["cost_entries"]["Row"]>;
  branches: EntityAdapter<Tables["branches"]["Row"]>;
  material_requirements: EntityAdapter<Tables["material_requirements"]["Row"]>;
  pos_registers: EntityAdapter<Tables["pos_registers"]["Row"]>;
  pos_transactions: EntityAdapter<Tables["pos_transactions"]["Row"]>;
  pos_transaction_items: EntityAdapter<Tables["pos_transaction_items"]["Row"]>;
  branch_inventory: EntityAdapter<Tables["branch_inventory"]["Row"]>;
  stock_movements: EntityAdapter<any>;
  workspace_invitations: EntityAdapter<any>;
  notifications: EntityAdapter<any>;
}

// ─── Load-test seed (H2 proof) ─────────────────────────────
// Set localStorage.thoth_loadtest = "100000" and reload: demo mode then
// backs work_items with N synthetic stock movements, so pagination can be
// proven against a realistic volume without a live database.

type WorkRow = Tables["work_items"]["Row"];

let loadTestCache: { n: number; rows: WorkRow[] } | null = null;

function loadTestRows(): WorkRow[] {
  const n = typeof localStorage === "undefined"
    ? 0
    : Math.min(500_000, parseInt(localStorage.getItem("thoth_loadtest") || "0", 10) || 0);
  if (n <= 0) return [];
  if (loadTestCache?.n !== n) {
    const now = Date.now();
    const rows: WorkRow[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const inbound = i % 3 !== 0;
      rows[i] = {
        id: `loadtest-${i}`,
        workspace_id: "demo",
        title_en: `${inbound ? "Stock In" : "Stock Out"}: Load Test Item #${i % 500} (${(i % 20) + 1})`,
        title_ar: `${inbound ? "إدخال" : "إخراج"}: صنف اختبار #${i % 500}`,
        type: "stock_movement",
        status: "done",
        priority: "medium",
        progress: 100,
        tags: ["inventory"],
        metadata: {
          resource_name: `Load Test Item #${i % 500}`,
          move_qty: (i % 20) + 1,
          move_type: inbound ? "stock_in" : "stock_out",
          from_location: inbound ? null : "Main Warehouse",
          to_location: inbound ? "Main Warehouse" : null,
        },
        created_at: new Date(now - i * 60_000).toISOString(),
        updated_at: new Date(now - i * 60_000).toISOString(),
      } as unknown as WorkRow;
    }
    loadTestCache = { n, rows };
  }
  return loadTestCache.rows;
}

// ─── Demo DataSource ───────────────────────────────────────

const demoDataSource: DataSource = {
  mode: "demo",
  deals:           makeDemoAdapter(convertDeals),
  invoices:        makeDemoAdapter(convertInvoices),
  payments:        makeDemoAdapter(convertPayments),
  expenses:        makeDemoAdapter(convertExpenses),
  people:          makeDemoAdapter(convertPeople),
  organizations:   makeDemoAdapter(() => [...convertOrganizations(), ...DEMO_VENDORS]),
  resources:       makeDemoAdapter(() => [...convertResources(), ...DEMO_INVENTORY, ...DEMO_PRODUCTS]),
  work_items:      makeDemoAdapter(() => [...convertWorkItems(), ...DEMO_SALES_ORDERS, ...DEMO_QUOTATIONS, ...DEMO_PURCHASE_ITEMS, ...DEMO_STOCK_MOVEMENTS, ...DEMO_MAINTENANCE, ...loadTestRows()], "work_items"),
  activity_events: makeDemoAdapter(() => DEMO_ACTIVITY_EVENTS),
  site_visits: makeDemoAdapter(() => DEMO_SITE_VISITS),
  measurements: makeDemoAdapter(() => DEMO_MEASUREMENTS),
  measurement_attachments: makeDemoAdapter(() => []),
  design_briefs: makeDemoAdapter(() => DEMO_DESIGN_BRIEFS),
  design_files: makeDemoAdapter(() => DEMO_DESIGN_FILES),
  design_comments: makeDemoAdapter(() => DEMO_DESIGN_COMMENTS),
  production_orders: makeDemoAdapter(() => DEMO_PRODUCTION_ORDERS),
  cutting_list_items: makeDemoAdapter(() => DEMO_CUTTING_ITEMS),
  production_stage_log: makeDemoAdapter(() => DEMO_STAGE_LOG),
  qc_inspections: makeDemoAdapter(() => DEMO_QC_INSPECTIONS),
  qc_defects: makeDemoAdapter(() => DEMO_QC_DEFECTS),
  deliveries: makeDemoAdapter(() => DEMO_DELIVERIES),
  installations: makeDemoAdapter(() => DEMO_INSTALLATIONS),
  employees: makeDemoAdapter(() => DEMO_EMPLOYEES),
  attendance: makeDemoAdapter(() => DEMO_ATTENDANCE),
  leave_requests: makeDemoAdapter(() => DEMO_LEAVE_REQUESTS),
  cost_entries: makeDemoAdapter(() => DEMO_COST_ENTRIES, "cost_entries"),
  branches: makeDemoAdapter(() => DEMO_BRANCHES),
  material_requirements: makeDemoAdapter(() => DEMO_MATERIAL_REQUIREMENTS),
  pos_registers: makeDemoAdapter(() => DEMO_POS_REGISTERS),
  pos_transactions: makeDemoAdapter(() => DEMO_POS_TRANSACTIONS, "pos_transactions"),
  pos_transaction_items: makeDemoAdapter(() => DEMO_POS_TXN_ITEMS, "pos_transaction_items"),
  branch_inventory: makeDemoAdapter(() => DEMO_BRANCH_INVENTORY),
  stock_movements: makeDemoAdapter(() => []),
  workspace_invitations: makeDemoAdapter(() => []),
  notifications: makeDemoAdapter(() => []),
};

// ─── Live DataSource ───────────────────────────────────────

const liveDataSource: DataSource = {
  mode: "live",
  deals:           makeSupabaseAdapter("deals"),
  invoices:        makeSupabaseAdapter("invoices"),
  payments:        makeSupabaseAdapter("payments"),
  expenses:        makeSupabaseAdapter("expenses"),
  people:          makeSupabaseAdapter("people"),
  organizations:   makeSupabaseAdapter("organizations"),
  work_items:      makeSupabaseAdapter("work_items"),
  resources:       makeSupabaseAdapter("resources"),
  activity_events: makeSupabaseAdapter("activity_events"),
  site_visits: makeSupabaseAdapter("site_visits"),
  measurements: makeSupabaseAdapter("measurements"),
  measurement_attachments: makeSupabaseAdapter("measurement_attachments"),
  design_briefs: makeSupabaseAdapter("design_briefs"),
  design_files: makeSupabaseAdapter("design_files"),
  design_comments: makeSupabaseAdapter("design_comments"),
  production_orders: makeSupabaseAdapter("production_orders"),
  cutting_list_items: makeSupabaseAdapter("cutting_list_items"),
  production_stage_log: makeSupabaseAdapter("production_stage_log"),
  qc_inspections: makeSupabaseAdapter("qc_inspections"),
  qc_defects: makeSupabaseAdapter("qc_defects"),
  deliveries: makeSupabaseAdapter("deliveries"),
  installations: makeSupabaseAdapter("installations"),
  employees: makeSupabaseAdapter("employees"),
  attendance: makeSupabaseAdapter("attendance"),
  leave_requests: makeSupabaseAdapter("leave_requests"),
  cost_entries: makeSupabaseAdapter("cost_entries"),
  branches: makeSupabaseAdapter("branches"),
  material_requirements: makeSupabaseAdapter("material_requirements"),
  pos_registers: makeSupabaseAdapter("pos_registers"),
  pos_transactions: makeSupabaseAdapter("pos_transactions"),
  pos_transaction_items: makeSupabaseAdapter("pos_transaction_items"),
  branch_inventory: makeSupabaseAdapter("branch_inventory"),
  stock_movements: makeSupabaseAdapter("stock_movements" as never),
  workspace_invitations: makeSupabaseAdapter("workspace_invitations" as never),
  notifications: makeSupabaseAdapter("notifications" as never),
};

// ─── Public API ────────────────────────────────────────────

export function getDataSource(): DataSource {
  return isDemoMode ? demoDataSource : liveDataSource;
}

export { isDemoMode };
