"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, ListOrdered, Pencil, Percent, Search, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Transaction {
  id: number;
  tanggal: string;
  waktu: string;
  bank: string;
  jenis: string;
  jumlah: number;
  keterangan: string;
  kategori: string;
}

interface TransactionsResponse {
  items: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

interface SummaryResponse {
  total_transaksi: number;
  total_pengeluaran: number;
}

interface CategorySummary {
  kategori: string;
  total: number;
  count: number;
}

interface MonthlySummary {
  month: string;
  total: number;
  count: number;
}

const categoryColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function ManaUangPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SummaryResponse>({ total_pengeluaran: 0, total_transaksi: 0 });
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 15;
  const [totalPages, setTotalPages] = useState(1);

  const [editItem, setEditItem] = useState<{ id: number; kategori: string } | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_MANA_UANG_API_BASE_URL?.replace(/\/$/, "");

  const getApiUrl = useCallback((path: string) => {
    if (apiBaseUrl) return `${apiBaseUrl}${path}`;
    if (typeof window !== "undefined") return `${window.location.protocol}//${window.location.hostname}:8089${path}`;
    return `http://localhost:8089${path}`;
  }, [apiBaseUrl]);

  const selectedMonthValue = selectedMonth === "all" ? "" : selectedMonth;
  const summaryQuery = selectedMonthValue ? `?month=${selectedMonthValue}` : "";
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const txParams = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (selectedMonthValue) txParams.set("month", selectedMonthValue);
      if (searchTerm) txParams.set("search", searchTerm);

      const [txRes, sumRes, catRes, monthRes] = await Promise.all([
        fetch(getApiUrl(`/api/transactions?${txParams.toString()}`)),
        fetch(getApiUrl(`/api/summary${summaryQuery}`)),
        fetch(getApiUrl(`/api/summary-by-category${summaryQuery}`)),
        fetch(getApiUrl("/api/summary-by-month")),
      ]);

      const txData: TransactionsResponse = await txRes.json();
      const sumData: SummaryResponse = await sumRes.json();
      const catData: CategorySummary[] = await catRes.json();
      const monthData: MonthlySummary[] = await monthRes.json();

      setTransactions(Array.isArray(txData.items) ? txData.items : []);
      setTotalPages(Math.max(1, Math.ceil((txData.total || 0) / limit)));
      setSummary(sumData);
      setCategorySummary(Array.isArray(catData) ? catData : []);
      setMonthlySummary(Array.isArray(monthData) ? monthData : []);
    } catch (error) {
      console.error("Error loading mana-uang data:", error);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl, limit, page, searchTerm, selectedMonthValue, summaryQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const monthlyOptions = useMemo(() => {
    return monthlySummary.map((item) => item.month);
  }, [monthlySummary]);

  const averagePerTransaction =
    summary.total_transaksi > 0 ? summary.total_pengeluaran / summary.total_transaksi : 0;

  const pieData = categorySummary.map((item) => ({
    name: item.kategori || "Lainnya",
    value: item.total,
  }));

  const handleCategoryUpdate = async () => {
    if (!editItem || !newCategory.trim()) return;
    try {
      const response = await fetch(getApiUrl(`/api/transactions/${editItem.id}/category`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kategori: newCategory.trim() }),
      });
      if (!response.ok) return;
      setEditItem(null);
      setNewCategory("");
      loadData();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Select
              value={selectedMonth}
              onValueChange={(value) => {
                if (!value) return;
                setSelectedMonth(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] rounded-xl border-border/80">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua bulan</SelectItem>
                {monthlyOptions.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="min-w-[200px] max-w-[320px] rounded-xl border-border/80 md:w-[280px]"
                placeholder="Cari keterangan atau jenis..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setPage(1);
                    setSearchTerm(searchInput.trim());
                  }
                }}
              />
              <Button
                variant="outline"
                className="rounded-xl border-border/80"
                onClick={() => {
                  setPage(1);
                  setSearchTerm(searchInput.trim());
                }}
              >
                <Search />
                Cari
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            className="rounded-xl text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSelectedMonth("all");
              setSearchInput("");
              setSearchTerm("");
              setPage(1);
            }}
          >
            Reset Filter
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Transaksi</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-800">
              <ListOrdered className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight">{summary.total_transaksi}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Pengeluaran</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-800">
              <Wallet className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {formatRupiah(summary.total_pengeluaran)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rata-rata per Transaksi</CardTitle>
            <div className="rounded-full bg-violet-100 p-2 text-violet-800">
              <Percent className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight">
            {formatRupiah(averagePerTransaction)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kategori Pengeluaran</CardTitle>
            <div className="rounded-full bg-violet-100 p-2 text-violet-800">
              <Wallet className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(Number(value) || 0)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Memuat chart...</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tren Bulanan</CardTitle>
            <div className="rounded-full bg-sky-100 p-2 text-sky-800">
              <BarChart3 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}jt`} />
                  <Tooltip formatter={(value) => formatRupiah(Number(value) || 0)} />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="var(--color-chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Memuat chart...</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Transaksi</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Halaman {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" className="rounded-xl border-border/80" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border/60 hover:bg-transparent">
                  <TableHead className="px-3">Tanggal</TableHead>
                  <TableHead className="px-3">Bank</TableHead>
                  <TableHead className="px-3">Jenis</TableHead>
                  <TableHead className="px-3">Keterangan</TableHead>
                  <TableHead className="px-3">Kategori</TableHead>
                  <TableHead className="px-3 text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading transaksi...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Tidak ada data transaksi.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/45"
                    >
                      <TableCell className="px-3">
                        <p>{item.tanggal}</p>
                        <p className="text-xs text-muted-foreground">{item.waktu}</p>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant="secondary" className="border-0 bg-violet-100 text-violet-900">
                          {item.bank || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">{item.jenis}</TableCell>
                      <TableCell className="max-w-[320px] px-3 whitespace-normal">{item.keterangan}</TableCell>
                      <TableCell className="px-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-border/80"
                          onClick={() => {
                            setEditItem({ id: item.id, kategori: item.kategori || "" });
                            setNewCategory(item.kategori || "");
                          }}
                        >
                          <Pencil />
                          {item.kategori || "Lainnya"}
                        </Button>
                      </TableCell>
                      <TableCell className="px-3 text-right font-semibold">{formatRupiah(item.jumlah)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-category">Nama kategori</Label>
            <Input
              id="new-category"
              value={newCategory}
              className="rounded-xl border-border/80"
              onChange={(event) => setNewCategory(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleCategoryUpdate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditItem(null)}>
              Batal
            </Button>
            <Button className="rounded-xl" onClick={handleCategoryUpdate}>
              <Wallet />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
