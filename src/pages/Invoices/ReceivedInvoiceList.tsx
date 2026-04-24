import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SkeletonTableRows } from "../../components/ui/skeleton/Skeleton";
import PageMeta from "../../components/common/PageMeta";
import TablePagination from "../../components/common/TablePagination";
import { invoiceApi, type InvoiceSummary } from "../../lib/api";
import { USE_MOCK, MOCK_RECEIVED_INVOICES } from "../../lib/mockData";
import { useEnvMode } from "../../context/EnvModeContext";

const PAY_STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ReceivedInvoiceList() {
  const { envMode } = useEnvMode();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [senderFilter, setSenderFilter] = useState("");
  const [payStatusFilter, setPayStatusFilter] = useState("");

  const fetchInvoices = (p: number, ps: number) => {
    if (USE_MOCK) {
      setTotalCount(MOCK_RECEIVED_INVOICES.length);
      setTotalPages(Math.ceil(MOCK_RECEIVED_INVOICES.length / ps));
      setInvoices(
        MOCK_RECEIVED_INVOICES.slice((p - 1) * ps, p * ps) as InvoiceSummary[],
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    invoiceApi
      .receivedList({ page: p, pageSize: ps, environmentMode: envMode })
      .then((result) => {
        setInvoices(result?.items ?? []);
        setTotalPages(result?.totalPages ?? 1);
        setTotalCount(result?.totalCount ?? 0);
      })
      .catch(() => toast.error("Failed to load received invoices."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, envMode]);

  const filteredInvoices =
    invoices?.filter((inv) => {
      const matchesSender = senderFilter
        ? (inv.partyName ?? "")
            .toLowerCase()
            .includes(senderFilter.toLowerCase())
        : true;
      const matchesStatus = payStatusFilter
        ? inv.paymentStatus === payStatusFilter
        : true;
      return matchesSender && matchesStatus;
    }) ?? [];

  const handlePageSizeChange = (ps: number) => {
    setPageSize(ps);
    setPage(1);
  };

  // Payment status update
  const [payModal, setPayModal] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [updatingPay, setUpdatingPay] = useState(false);

  const handleUpdatePaymentStatus = async () => {
    if (!payModal) return;
    setUpdatingPay(true);
    try {
      await invoiceApi.updateReceivedInvoicePaymentStatus(payModal.id, {
        paymentStatus: "REJECTED",
      });
      toast.success("Invoice rejected.");
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === payModal.id ? { ...i, paymentStatus: "REJECTED" } : i,
        ),
      );
      setPayModal(null);
    } catch {
      toast.error("Failed to reject invoice.");
    } finally {
      setUpdatingPay(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Received Invoices | Aegis EInvoicing Portal"
        description="View invoices received from trading partners"
      />

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Received Invoices
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Invoices received from your trading partners and vendors
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center gap-3 flex-wrap px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search by sender..."
            value={senderFilter}
            onChange={(e) => setSenderFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
          />
          <select
            value={payStatusFilter}
            onChange={(e) => setPayStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {totalCount > 0
              ? `${filteredInvoices.length} of ${totalCount} invoice${totalCount !== 1 ? "s" : ""}`
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
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <SkeletonTableRows
                  rows={pageSize}
                  colWidths={[
                    "w-28",
                    "w-36",
                    "w-20",
                    "w-24",
                    "w-20",
                    "w-28",
                    "w-16",
                  ]}
                />
              </tbody>
            </table>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              {senderFilter || payStatusFilter
                ? "No invoices match your filters."
                : "No received invoices found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Sender
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Payment Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    IRN
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                      {inv.invoiceCode}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {inv.partyName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(inv.issueDate).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-white">
                      ₦{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          PAY_STATUS_COLORS[inv.paymentStatus] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">
                      {inv.irn ? inv.irn.substring(0, 16) + "…" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {inv.paymentStatus !== "PAID" &&
                        inv.paymentStatus !== "REJECTED" && (
                          <button
                            onClick={() =>
                              setPayModal({ id: inv.id, code: inv.invoiceCode })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                          >
                            Reject
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      {/* Payment Status Update Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Reject Invoice
              </h2>
              <button
                onClick={() => {
                  setPayModal(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Invoice:{" "}
                <span className="font-medium text-gray-800 dark:text-white">
                  {payModal.code}
                </span>
              </p>
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-400">
                  This will mark the invoice as <strong>Rejected</strong> and
                  report the rejection to <strong>NRS</strong>. The sender will
                  be notified. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setPayModal(null);
                }}
                disabled={updatingPay}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePaymentStatus}
                disabled={updatingPay}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors min-w-20"
              >
                {updatingPay ? "Rejecting..." : "Reject Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
