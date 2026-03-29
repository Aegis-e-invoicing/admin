import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import { businessItemApi, type BusinessItem, type CreateBusinessItemPayload } from "../../lib/api";
import { USE_MOCK, MOCK_ITEMS } from "../../lib/mockData";
import { useIsClientAdmin, useIsAegisAdmin } from "../../context/AuthContext";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

const emptyForm: CreateBusinessItemPayload = {
  itemCode: "",
  description: "",
  unitPrice: 0,
  taxCategories: [],
};

export default function ItemList() {
  const isClientAdmin = useIsClientAdmin();
  const isAegis = useIsAegisAdmin();
  const canManage = isClientAdmin || isAegis;

  const [items, setItems] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateBusinessItemPayload>(emptyForm);
  const [taxInput, setTaxInput] = useState("");

  const load = (p: number) => {
    if (USE_MOCK) { setItems(MOCK_ITEMS as BusinessItem[]); setTotalPages(1); setLoading(false); return; }
    setLoading(true);
    businessItemApi
      .list({ page: p, pageSize: 15 })
      .then((r) => {
        setItems(r.items);
        setTotalPages(r.totalPages);
      })
      .catch(() => toast.error("Failed to load items."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemCode || !form.description || form.unitPrice <= 0) {
      toast.error("Item code, description and a positive unit price are required.");
      return;
    }
    setSaving(true);
    try {
      await businessItemApi.create(form);
      toast.success("Item created successfully.");
      setShowForm(false);
      setForm(emptyForm);
      setTaxInput("");
      load(page);
    } catch {
      toast.error("Failed to create item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete item "${code}"? This cannot be undone.`)) return;
    try {
      await businessItemApi.delete(id);
      toast.success("Item deleted.");
      load(page);
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  const addTaxCategory = () => {
    const val = taxInput.trim();
    if (!val) return;
    if (!form.taxCategories?.includes(val)) {
      setForm((f) => ({ ...f, taxCategories: [...(f.taxCategories ?? []), val] }));
    }
    setTaxInput("");
  };

  const removeTaxCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      taxCategories: f.taxCategories?.filter((c) => c !== cat) ?? [],
    }));
  };

  return (
    <>
      <PageMeta title="Items | Aegis NRS Portal" description="Manage business items and products" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Items</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your products and services catalogue
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Add Item
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6"
        >
          <h2 className="text-base font-semibold text-gray-700 dark:text-white mb-4">New Item</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Item Code *
              </label>
              <input
                value={form.itemCode}
                onChange={(e) => setForm((f) => ({ ...f, itemCode: e.target.value }))}
                className={inputCls}
                placeholder="SKU-001"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Unit Price (NGN) *
              </label>
              <input
                value={form.unitPrice === 0 ? "" : form.unitPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unitPrice: parseFloat(e.target.value) || 0 }))
                }
                className={inputCls}
                placeholder="0.00"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Description *
              </label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls}
                placeholder="Item description"
                required
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Tax Categories
              </label>
              <div className="flex gap-2">
                <input
                  value={taxInput}
                  onChange={(e) => setTaxInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTaxCategory();
                    }
                  }}
                  className={inputCls}
                  placeholder="e.g. VAT, WHT"
                />
                <button
                  type="button"
                  onClick={addTaxCategory}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              {(form.taxCategories?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.taxCategories?.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeTaxCategory(cat)}
                        className="hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
              {saving ? "Saving…" : "Create Item"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No items found.</p>
            {canManage && (
              <button
                onClick={() => setShowForm(true)}
                className="text-brand-500 hover:text-brand-600 text-sm font-medium"
              >
                Add your NRSt item →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Tax Categories
                  </th>
                  {canManage && (
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700 dark:text-gray-200">
                      {item.itemCode}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-white">
                      ₦{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(item.taxCategories ?? []).length === 0 ? (
                          <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                        ) : (
                          item.taxCategories?.map((cat) => (
                            <span
                              key={cat}
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            >
                              {cat}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.itemCode)}
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
