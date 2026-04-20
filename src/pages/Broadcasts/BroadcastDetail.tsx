import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import TablePagination from "../../components/common/TablePagination";
import {
  broadcastApi,
  type BroadcastDetail,
  type BroadcastSubmission,
} from "../../lib/api";
import {
  USE_MOCK,
  MOCK_BROADCAST_DETAIL,
  MOCK_BROADCAST_SUBMISSIONS,
} from "../../lib/mockData";
import { useIsAdmin } from "../../context/AuthContext";

const paymentStatusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Paid: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Dismissed: "bg-gray-100 text-gray-500",
  Cancelled: "bg-gray-100 text-gray-500",
};

const NRS_STATUSES = ["signed", "transmitted", "completelytransmitted"];
const isNrsTransmitted = (s: BroadcastSubmission) =>
  NRS_STATUSES.includes(s.invoiceStatus.toLowerCase());

export default function BroadcastDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  const [broadcast, setBroadcast] = useState<BroadcastDetail | null>(null);
  const [submissions, setSubmissions] = useState<BroadcastSubmission[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [actioning, setActioning] = useState(false);
  const [extendDate, setExtendDate] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  // Approve confirmation modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveResult, setApproveResult] = useState<{
    succeeded: number;
    message: string;
  } | null>(null);

  const load = async () => {
    if (!id) return;
    if (USE_MOCK) {
      setBroadcast(MOCK_BROADCAST_DETAIL as BroadcastDetail);
      setEditTitle(MOCK_BROADCAST_DETAIL.title);
      setEditNote(MOCK_BROADCAST_DETAIL.note ?? "");
      setSubmissions(MOCK_BROADCAST_SUBMISSIONS as BroadcastSubmission[]);
      setSubTotalPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [detail, subs] = await Promise.all([
        broadcastApi.get(id),
        broadcastApi.getSubmissions(id, { page: subPage, pageSize: 20 }),
      ]);
      setBroadcast(detail);
      setEditTitle(detail.title);
      setEditNote(detail.note ?? "");
      setSubmissions(subs.items ?? []);
      setSubTotalPages(subs.totalPages ?? 1);
    } catch {
      toast.error("Failed to load broadcast");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, subPage]);

  const handleDeactivate = async () => {
    if (
      !id ||
      !confirm(
        "Deactivate this broadcast? Vendors will no longer be able to submit.",
      )
    )
      return;
    setActioning(true);
    try {
      const r = await broadcastApi.deactivate(id);
      if (r.hasPendingInvoices)
        toast("Deactivated — some vendors had pending invoices", {
          icon: "⚠️",
        });
      else toast.success("Broadcast deactivated");
      load();
    } catch {
      toast.error("Failed to deactivate");
    } finally {
      setActioning(false);
    }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !extendDate) return;
    setActioning(true);
    try {
      await broadcastApi.extendDueDate(id, extendDate);
      toast.success("Due date extended");
      setExtendDate("");
      load();
    } catch {
      toast.error("Failed to extend due date");
    } finally {
      setActioning(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setActioning(true);
    try {
      await broadcastApi.update(id, {
        title: editTitle,
        note: editNote || undefined,
      });
      toast.success("Broadcast updated");
      setShowEdit(false);
      load();
    } catch {
      toast.error("Failed to update");
    } finally {
      setActioning(false);
    }
  };

  const toggleSelect = (invoiceId: string) =>
    setSelected((s) =>
      s.includes(invoiceId)
        ? s.filter((x) => x !== invoiceId)
        : [...s, invoiceId],
    );

  // ── No-approval path actions ───────────────────────────────────────────────

  const handleMarkPaid = async () => {
    if (!selected.length) return;
    setActioning(true);
    try {
      await broadcastApi.markPaid(selected);
      toast.success(`${selected.length} invoice(s) marked paid`);
      setSelected([]);
      load();
    } catch {
      toast.error("Failed to mark as paid");
    } finally {
      setActioning(false);
    }
  };

  const handleMarkRejected = async () => {
    if (!selected.length) return;
    setActioning(true);
    try {
      await broadcastApi.markRejected(selected);
      toast.success(`${selected.length} invoice(s) marked rejected`);
      setSelected([]);
      load();
    } catch {
      toast.error("Failed to mark as rejected");
    } finally {
      setActioning(false);
    }
  };

  // ── Approval path actions ──────────────────────────────────────────────────

  const handleApproveConfirm = async () => {
    if (!selected.length) return;
    setActioning(true);
    setShowApproveModal(false);
    try {
      const res = await broadcastApi.approveSubmissions(selected);
      const count = selected.length;
      setApproveResult({
        succeeded: count,
        message: res.message ?? `${count} invoice(s) submitted to NRS`,
      });
      setSelected([]);
      load();
    } catch {
      toast.error("Failed to approve submissions");
    } finally {
      setActioning(false);
    }
  };

  const handleDismiss = async () => {
    if (!selected.length) return;
    setActioning(true);
    try {
      await broadcastApi.dismissSubmissions(selected);
      toast.success(`${selected.length} submission(s) dismissed`);
      setSelected([]);
      load();
    } catch {
      toast.error("Failed to dismiss submissions");
    } finally {
      setActioning(false);
    }
  };

  const handleDismissRemaining = async () => {
    const remainingIds = submissions
      .filter(
        (s) =>
          s.invoiceStatus.toLowerCase() === "pending_approval" &&
          s.paymentStatus.toLowerCase() === "pending",
      )
      .map((s) => s.invoiceId);

    if (!remainingIds.length) {
      setApproveResult(null);
      return;
    }
    setActioning(true);
    try {
      await broadcastApi.dismissSubmissions(remainingIds);
      toast.success(`${remainingIds.length} remaining submission(s) dismissed`);
      load();
    } catch {
      toast.error("Failed to dismiss remaining submissions");
    } finally {
      setActioning(false);
      setApproveResult(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!broadcast)
    return <div className="p-6 text-gray-500">Broadcast not found.</div>;

  const isActive = broadcast.status === "Active";
  const requiresApproval = broadcast.requiresApproval;

  const selectedCanReject = selected.every((sid) =>
    submissions.find((s) => s.invoiceId === sid && isNrsTransmitted(s)),
  );

  const remainingPendingApprovalCount = submissions.filter(
    (s) =>
      s.invoiceStatus.toLowerCase() === "pending_approval" &&
      s.paymentStatus.toLowerCase() === "pending",
  ).length;

  return (
    <>
      <PageMeta title={broadcast.title} description="Broadcast detail" />
      <div className="p-6 space-y-6">
        <button
          onClick={() => navigate("/broadcasts")}
          className="text-sm text-brand-500 hover:underline"
        >
          ← Back to Broadcasts
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {broadcast.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Due {new Date(broadcast.dueDate).toLocaleDateString()} ·{" "}
              {broadcast.currency} · {broadcast.invoiceTypeCode}
            </p>
            {broadcast.note && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {broadcast.note}
              </p>
            )}
          </div>
          {isAdmin && isActive && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleDeactivate}
                disabled={actioning}
                className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Deactivate
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Vendors", value: broadcast.totalVendors },
            { label: "Submitted", value: broadcast.submittedCount },
            {
              label: "Requires Approval",
              value: broadcast.requiresApproval ? "Yes" : "No",
            },
            {
              label: "Approval Locked",
              value: broadcast.isApprovalLocked ? "Yes" : "No",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs text-gray-500 uppercase">{s.label}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Extend due date */}
        {isAdmin && isActive && (
          <form onSubmit={handleExtend} className="flex items-end gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Extend Due Date
              </label>
              <input
                type="date"
                value={extendDate}
                onChange={(e) => setExtendDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              />
            </div>
            <button
              type="submit"
              disabled={actioning || !extendDate}
              className="px-4 py-2 bg-brand-500 text-white text-sm rounded-lg disabled:opacity-60"
            >
              Extend
            </button>
          </form>
        )}

        {/* Submissions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Submissions
            </h2>
            {isAdmin && (
              <div className="flex gap-2 flex-wrap">
                {/* Approve / Dismiss — only for broadcasts that require approval */}
                {requiresApproval && (
                  <>
                    <button
                      onClick={() => setShowApproveModal(true)}
                      disabled={actioning || selected.length === 0}
                      className="px-3 py-1.5 text-sm bg-brand-500 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    >
                      Approve
                      {selected.length > 0 ? ` (${selected.length})` : ""}
                    </button>
                    <button
                      onClick={handleDismiss}
                      disabled={actioning || selected.length === 0}
                      className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    >
                      Dismiss
                      {selected.length > 0 ? ` (${selected.length})` : ""}
                    </button>
                  </>
                )}

                {/* Mark Paid — available on both paths, for any NRS-transmitted invoice */}
                <button
                  onClick={handleMarkPaid}
                  disabled={actioning || selected.length === 0}
                  title={selected.length === 0 ? "Select invoices to mark as paid" : undefined}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  Mark Paid
                  {selected.length > 0 ? ` (${selected.length})` : ""}
                </button>

                {/* Reject — only for non-approval broadcasts, NRS-transmitted only */}
                {!requiresApproval && (
                  <button
                    onClick={handleMarkRejected}
                    disabled={
                      actioning || selected.length === 0 || !selectedCanReject
                    }
                    title={
                      selected.length > 0 && !selectedCanReject
                        ? "Only NRS-transmitted invoices can be rejected"
                        : undefined
                    }
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    Reject{selected.length > 0 ? ` (${selected.length})` : ""}
                  </button>
                )}
              </div>
            )}
          </div>

          {submissions.length === 0 ? (
            <p className="text-sm text-gray-500">No submissions yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs">
                  <tr>
                    {isAdmin && (
                      <th className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? submissions.map((s) => s.invoiceId)
                                : [],
                            )
                          }
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left">Vendor</th>
                    <th className="px-4 py-3 text-left">Invoice</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {submissions.map((s) => (
                    <tr
                      key={s.broadcastVendorId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(s.invoiceId)}
                            onChange={() => toggleSelect(s.invoiceId)}
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {s.vendorBusinessName}
                        </p>
                        <p className="text-xs text-gray-400">{s.vendorEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                        {s.invoiceCode}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        {s.totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[s.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {s.invoiceStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <TablePagination
            page={subPage}
            totalPages={subTotalPages}
            onPrev={() => setSubPage((p) => Math.max(1, p - 1))}
            onNext={() => setSubPage((p) => Math.min(subTotalPages, p + 1))}
          />
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleUpdate}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Broadcast
            </h2>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Title *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Note
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                rows={3}
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={actioning}
                className="flex-1 py-2 bg-brand-500 text-white rounded-lg disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Approve confirmation modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Approve & Submit to NRS
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will validate and submit{" "}
              <strong>{selected.length} invoice(s)</strong> to the NRS. Once
              transmitted you will have a <strong>72-hour window</strong> to
              reject if needed. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleApproveConfirm}
                disabled={actioning}
                className="flex-1 py-2 bg-brand-500 text-white rounded-lg disabled:opacity-60 text-sm font-medium"
              >
                {actioning ? "Submitting..." : "Confirm & Submit"}
              </button>
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-approve: offer to dismiss remaining */}
      {approveResult && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Submitted to NRS
                </h2>
                <p className="text-sm text-gray-500">{approveResult.message}</p>
              </div>
            </div>
            {remainingPendingApprovalCount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  There {remainingPendingApprovalCount === 1 ? "is" : "are"}{" "}
                  <strong>{remainingPendingApprovalCount}</strong> other
                  submission(s) still waiting. Would you like to dismiss them?
                  They were not selected and will not be processed.
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              {remainingPendingApprovalCount > 0 && (
                <button
                  onClick={handleDismissRemaining}
                  disabled={actioning}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-60 text-sm font-medium"
                >
                  Dismiss Remaining ({remainingPendingApprovalCount})
                </button>
              )}
              <button
                type="button"
                onClick={() => setApproveResult(null)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm"
              >
                {remainingPendingApprovalCount > 0 ? "Keep for Now" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
