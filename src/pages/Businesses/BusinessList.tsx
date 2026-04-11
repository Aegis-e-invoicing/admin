import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import { businessesApi, type BusinessSummary } from "../../lib/api";
import { USE_MOCK, MOCK_BUSINESSES } from "../../lib/mockData";

const STATUS_COLORS: Record<string, string> = {
  Active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

const TIER_COLORS: Record<string, string> = {
  SaaS: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
  SFTP: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ApiOnly: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

export default function BusinessList() {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    if (USE_MOCK) {
      setAllBusinesses(MOCK_BUSINESSES as BusinessSummary[]);
      setLoading(false);
      return;
    }
    setLoading(true);
    businessesApi
      .list({ page, pageSize })
      .then((result) => {
        setAllBusinesses(result.items);
        setTotalPages(result.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const filtered = search.trim()
      ? allBusinesses.filter(
          (b) =>
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.tin?.toLowerCase().includes(search.toLowerCase()) ||
            b.contactEmail?.toLowerCase().includes(search.toLowerCase()),
        )
      : allBusinesses;
    const total = Math.ceil(filtered.length / pageSize);
    setTotalPages(total > 0 ? total : 1);
    setBusinesses(filtered.slice((page - 1) * pageSize, page * pageSize));
  }, [page, pageSize, allBusinesses, search]);

  const handlePageSizeChange = (ps: number) => {
    setPageSize(ps);
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusAction = async (
    business: BusinessSummary,
    action: "suspend" | "activate",
  ) => {
    if (USE_MOCK) {
      setAllBusinesses((prev) =>
        prev.map((b) =>
          b.id === business.id
            ? { ...b, status: action === "suspend" ? "Suspended" : "Active" }
            : b,
        ),
      );
      toast.success(
        `${business.name} ${action === "suspend" ? "suspended" : "activated"}.`,
      );
      return;
    }
    setActionLoading(business.id);
    try {
      if (action === "suspend") {
        await businessesApi.suspend(business.id);
        toast.success(`${business.name} suspended.`);
      } else {
        await businessesApi.activate(business.id);
        toast.success(`${business.name} activated.`);
      }
      // Refresh the list
      load();
    } catch {
      toast.error(`Failed to ${action} business.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <PageMeta
        title="Businesses | Aegis EInvoicing Platform"
        description="Manage tenant businesses on the Aegis platform"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Businesses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            All registered tenant businesses on the platform
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, TIN or email…"
          className="w-full max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {allBusinesses.length > 0
              ? `${allBusinesses.length} business${allBusinesses.length !== 1 ? "es" : ""}`
              : ""}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Rows
            </label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              No businesses found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Business
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    TIN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Industry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Registered
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {businesses.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {b.name}
                      </p>
                      {b.contactEmail && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {b.contactEmail}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {b.tin ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {b.subscriptionTier && (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            TIER_COLORS[b.subscriptionTier] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {b.subscriptionTier}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {b.industry ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[b.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {b.registeredAt
                        ? new Date(b.registeredAt).toLocaleDateString("en-NG", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : b.createdAt
                          ? new Date(b.createdAt).toLocaleDateString("en-NG", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status === "Active" ? (
                        <button
                          onClick={() => handleStatusAction(b, "suspend")}
                          disabled={actionLoading === b.id}
                          className="px-3 py-1 text-xs font-medium rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === b.id ? "…" : "Suspend"}
                        </button>
                      ) : b.status === "Suspended" ? (
                        <button
                          onClick={() => handleStatusAction(b, "activate")}
                          disabled={actionLoading === b.id}
                          className="px-3 py-1 text-xs font-medium rounded-lg border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === b.id ? "…" : "Activate"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
