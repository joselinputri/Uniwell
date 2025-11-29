import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  Camera,
  Filter,
  Pencil,
  Trash2,
  Search,
  UtensilsCrossed,
  GraduationCap,
  Home,
  Bus,
  Package,
  Heart,
  Sparkles,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { expensesAPI } from "@/services/api";

type ExpenseCategory =
  | "Food"
  | "Academic"
  | "Lifestyle"
  | "Transport"
  | "Others"
  | "Health"
  | "Entertainment";

interface Expense {
  id: number | string;
  amount: number;
  merchant: string;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
}

const CATEGORY_OPTIONS: ExpenseCategory[] = ["Food","Academic","Lifestyle","Transport","Others","Health","Entertainment"];
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "hsl(var(--category-food))",
  Academic: "hsl(var(--category-academic))",
  Lifestyle: "hsl(var(--category-lifestyle))",
  Transport: "hsl(var(--category-transport))",
  Others: "hsl(var(--category-others))",
  Health: "hsl(var(--category-health))",
  Entertainment: "hsl(var(--category-entertainment))",
};
const CATEGORY_ICONS: Record<ExpenseCategory, React.ElementType> = {
  Food: UtensilsCrossed, Academic: GraduationCap, Lifestyle: Home, Transport: Bus, Others: Package, Health: Heart, Entertainment: Sparkles,
};

