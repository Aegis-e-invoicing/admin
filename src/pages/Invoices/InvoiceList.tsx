import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import { invoiceApi, type InvoiceSummary, type UploadInvoiceResult } from "../../lib/api";
import { useCanCreateInvoice } from "../../context/AuthContext";
import { USE_MOCK, MOCK_INVOICES, MOCK_PAGE_SIZE } from "../../lib/mockData";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  PendingApproval: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SubmittedToNRS: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ConfirmedByNRS: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const PAY_STATUS_COLORS: Record<string, string> = {
  Unpaid: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  PartiallyPaid: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  Paid: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
};

const STATUS_OPTIONS = ["", "Draft", "PendingApproval", "Approved", "SubmittedToNRS", "ConfirmedByNRS", "Rejected"];

export default function InvoiceList() {
  const canCreate = useCanCreateInvoice();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Bulk upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadInvoiceResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchInvoices = (p: number, status: string) => {
    if (USE_MOCK) {
      const filtered = status ? MOCK_INVOICES.filter(i => i.status === status) : MOCK_INVOICES;
      const total = Math.ceil(filtered.length / MOCK_PAGE_SIZE);
      setInvoices(filtered.slice((p - 1) * MOCK_PAGE_SIZE, p * MOCK_PAGE_SIZE) as InvoiceSummary[]);
      setTotalPages(total);
      setLoading(false);
      return;
    }
    setLoading(true);
    invoiceApi
      .list({ page: p, pageSize: 15, ...(status ? { status } : {}) })
      .then(result => {
        setInvoices(result.items);
        setTotalPages(result.totalPages);
      })
      .catch(() => toast.error("Failed to load invoices."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices(page, statusFilter);
  }, [page, statusFilter]);

  const handleStatusChange = (s: string) => {
    setStatusFilter(s);
    setPage(1);
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await invoiceApi.exportTemplate();
      const blob = new Blob([response.data as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Invoice_Upload_Template.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.xlsx?$/i)) {
      toast.error("Only Excel files (.xlsx / .xls) are accepted.");
      return;
    }
    setUploadFile(file);
    setUploadResult(null);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await invoiceApi.bulkUpload(uploadFile);
      setUploadResult(result);
      if (result.isSuccess) {
        toast.success(`Uploaded ${result.successfulUploads} of ${result.totalObjects} invoices.`);
        fetchInvoices(1, statusFilter);
        setPage(1);
      } else {
        toast.error(`Upload completed with ${result.failedUploads} failure(s).`);
      }
    } catch {
      toast.error("Upload failed. Please check your file and try again.");
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadResult(null);
    setDragOver(false);
  };

  return (
    <>
      <PageMeta title="Invoices | Aegis NRS Portal" description="Manage your invoices" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View and manage your submitted invoices</p>
        </div>
        {canCreate && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              title="Download Excel upload template"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloadingTemplate ? "Downloading…" : "Template"}
            </button>
            <button
              onClick={() => { setUploadResult(null); setUploadFile(null); setShowUploadModal(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Bulk Upload
            </button>
            <Link
              to="/invoices/create"
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              + New Invoice
            </Link>
          </div>
        )}
      </div>

      {/* ── Bulk Upload Modal ───────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Bulk Upload Invoices</h2>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tip */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload an Excel file using the Aegis invoice template. Up to 500 invoices per file.
                {" "}
                <button
                  onClick={handleDownloadTemplate}
                  className="text-brand-500 hover:text-brand-600 underline"
                >
                  Download template
                </button>
              </p>

              {/* Drop zone */}
              {!uploadResult && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileSelect(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                    dragOver
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-brand-400 dark:hover:border-brand-500"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                      e.target.value = "";
                    }}
                  />
                  {uploadFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{uploadFile.name}</p>
                      <p className="text-xs text-gray-400">{(uploadFile.size / 1024).toFixed(1)} KB — click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop or <span className="text-brand-500 font-medium">browse</span></p>
                      <p className="text-xs text-gray-400">.xlsx or .xls only</p>
                    </div>
                  )}
                </div>
              )}

              {/* Upload result */}
              {uploadResult && (
                <div className={`rounded-xl border p-4 ${
                  uploadResult.failedUploads === 0
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                    : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {uploadResult.failedUploads === 0 ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {uploadResult.successfulUploads} of {uploadResult.totalObjects} uploaded successfully
                      </p>
                      {uploadResult.failedUploads > 0 && (
                        <p className="text-xs text-amber-700 dark:text-amber-400">{uploadResult.failedUploads} failed</p>
                      )}
                    </div>
                  </div>
                  {uploadResult.failedUploads > 0 && Object.keys(uploadResult.failedUploadDetails).length > 0 && (
                    <div className="mt-2 max-h-36 overflow-y-auto">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Failed entries:</p>
                      <ul className="space-y-1">
                        {Object.entries(uploadResult.failedUploadDetails).map(([ref, reason]) => (
                          <li key={ref} className="text-xs text-gray-600 dark:text-gray-300">
                            <span className="font-mono font-medium">{ref}</span> — {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeUploadModal}
                disabled={uploading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {uploadResult ? "Close" : "Cancel"}
              </button>
              {!uploadResult && (
                <button
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile || uploading}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-xl disabled:opacity-50 transition-colors min-w-[110px]"
                >
                  {uploading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Uploading…
                    </span>
                  ) : "Upload File"}
                </button>
              )}
              {uploadResult && uploadResult.failedUploads > 0 && (
                <button
                  onClick={() => { setUploadResult(null); setUploadFile(null); }}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-xl transition-colors"
                >
                  Upload Another
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s || "All Statuses"}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No invoices found.</p>
            {canCreate && (
              <Link to="/invoices/create" className="text-brand-500 hover:text-brand-600 text-sm font-medium">
                Create your NRSt invoice →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Party</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Payment</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">IRN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/invoices/${inv.id}`} className="font-medium text-brand-500 hover:text-brand-600">
                        {inv.invoiceCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{inv.partyName ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(inv.issueDate).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-white">
                      ₦{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PAY_STATUS_COLORS[inv.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">
                      {inv.irn ? inv.irn.substring(0, 16) + "..." : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
