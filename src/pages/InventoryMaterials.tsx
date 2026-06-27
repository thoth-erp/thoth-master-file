/**
 * Materials Inventory — Non-fabric materials management
 *
 * إدارة المواد — صفحة إدارة المواد غير الأقمشة (خيوط، أزرار، سحابات، إلخ)
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getDataSource } from "../lib/data-source";
import { exportCSV } from "../lib/csv-export";
import { generateCode, type CodeSettings, loadCodeSettings } from "../lib/code-generator";
import type { Database } from "../lib/database.types";
import {
  Package, Plus, Search, X, Loader2, Download, ArrowLeft,
  AlertTriangle, TrendingUp, Edit3, Trash2, Upload,
  Scissors, Tag, Box, Truck, Sparkles, Filter,
} from "lucide-react";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { CsvImport } from "../components/CsvImport";
import { type ImportTemplate } from "../lib/csv-export";

type Resource = Database["public"]["Tables"]["resources"]["Row"];

const inputCls = "w-full h-10 rounded-xl border border-border/60 bg-background px-3.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition placeholder:text-muted-foreground/50";
const selectCls = inputCls + " appearance-none cursor-pointer";
const labelCls = "text-[11px] font-medium text-muted-foreground mb-1 block";
const btnPrimary = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50";
const btnSecondary = "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/60 text-[11px] font-medium px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors";

const MATERIAL_CATEGORIES = [
  { value: "thread", en: "Thread & Yarn", ar: "خيوط", icon: Scissors, color: "bg-blue-100 text-blue-600" },
  { value: "buttons", en: "Buttons & Snaps", ar: "أزرار", icon: Tag, color: "bg-amber-100 text-amber-700" },
  { value: "zippers", en: "Zippers", ar: "سحابات", icon: Box, color: "bg-violet-100 text-violet-600" },
  { value: "lining", en: "Lining", ar: "بطانة", icon: Package, color: "bg-emerald-100 text-emerald-700" },
  { value: "elastic", en: "Elastic", ar: "مرونة", icon: Sparkles, color: "bg-rose-100 text-rose-600" },
  { value: "labels", en: "Labels & Tags", ar: "مُلصقات", icon: Tag, color: "bg-cyan-100 text-cyan-700" },
  { value: "packaging", en: "Packaging", ar: "تغليف", icon: Truck, color: "bg-orange-100 text-orange-600" },
  { value: "notions", en: "Notions & Trims", ar: "تطريز وتشطيب", icon: Sparkles, color: "bg-pink-100 text-pink-600" },
  { value: "chemicals", en: "Chemicals & Dyes", ar: "صبغات وكيميائيات", icon: Package, color: "bg-indigo-100 text-indigo-600" },
  { value: "other", en: "Other", ar: "أخرى", icon: Package, color: "bg-slate-100 text-slate-600" },
];

const UOMS = ["pcs", "box", "set", "kg", "roll", "sheet", "pack", "pair"];

interface MaterialMeta {
  sku?: string;
  category?: string;
  quantity?: number;
  uom?: string;
  unit_cost?: number;
  supplier?: string;
  brand?: string;
  reorder_level?: number;
  max_level?: number;
  location?: string;
  inv_status?: string;
  color?: string;
}

function getMatMeta(r: Resource): MaterialMeta {
  const m = (r.metadata ?? {}) as Record<string, unknown>;
  return {
    sku: m.sku as string, category: m.category as string,
    quantity: m.quantity as number, uom: m.uom as string,
    unit_cost: m.unit_cost as number, supplier: m.supplier as string,
    brand: m.brand as string, reorder_level: m.reorder_level as number,
    max_level: m.max_level as number, location: m.location as string,
    inv_status: m.inv_status as string, color: m.color as string,
  };
}

function computeStatus(qty: number, reorder: number): string {
  if (qty <= 0) return "out_of_stock";
  if (qty <= reorder) return "low_stock";
  return "in_stock";
}

export default function InventoryMaterialsPage() {
  const { lang } = useLanguage();
  const { workspace } = useAuth();
  const ar = lang === "ar";
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Resource | null>(null);
  const [deleteItem, setDeleteItem] = useState<Resource | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [codeSettings] = useState<CodeSettings>(() => loadCodeSettings());

  useEffect(() => { loadMaterials(); }, []);

  async function loadMaterials() {
    setLoading(true);
    try {
      const ds = getDataSource(workspace?.id || "demo");
      const all = await ds.resources.list();
      setItems(all.filter(r => r.type === "inventory" && (r.skills ?? []).includes("inventory")));
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return items.filter(r => {
      const m = getMatMeta(r);
      if (search) {
        const q = search.toLowerCase();
        if (!r.name_en.toLowerCase().includes(q) && !(m.sku ?? "").toLowerCase().includes(q)) return false;
      }
      if (filterCategory && m.category !== filterCategory) return false;
      return true;
    });
  }, [items, search, filterCategory]);

  const stats = useMemo(() => {
    let totalValue = 0, lowStock = 0, categories = new Set<string>();
    items.forEach(r => {
      const m = getMatMeta(r);
      totalValue += (m.quantity ?? 0) * (m.unit_cost ?? 0);
      if (computeStatus(m.quantity ?? 0, m.reorder_level ?? 0) === "low_stock") lowStock++;
      if (m.category) categories.add(m.category);
    });
    return { totalValue, lowStock, total: items.length, categories: categories.size };
  }, [items]);

  const matImportTemplate: ImportTemplate = {
    name: "materials",
    columns: [
      { key: "name", label: "Name", required: true },
      { key: "sku", label: "SKU" },
      { key: "category", label: "Category", required: true },
      { key: "quantity", label: "Quantity", type: "number", required: true },
      { key: "uom", label: "Unit (pcs/box/kg)" },
      { key: "unit_cost", label: "Unit Cost", type: "number" },
      { key: "supplier", label: "Supplier" },
      { key: "brand", label: "Brand" },
      { key: "location", label: "Location" },
    ],
  };

  async function handleImport(rows: Record<string, unknown>[]) {
    const ds = getDataSource(workspace?.id || "demo");
    for (const row of rows) {
      await ds.resources.create({
        name_en: String(row.name || ""),
        type: "inventory",
        skills: ["inventory"],
        metadata: {
          sku: row.sku || generateCode("product", codeSettings),
          category: row.category || "other",
          quantity: row.quantity || 0,
          uom: row.uom || "pcs",
          unit_cost: row.unit_cost || 0,
          supplier: row.supplier || "",
          brand: row.brand || "",
          location: row.location || "",
          reorder_level: 0,
          inv_status: "in_stock",
        },
      });
    }
    loadMaterials();
  }

  function handleDelete() {
    if (!deleteItem) return;
    const ds = getDataSource(workspace?.id || "demo");
    ds.resources.delete(deleteItem.id).then(() => {
      setItems(prev => prev.filter(i => i.id !== deleteItem.id));
      setDeleteItem(null);
    });
  }

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(r => {
      const m = getMatMeta(r);
      const cat = m.category || "other";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return MATERIAL_CATEGORIES.map(c => ({ ...c, count: map.get(c.value) || 0 })).filter(c => c.count > 0);
  }, [items]);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href="/inventory" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-[22px] font-semibold flex items-center gap-2.5" style={{ fontFamily: "var(--app-font-serif)" }}>
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Scissors size={16} className="text-blue-600" />
                </div>
                {ar ? "المواد" : "Materials"}
              </h1>
              <p className="text-[13px] text-muted-foreground mt-1 ml-[46px]">
                {ar ? `${items.length} مادة` : `${items.length} material types`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)} className={btnSecondary}><Upload size={13} />{ar ? "استيراد" : "Import"}</button>
            <button onClick={() => exportCSV(items.map(r => { const m = getMatMeta(r); return { Name: r.name_en, SKU: m.sku, Category: m.category, Quantity: m.quantity, Cost: m.unit_cost, Supplier: m.supplier }; }), "materials-export")} className={btnSecondary}><Download size={13} />{ar ? "تصدير" : "Export"}</button>
            <button onClick={() => setShowCreate(true)} className={btnPrimary}><Plus size={14} />{ar ? "إضافة مادة" : "Add Material"}</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: ar ? "إجمالي" : "Total Items", value: stats.total, color: "bg-blue-100 text-blue-600" },
            { label: ar ? "الفئات" : "Categories", value: stats.categories, color: "bg-violet-100 text-violet-600" },
            { label: ar ? "كمية قليلة" : "Low Stock", value: stats.lowStock, color: "bg-amber-100 text-amber-700" },
            { label: ar ? "القيمة" : "Total Value", value: stats.totalValue.toLocaleString(), color: "bg-emerald-100 text-emerald-700" },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/40 bg-background">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color} mb-2`}>
                <Package size={13} />
              </div>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className="text-[18px] font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Category quick filters */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterCategory("")} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${!filterCategory ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
            {ar ? "الكل" : "All"}
          </button>
          {categoryStats.map(c => {
            const Icon = c.icon;
            return (
              <button key={c.value} onClick={() => setFilterCategory(c.value === filterCategory ? "" : c.value)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${filterCategory === c.value ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                <Icon size={11} />
                {ar ? c.ar : c.en}
                <span className="opacity-60">({c.count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-[300px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={ar ? "بحث في المواد..." : "Search materials..."} className={inputCls + " h-9 pl-9 text-[12px]"} />
        </div>

        {/* Materials List */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={20} className="animate-spin text-muted-foreground/40" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-[14px] text-muted-foreground">{ar ? "لا توجد مواد" : "No materials found"}</p>
          </div>
        ) : (
          <div className="bg-background border border-border/40 rounded-xl overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{ar ? "الاسم" : "Name"}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{ar ? "الفئة" : "Category"}</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">{ar ? "الكمية" : "Qty"}</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">{ar ? "التكلفة" : "Cost"}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{ar ? "المورد" : "Supplier"}</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">{ar ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(r => {
                  const m = getMatMeta(r);
                  const status = computeStatus(m.quantity ?? 0, m.reorder_level ?? 0);
                  const catDef = MATERIAL_CATEGORIES.find(c => c.value === m.category);
                  return (
                    <tr key={r.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setEditItem(r)}>
                      <td className="px-4 py-3 font-medium">{r.name_en}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{m.sku || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${catDef?.color || "bg-slate-100 text-slate-600"}`}>
                          {catDef ? (ar ? catDef.ar : catDef.en) : m.category || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{m.quantity ?? 0} {m.uom || ""}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{(m.unit_cost ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.supplier || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status === "out_of_stock" ? "bg-rose-100 text-rose-600" : status === "low_stock" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {status === "out_of_stock" ? (ar ? "نفذ" : "Out") : status === "low_stock" ? (ar ? "قليل" : "Low") : (ar ? "متوفر" : "OK")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={e => { e.stopPropagation(); setEditItem(r); }} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted"><Edit3 size={11} /></button>
                          <button onClick={e => { e.stopPropagation(); setDeleteItem(r); }} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-rose-50 text-rose-500"><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showImport && <CsvImport open={showImport} onClose={() => setShowImport(false)} template={matImportTemplate} adapter={getDataSource(workspace?.id || "demo").resources} ar={ar} onComplete={() => { setShowImport(false); loadMaterials(); }} />}
      {deleteItem && <ConfirmDeleteModal onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} ar={ar} title={ar ? "حذف المادة" : "Delete Material"} description={ar ? `هل تريد حذف "${deleteItem.name_en}"؟` : `Delete "${deleteItem.name_en}"?`} />}
    </div>
  );
}