const Finance = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "All">("All");
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ merchant: "", amount: "", category: "Food" as ExpenseCategory, date: new Date().toISOString().split("T")[0] });

  const normalizeExpense = (e: any): Expense => {
    const categoryValid = CATEGORY_OPTIONS.includes(e.category) ? e.category : "Others";
    return {
      id: e.id ?? e._id ?? `${Date.now()}-${Math.random()}`,
      amount: Number(e.amount) || 0,
      merchant: e.merchant ?? "",
      category: categoryValid as ExpenseCategory,
      date: e.date ? String(e.date).split("T")[0] : new Date().toISOString().split("T")[0],
    };
  };

  const refreshExpenses = useCallback(async () => {
    try {
      const res = await expensesAPI.getAll();
      const listRaw: any[] = (res?.data?.data ?? res?.data ?? []);
      // normalize & dedupe by id or composite merchant|amount|date
      const seen = new Map<string, Expense>();
      const normalized = listRaw.map(normalizeExpense);
      for (const e of normalized) {
        const idKey = String(e.id);
        const composite = `${(e.merchant||"").toLowerCase().trim()}|${Number(e.amount)||0}|${e.date}`;
        if (e.id && !seen.has(idKey)) seen.set(idKey, e);
        else if (!seen.has(composite)) seen.set(composite, e);
      }
      setExpenses(Array.from(seen.values()));
    } catch (err) {
      console.warn("Failed to refresh expenses", err);
    }
  }, []);

  useEffect(() => {
    refreshExpenses();
    const onUpdated = () => refreshExpenses();
    window.addEventListener("expensesUpdated", onUpdated);
    return () => window.removeEventListener("expensesUpdated", onUpdated);
  }, [refreshExpenses]);

  const thisMonthTotal = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses]);

  const categoryTotals = useMemo(() => {
    const base: Record<ExpenseCategory, number> = { Food:0, Academic:0, Lifestyle:0, Transport:0, Others:0, Health:0, Entertainment:0 };
    expenses.forEach((exp) => base[exp.category] += Number(exp.amount) || 0);
    return base;
  }, [expenses]);

  const topCategory = useMemo(() => CATEGORY_OPTIONS.reduce((best, cat) => (categoryTotals[cat] > best.amount ? {name:cat, amount:categoryTotals[cat]} : best), { name: "Food" as ExpenseCategory, amount: 0 }), [categoryTotals]);

  const dailyAverage = Math.round(thisMonthTotal / 30);
  const totalForPie = Object.values(categoryTotals).reduce((s, v) => s + v, 0) || 1;
  const pieData = CATEGORY_OPTIONS.map((name) => ({ name, value: categoryTotals[name], percentage: Math.round(((categoryTotals[name] / totalForPie) * 100 + Number.EPSILON) * 10) / 10 })).filter(d => d.value > 0);

  const filteredExpenses = useMemo(() => expenses.filter(exp => categoryFilter === "All" ? true : exp.category === categoryFilter).filter(exp => { if (!searchText.trim()) return true; const merchant = exp.merchant || ""; return merchant.toLowerCase().includes(searchText.toLowerCase()); }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [expenses, categoryFilter, searchText]);

  const formatRupiah = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

  const resetForm = () => {
    setForm({ merchant: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0] });
    setFormMode("add"); setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(form.amount);
    if (!form.merchant || !amountNum) { toast({ title: "Incomplete data", description: "Please fill merchant and amount.", variant: "destructive" }); return; }
    const payload = { merchant: form.merchant, amount: amountNum, category: form.category, date: form.date };
    if (formMode === "add") {
      try {
        const res = await expensesAPI.create(payload);
        const created = normalizeExpense(res?.data ?? res?.data?.data ?? payload);
        setExpenses(prev => [created, ...prev]);
        window.dispatchEvent(new Event("expensesUpdated"));
        toast({ title: "Expense added", description: "New expense saved." });
      } catch (err) {
        setExpenses(prev => [normalizeExpense(payload), ...prev]);
        toast({ title: "Expense added (offline)" });
      }
    } else if (editingId != null) {
      setExpenses(prev => prev.map(exp => exp.id === editingId ? { ...exp, merchant: form.merchant, amount: amountNum, category: form.category, date: form.date } : exp));
      try { await expensesAPI.update(editingId, payload); window.dispatchEvent(new Event("expensesUpdated")); } catch {}
      toast({ title: "Expense updated" });
    }
    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setFormMode("edit");
    setEditingId(Number(expense.id));
    setForm({ merchant: expense.merchant, amount: String(expense.amount), category: expense.category, date: expense.date });
  };

  const handleDelete = async (id: number | string) => {
    try {
      await expensesAPI.remove(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      window.dispatchEvent(new Event("expensesUpdated"));
      toast({ title: "Expense deleted" });
    } catch {
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast({ title: "Expense deleted" });
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-32 bg-gradient-to-br from-background via-wellness-peach/10 to-wellness-pink/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1"><span className="bg-gradient-to-r from-wellness-orange to-wellness-pink bg-clip-text text-transparent">Finance Tracker</span></h1>
            <p className="text-muted-foreground">Track your expenses & budget</p>
          </div>
          <Link to="/upload-receipt"><Button className="mt-2 md:mt-0 rounded-full bg-gradient-to-r from-wellness-pink to-wellness-rose text-white px-4 md:px-6"><Camera className="w-4 h-4 mr-2" />Smart Receipt Scanner</Button></Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="card-wellness text-center bg-gradient-to-br from-wellness-teal/10 to-wellness-mint/10"><div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"><Wallet className="w-6 h-6 text-white" /></div><p className="text-sm text-muted-foreground mb-1">This Month</p><p className="text-xl font-bold">{formatRupiah(thisMonthTotal)}</p><p className="text-xs text-muted-foreground mt-1">Total expenses</p></div>
          <div className="card-wellness text-center bg-gradient-to-br from-wellness-orange/10 to-wellness-peach/10"><div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"><TrendingDown className="w-6 h-6 text-white" /></div><p className="text-sm text-muted-foreground mb-1">Top Category</p><p className="text-xl font-bold">{topCategory.name}</p><p className="text-xs text-muted-foreground mt-1">{formatRupiah(topCategory.amount)}</p></div>
          <div className="card-wellness text-center bg-gradient-to-br from-wellness-lavender/10 to-wellness-pink/10"><div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"><PieChartIcon className="w-6 h-6 text-white" /></div><p className="text-sm text-muted-foreground mb-1">Daily Average</p><p className="text-xl font-bold">{formatRupiah(dailyAverage)}</p><p className="text-xs text-muted-foreground mt-1">Per day</p></div>
        </motion.div>

        {/* Filters & Add Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card-wellness mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 relative"><Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search merchant..." className="pl-9 rounded-full" value={searchText} onChange={(e) => setSearchText(e.target.value)} /></div>
            <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground hidden md:block" /><Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val as ExpenseCategory | "All")}><SelectTrigger className="w-[150px] rounded-full"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="All">All Categories</SelectItem>{CATEGORY_OPTIONS.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-[2fr,1fr,1fr,auto] gap-3 items-center">
            <Input placeholder="Merchant / description" className="rounded-xl" value={form.merchant} onChange={(e) => setForm(f => ({...f, merchant: e.target.value}))} />
            <Input type="number" placeholder="Amount (Rp)" className="rounded-xl" value={form.amount} onChange={(e) => setForm(f => ({...f, amount: e.target.value}))} min={0} />
            <Select value={form.category} onValueChange={(val) => setForm(f => ({...f, category: val as ExpenseCategory}))}><SelectTrigger className="rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select>
            <div className="flex gap-2"><Input type="date" className="rounded-xl" value={form.date} onChange={(e) => setForm(f => ({...f, date: e.target.value}))} /><Button type="submit" className="rounded-xl bg-gradient-to-r from-wellness-teal to-wellness-mint text-white px-4">{formMode==="add" ? "+" : "✓"}</Button></div>
          </form>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-wellness">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {filteredExpenses.length === 0 ? <p className="text-sm text-muted-foreground">No expenses found. Try changing the filter or add a new expense.</p> : <div className="space-y-3">{filteredExpenses.map((expense, index) => {
            const CategoryIcon = CATEGORY_ICONS[expense.category];
            return (
              <motion.div key={expense.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + index * 0.05, type: "spring", stiffness: 260, damping: 20 }} whileHover={{ scale: 1.01, y: -2 }} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20 transition-all shadow-sm">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + index * 0.05 }} className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}30` }}>
                  <CategoryIcon className="w-6 h-6" style={{ color: CATEGORY_COLORS[expense.category] }} />
                </motion.div>
                <div className="flex-1 min-w-0"><p className="font-semibold mb-1 truncate">{expense.merchant}</p><div className="flex items-center gap-2 flex-wrap text-xs"><span className="px-2 py-1 rounded-lg font-medium capitalize" style={{ backgroundColor: `${CATEGORY_COLORS[expense.category ?? "Others"]}15`, color: CATEGORY_COLORS[expense.category ?? "Others"] }}>{(expense.category ?? "Others").toLowerCase()}</span><span className="text-muted-foreground">{new Date(expense.date).toLocaleDateString("id-ID",{ day: "numeric", month: "short" })}</span></div></div>
                <div className="flex items-center gap-3"><p className="text-lg font-bold text-wellness-pink whitespace-nowrap">{formatRupiah(expense.amount)}</p><motion.button type="button" aria-label="Edit expense" onClick={() => handleEdit(expense)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/50"><Pencil className="w-4 h-4" /></motion.button><motion.button type="button" aria-label="Delete expense" onClick={() => handleDelete(expense.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></motion.button></div>
              </motion.div>
            );
          })}</div>}
        </motion.div>
      </div>
      <Navigation />
    </div>
  );
};

export default Finance;