import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import { partyApi, type Party, type CreatePartyPayload } from "../../lib/api";
import { USE_MOCK, MOCK_PARTIES } from "../../lib/mockData";
import { useIsClientAdmin, useIsAegisAdmin } from "../../context/AuthContext";

const ROLE_OPTIONS = ["Customer", "Supplier", "Both"];

const inputCls =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

const emptyForm: CreatePartyPayload = {
  name: "",
  tin: "",
  contactEmail: "",
  contactPhone: "",
  role: "Customer",
};

export default function PartyList() {
  const isClientAdmin = useIsClientAdmin();
  const isAegis = useIsAegisAdmin();
  const canManage = isClientAdmin || isAegis;

  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreatePartyPayload>(emptyForm);

  const load = (p: number) => {
    if (USE_MOCK) { setParties(MOCK_PARTIES as Party[]); setTotalPages(1); setLoading(false); return; }
    setLoading(true);
    partyApi
      .list({ page: p, pageSize: 15 })
      .then((r) => {
        setParties(r.items);
        setTotalPages(r.totalPages);
      })
      .catch(() => toast.error("Failed to load parties."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.tin) {
      toast.error("Name and TIN are required.");
      return;
    }
    setSaving(true);
    try {
      await partyApi.create(form);
      toast.success("Party created successfully.");
      setShowForm(false);
      setForm(emptyForm);
      load(page);
    } catch {
      toast.error("Failed to create party.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await partyApi.delete(id);
      toast.success("Party deleted.");
      load(page);
    } catch {
      toast.error("Failed to delete party.");
    }
  };

  return (
    <>
      <PageMeta title="Parties | Aegis NRS Portal" description="Manage trading parties" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Parties</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your suppliers and customers
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Add Party
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6"
        >
          <h2 className="text-base font-semibold text-gray-700 dark:text-white mb-4">New Party</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
                placeholder="Business name"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">TIN *</label>
              <input
                value={form.tin}
                onChange={(e) => setForm((f) => ({ ...f, tin: e.target.value }))}
                className={inputCls}
                placeholder="Tax Identification Number"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
              <input
                value={form.contactEmail ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                className={inputCls}
                placeholder="email@example.com"
                type="email"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</label>
              <input
                value={form.contactPhone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className={inputCls}
                placeholder="+234..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className={inputCls}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-xl disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Create Party"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : parties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No parties found.</p>
            {canManage && (
              <button
                onClick={() => setShowForm(true)}
                className="text-brand-500 hover:text-brand-600 text-sm font-medium"
              >
                Add your NRSt party →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">TIN</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Phone</th>
                  {canManage && (
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {parties.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {p.tin}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {p.contactEmail ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {p.contactPhone ?? "—"}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="text-red-500 hover:text-red-600 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    )}
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
