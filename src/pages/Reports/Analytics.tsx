import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import { analyticsV2Api, type AnalyticsV2Result } from "../../lib/api";
import { USE_MOCK, MOCK_ANALYTICS_V2 } from "../../lib/mockData";

type Tab = "general" | "vat";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000
    ? `₦${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `₦${(n / 1_000).toFixed(0)}K`
    : `₦${n.toLocaleString()}`;

function MetricCard({
  label, value, sub, pct, icon, color = "brand",
}: {
  label: string; value: string; sub?: string; pct?: number;
  icon: React.ReactNode; color?: "brand" | "green" | "amber" | "red" | "purple";
}) {
  const ring: Record<string, string> = {
    brand: "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ring[color]}`}>{icon}</div>
        {pct !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pct >= 0 ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
            {pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CHART_BASE: ApexOptions = {
  chart: { fontFamily: "Outfit, sans-serif", toolbar: { show: false }, zoom: { enabled: false } },
  tooltip: { theme: "light", y: { formatter: (v) => `₦${(v / 1_000_000).toFixed(2)}M` } },
  stroke: { curve: "smooth" },
  dataLabels: { enabled: false },
  grid: { borderColor: "#f0f0f0", strokeDashArray: 4 },
  xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
  legend: { position: "top", fontFamily: "Outfit, sans-serif", fontSize: "12px" },
};

export default function Analytics() {
  const [tab, setTab] = useState<Tab>("general");
  const [data, setData] = useState<AnalyticsV2Result | null>(null);
  const [vatData, setVatData] = useState<AnalyticsV2Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => {
        setData({ generalDashboard: MOCK_ANALYTICS_V2.generalDashboard } as AnalyticsV2Result);
        setVatData({ vatTableDashboard: MOCK_ANALYTICS_V2.vatTableDashboard } as AnalyticsV2Result);
        setLoading(false);
      }, 400);
      return;
    }
    Promise.all([analyticsV2Api.get(0), analyticsV2Api.get(1)])
      .then(([g, v]) => { setData(g); setVatData(v); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const g = data?.generalDashboard;
  const vt = vatData?.vatTableDashboard;

  const monthLabels = g?.salesVsPurchases.map(d => d.name) ?? [];

  // ── Chart configs ────────────────────────────────────────────────────────
  const salesVsPurchasesOpts: ApexOptions = {
    ...CHART_BASE,
    chart: { ...CHART_BASE.chart, type: "bar" },
    plotOptions: { bar: { columnWidth: "45%", borderRadius: 3 } },
    colors: ["#465FFF", "#22C55E"],
    xaxis: { ...CHART_BASE.xaxis, categories: monthLabels },
    yaxis: { labels: { formatter: (v) => `₦${(v / 1_000_000).toFixed(0)}M` } },
  };
  const salesVsPurchasesSeries = [
    { name: "Sales (Invoiced)", data: g?.salesVsPurchases.map(d => d.salesAmount) ?? [] },
    { name: "Purchases (Received)", data: g?.salesVsPurchases.map(d => d.purchasesAmount) ?? [] },
  ];

  const vatTrendOpts: ApexOptions = {
    ...CHART_BASE,
    chart: { ...CHART_BASE.chart, type: "line" },
    colors: ["#F59E0B", "#465FFF"],
    stroke: { width: [2, 2], curve: "smooth" },
    xaxis: { ...CHART_BASE.xaxis, categories: monthLabels },
    yaxis: { labels: { formatter: (v) => `₦${(v / 1_000).toFixed(0)}K` } },
    tooltip: { y: { formatter: (v) => `₦${(v / 1_000).toFixed(1)}K` } },
    markers: { size: 4 },
  };
  const vatTrendSeries = [
    { name: "Output VAT (Sales)", data: g?.vatTrendAnalysis.map(d => d.outputVAT) ?? [] },
    { name: "Input VAT (Purchases)", data: g?.vatTrendAnalysis.map(d => d.inputVAT) ?? [] },
  ];

  const salesAndPayOpts: ApexOptions = {
    ...CHART_BASE,
    chart: { ...CHART_BASE.chart, type: "area" },
    colors: ["#465FFF", "#22C55E"],
    fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0.05 } },
    xaxis: { ...CHART_BASE.xaxis, categories: monthLabels },
    yaxis: { labels: { formatter: (v) => `₦${(v / 1_000_000).toFixed(0)}M` } },
  };
  const salesAndPaySeries = [
    { name: "Sales Amount", data: g?.salesAndPaymentPerMonth.map(d => d.sales) ?? [] },
    { name: "Payment Received", data: g?.salesAndPaymentPerMonth.map(d => d.payment) ?? [] },
  ];

  // Aggregate sales by party (top 10)
  const partyMap: Record<string, number> = {};
  g?.salesByParty?.forEach(d => {
    partyMap[d.partyName] = (partyMap[d.partyName] ?? 0) + d.salesAmount;
  });
  const partyEntries = Object.entries(partyMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const salesByPartyOpts: ApexOptions = {
    ...CHART_BASE,
    chart: { ...CHART_BASE.chart, type: "bar" },
    plotOptions: { bar: { horizontal: true, barHeight: "60%", borderRadius: 3 } },
    colors: ["#465FFF"],
    xaxis: { labels: { formatter: (v) => `₦${(Number(v) / 1_000_000).toFixed(1)}M` } },
    yaxis: { categories: partyEntries.map(r => r[0]) } as ApexOptions["yaxis"],
    tooltip: { y: { formatter: (v) => `₦${v.toLocaleString()}` } },
    dataLabels: { enabled: false },
  };
  const salesByPartySeries = [{ name: "Sales", data: partyEntries.map(r => r[1]) }];

  // ── VAT Table charts ─────────────────────────────────────────────────────
  const vatMonths = vt?.vatTableByCurrency.map(d => d.name) ?? [];
  const currencies = Array.from(new Set(vt?.vatTableByCurrency.flatMap(d => d.currencyAmounts.map(c => c.currencyName)) ?? []));

  const vatByCurrencyOpts: ApexOptions = {
    ...CHART_BASE,
    chart: { ...CHART_BASE.chart, type: "bar", stacked: true },
    plotOptions: { bar: { columnWidth: "50%", borderRadius: 2 } },
    colors: ["#465FFF", "#F59E0B", "#22C55E"],
    xaxis: { ...CHART_BASE.xaxis, categories: vatMonths },
    yaxis: { labels: { formatter: (v) => `₦${(v / 1_000).toFixed(0)}K` } },
    tooltip: { y: { formatter: (v) => `₦${(v / 1_000).toFixed(1)}K` } },
  };
  const vatByCurrencySeries = currencies.map(cName => ({
    name: cName,
    data: vt?.vatTableByCurrency.map(d => d.currencyAmounts.find(c => c.currencyName === cName)?.amount ?? 0) ?? [],
  }));

  const exemptVatOpts: ApexOptions = {
    ...CHART_BASE,
    chart: { ...CHART_BASE.chart, type: "bar", stacked: true },
    plotOptions: { bar: { columnWidth: "50%", borderRadius: 2 } },
    colors: ["#EF4444", "#F97316"],
    xaxis: { ...CHART_BASE.xaxis, categories: vatMonths },
    yaxis: { labels: { formatter: (v) => `₦${(v / 1_000).toFixed(0)}K` } },
    tooltip: { y: { formatter: (v) => `₦${(v / 1_000).toFixed(1)}K` } },
  };
  const exemptVatSeries = currencies.map(cName => ({
    name: cName,
    data: vt?.exemptVATTableByCurrency.map(d => d.currencyAmounts.find(c => c.currencyName === cName)?.amount ?? 0) ?? [],
  }));

  const vatVsNonOpts: ApexOptions = {
    ...CHART_BASE,
    chart: { ...CHART_BASE.chart, type: "line" },
    stroke: { width: [2, 2, 2, 2], curve: "smooth" },
    colors: ["#465FFF", "#93C5FD", "#22C55E", "#86EFAC"],
    xaxis: { ...CHART_BASE.xaxis, categories: vatMonths },
    yaxis: { labels: { formatter: (v) => `₦${(v / 1_000_000).toFixed(0)}M` } },
    markers: { size: 4 },
  };
  const vatVsNonSeries = [
    { name: "Sales (VATable)", data: vt?.vatTableVsNonVATTable.map(d => d.salesVatable) ?? [] },
    { name: "Sales (Non-VATable)", data: vt?.vatTableVsNonVATTable.map(d => d.salesNonVatable) ?? [] },
    { name: "Purchases (VATable)", data: vt?.vatTableVsNonVATTable.map(d => d.purchaseVatable) ?? [] },
    { name: "Purchases (Non-VATable)", data: vt?.vatTableVsNonVATTable.map(d => d.purchaseNonVatable) ?? [] },
  ];

  return (
    <>
      <PageMeta title="Analytics | Aegis NRS Portal" description="Advanced invoice analytics and VAT dashboard" />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">12-month rolling view of your invoicing and VAT activity</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 gap-1">
          <button
            onClick={() => setTab("general")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "general" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
          >General</button>
          <button
            onClick={() => setTab("vat")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "vat" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
          >VAT Table</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "general" && g ? (
        <div className="space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              label="Customer Invoices"
              value={`${g.metrics.totalCustomerInvoicesCount.toLocaleString()} invoices`}
              sub={fmt(g.metrics.totalCustomerInvoicesAmount)}
              pct={g.metrics.totalInvoiceValuePercentageChange}
              color="brand"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <MetricCard
              label="Vendor Invoices"
              value={`${g.metrics.totalVendorInvoicesCount.toLocaleString()} invoices`}
              sub={fmt(g.metrics.totalVendorInvoicesAmount)}
              color="green"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            />
            <MetricCard
              label="Output VAT (Sales)"
              value={fmt(g.metrics.totalVATOnCustomerInvoices)}
              sub="7.5% on transmitted invoices"
              pct={g.metrics.vatOnCustomerPercentageChange}
              color="amber"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>}
            />
            <MetricCard
              label="Input VAT (Purchases)"
              value={fmt(g.metrics.totalVATOnVendorInvoices)}
              sub="Claimable input tax credit"
              pct={g.metrics.vatOnVendorPercentageChange}
              color="purple"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sales vs Purchases — 12 Months</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Monthly invoice value compared to received invoices</p>
              <Chart options={salesVsPurchasesOpts} series={salesVsPurchasesSeries} type="bar" height={260} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">VAT Trend Analysis</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Output VAT (collected) vs Input VAT (claimable) monthly</p>
              <Chart options={vatTrendOpts} series={vatTrendSeries} type="line" height={260} />
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sales vs Payment Received</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Track invoice value issued vs actual payments received</p>
              <Chart options={salesAndPayOpts} series={salesAndPaySeries} type="area" height={260} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sales by Top 10 Customers</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Total invoiced value by customer over 12 months</p>
              <Chart options={salesByPartyOpts} series={salesByPartySeries} type="bar" height={260} />
            </div>
          </div>
        </div>
      ) : tab === "vat" && vt ? (
        <div className="space-y-5">
          {/* VAT net position summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Output VAT (12 mo.)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {fmt(vt.vatTableByCurrency.reduce((s, d) => s + d.currencyAmounts.reduce((a, c) => a + c.amount, 0), 0))}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Payable to FIRS (NGN only)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">VATable Sales (12 mo.)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {fmt(vt.vatTableVsNonVATTable.reduce((s, d) => s + d.salesVatable, 0))}
              </p>
              <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">Total value of goods/services attracting VAT</p>
            </div>
          </div>

          {/* VAT charts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">VATable vs Non-VATable Transactions</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">4-way split of VATable/non-VATable for both sales and purchases per month</p>
            <Chart options={vatVsNonOpts} series={vatVsNonSeries} type="line" height={280} />
          </div>
        </div>
      ) : null}
    </>
  );
}
