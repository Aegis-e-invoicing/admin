import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import { invoiceApi, type InvoiceSummary } from "../../lib/api";
import { USE_MOCK, MOCK_RECEIVED_INVOICES } from "../../lib/mockData";


const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  PendingApproval: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SubmittedToNRS: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ConfirmedByNRS: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ReceivedInvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvoices = (p: number) => {
    if (USE_MOCK) {
      setInvoices(MOCK_RECEIVED_INVOICES as InvoiceSummary[]);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    invoiceApi
      .receivedList({ page: p, pageSize: 15 })
      .then((result) => {
        setInvoices(result.items);
        setTotalPages(result.totalPages);
      })
      .catch(() => toast.error("Failed to load received invoices."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices(page);
  }, [page]);

  return (
    <>
      <PageMeta
        title="Received Invoices | Aegis NRS Portal"
        description="View invoices received from trading partners"
      />

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Received Invoices</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Invoices received from your trading partners via NRS NRS
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">No received invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Sender</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">IRN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {invoices.map((inv) => (
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
                          STATUS_COLORS[inv.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">
                      {inv.irn ? inv.irn.substring(0, 16) + "…" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
