import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import TablePagination from "../../components/common/TablePagination";
import { SkeletonTableRows } from "../../components/ui/skeleton/Skeleton";
import { vendorGroupApi, type VendorGroup } from "../../lib/api";
import {
  USE_MOCK,
  MOCK_VENDOR_GROUPS,
  MOCK_PAGE_SIZE,
} from "../../lib/mockData";
import { useIsAdmin } from "../../context/AuthContext";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

type FormData = { name: string; description: string };
const emptyForm: FormData = { name: "", description: "" };

export default function VendorGroupList() {
  const isAdmin = useIsAdmin();

  const [groups, setGroups] = useState<VendorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editing, setEditing] = useState<VendorGroup | null>(null);
  const [deactivateModal, setDeactivateModal] = useState<VendorGroup | null>(
    null,
  );

  const load = async (p = page) => {
    if (USE_MOCK) {
      const filtered = search
        ? MOCK_VENDOR_GROUPS.filter((g) =>
            g.name.toLowerCase().includes(search.toLowerCase()),
          )
        : MOCK_VENDOR_GROUPS;
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / MOCK_PAGE_SIZE));
      setGroups(
        filtered.slice(
          (p - 1) * MOCK_PAGE_SIZE,
          p * MOCK_PAGE_SIZE,
        ) as VendorGroup[],
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await vendorGroupApi.list({
        page: p,
        pageSize: 10,
        searchTerm: search || undefined,
      });
      setGroups(res?.items ?? []);
      setTotalCount(res?.totalCount ?? 0);
      setTotalPages(res?.totalPages ?? 1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Failed to load vendor groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    setPage(1);
  }, [search]);
  useEffect(() => {
    load(page);
  }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (g: VendorGroup) => {
    setEditing(g);
    setForm({ name: g.name, description: g.description ?? "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (USE_MOCK) {
      toast.success(editing ? "Group updated (mock)" : "Group created (mock)");
      setShowForm(false);
      setSaving(false);
      return;
    }
    try {
      if (editing) {
        await vendorGroupApi.update(editing.id, form);
        toast.success("Group updated");
      } else {
        await vendorGroupApi.create(form);
        toast.success("Group created");
      }
      setShowForm(false);
      load(1);
    } catch (err: unknown) {
      const e = err as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };
      const apiErrors = e?.response?.data?.errors;
      if (apiErrors) {
        Object.values(apiErrors)
          .flat()
          .forEach((msg) => toast.error(msg));
      } else {
        toast.error(e?.response?.data?.message || "Failed to save group");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (g: VendorGroup) => setDeactivateModal(g);

  const confirmDeactivate = async () => {
    if (!deactivateModal) return;
    const id = deactivateModal.id;
    const name = deactivateModal.name;
    setDeactivateModal(null);
    if (USE_MOCK) {
      toast.success(`"${name}" deactivated (mock)`);
      return;
    }
    try {
      await vendorGroupApi.delete(id);
      toast.success(`"${name}" deactivated`);
      load(page);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Failed to deactivate group");
    }
  };

  return (
    <>
      <PageMeta
        title="Vendor Groups"
        description="Manage vendor groups for invoice broadcasts"
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Vendor Groups
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalCount} groups total
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-brand-500 text-white text-sm rounded-lg hover:bg-brand-600 transition"
            >
              + New Group
            </button>
          )}
        </div>

        <input
          className={inputCls + " max-w-xs"}
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <SkeletonTableRows
                    rows={8}
                    colWidths={["w-36", "w-48", "w-16", "w-24", "w-20"]}
                  />
                </tbody>
              </table>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">
                No vendor groups found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Vendors
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Created
                    </th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {groups.map((g) => (
                    <tr
                      key={g.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {g.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {g.description ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        {g.vendorCount}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => openEdit(g)}
                            className="text-brand-500 hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeactivate(g)}
                            className="text-amber-500 hover:underline text-xs"
                          >
                            Deactivate
                          </button>
                        </td>
                      )}
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
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="fixed inset-0 z-9999999 flex" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto w-full max-w-xl h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div>
                <h2 className="text-base font-semibold text-gray-800 dark:text-white">{editing ? "Edit Vendor Group" : "New Vendor Group"}</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Name *</label>
                  <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
                  <textarea className={`${inputCls} resize-none`} rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-lg transition-colors">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate confirmation modal */}
      {deactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2">
              Deactivate Vendor Group
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Are you sure you want to deactivate{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {deactivateModal.name}
              </span>
              ? Vendors in this group will need to be reassigned.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeactivateModal(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
