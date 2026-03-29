import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import {
  invoiceApi,
  partyApi,
  businessItemApi,
  type Party,
  type BusinessItem,
  type CreateInvoicePayload,
  type InvoiceItemPayload,
} from "../../lib/api";
import { USE_MOCK, MOCK_PARTIES, MOCK_ITEMS } from "../../lib/mockData";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

const INVOICE_TYPES = [
  { code: "380", label: "Commercial Invoice (380)" },
  { code: "381", label: "Credit Note (381)" },
  { code: "383", label: "Debit Note (383)" },
  { code: "386", label: "Prepayment Invoice (386)" },
  { code: "388", label: "Tax Invoice (388)" },
];

const PAYMENT_MEANS = [
  { code: "10", label: "Cash (10)" },
  { code: "20", label: "Cheque (20)" },
  { code: "30", label: "Bank Transfer (30)" },
  { code: "48", label: "Bank Card (48)" },
  { code: "97", label: "Clearing between partners (97)" },
];

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

interface LineItem extends InvoiceItemPayload {
  _itemCode?: string;
  _description?: string;
  _unitPriceDisplay?: number;
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<BusinessItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    partyId: "",
    issueDate: new Date().toISOString().substring(0, 10),
    dueDate: "",
    currencyCode: "NGN",
    invoiceTypeCode: "380",
    paymentMeansCode: "30",
    note: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { businessItemId: "", quantity: 1, unitPrice: 0, lineDiscount: 0, _description: "", _itemCode: "", _unitPriceDisplay: 0 },
  ]);

  useEffect(() => {
    if (USE_MOCK) {
      setParties(MOCK_PARTIES as Party[]);
      setItems(MOCK_ITEMS as BusinessItem[]);
      setLoadingLookups(false);
      return;
    }
    Promise.all([
      partyApi.list({ pageSize: 200 }).then(r => r.items).catch(() => [] as Party[]),
      businessItemApi.list({ pageSize: 200 }).then(r => r.items).catch(() => [] as BusinessItem[]),
    ]).then(([p, bi]) => {
      setParties(p);
      setItems(bi);
    }).finally(() => setLoadingLookups(false));
  }, []);

  const handleFieldChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleItemSelect = (index: number, businessItemId: string) => {
    const selected = items.find(i => i.id === businessItemId);
    setLineItems(prev => prev.map((li, i) =>
      i === index
        ? {
            ...li,
            businessItemId,
            unitPrice: selected?.unitPrice ?? 0,
            _unitPriceDisplay: selected?.unitPrice ?? 0,
            _description: selected?.description ?? "",
            _itemCode: selected?.itemCode ?? "",
          }
        : li
    ));
  };

  const handleLineChange = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map((li, i) =>
      i === index ? { ...li, [field]: value } : li
    ));
  };

  const addLine = () => {
    setLineItems(prev => [
      ...prev,
      { businessItemId: "", quantity: 1, unitPrice: 0, lineDiscount: 0, _description: "", _itemCode: "", _unitPriceDisplay: 0 },
    ]);
  };

  const removeLine = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const lineTotal = (li: LineItem) =>
    (li.unitPrice * li.quantity) - (li.lineDiscount ?? 0);

  const grandTotal = lineItems.reduce((s, li) => s + lineTotal(li), 0);
  const vatAmount = grandTotal * 0.075;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partyId) { toast.error("Please select a buyer/party."); return; }
    if (lineItems.some(li => !li.businessItemId)) { toast.error("Please select an item for all line items."); return; }
    if (lineItems.some(li => li.quantity <= 0)) { toast.error("Quantity must be greater than 0."); return; }

    const payload: CreateInvoicePayload = {
      partyId: form.partyId,
      issueDate: form.issueDate,
      dueDate: form.dueDate || undefined,
      currencyCode: form.currencyCode,
      invoiceTypeCode: form.invoiceTypeCode,
      paymentMeansCode: form.paymentMeansCode || undefined,
      note: form.note || undefined,
      items: lineItems.map(li => ({
        businessItemId: li.businessItemId,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        lineDiscount: li.lineDiscount,
      })),
    };

    setSubmitting(true);
    try {
      await invoiceApi.create(payload);
      toast.success("Invoice created successfully.");
      navigate("/invoices");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to create invoice.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingLookups) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Create Invoice | Aegis NRS Portal" description="Create a new e-invoice" />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/invoices")}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Create Invoice</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Invoices will be submitted for approval then sent to NRS/NRS
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header fields */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Buyer / Party <span className="text-error-500">*</span>
              </label>
              <select value={form.partyId} onChange={handleFieldChange("partyId")} className={inputCls} required>
                <option value="">Select party...</option>
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.tin}</option>
                ))}
              </select>
              {parties.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No parties found. <a href="/parties" className="underline">Add one NRSt.</a></p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Invoice Type <span className="text-error-500">*</span>
              </label>
              <select value={form.invoiceTypeCode} onChange={handleFieldChange("invoiceTypeCode")} className={inputCls}>
                {INVOICE_TYPES.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Currency</label>
              <select value={form.currencyCode} onChange={handleFieldChange("currencyCode")} className={inputCls}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Issue Date <span className="text-error-500">*</span>
              </label>
              <input type="date" value={form.issueDate} onChange={handleFieldChange("issueDate")} className={inputCls} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={handleFieldChange("dueDate")} className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Method</label>
              <select value={form.paymentMeansCode} onChange={handleFieldChange("paymentMeansCode")} className={inputCls}>
                <option value="">— None —</option>
                {PAYMENT_MEANS.map(m => <option key={m.code} value={m.code}>{m.label}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Note (optional)</label>
              <textarea
                value={form.note}
                onChange={handleFieldChange("note")}
                rows={2}
                placeholder="Any notes to the buyer..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Line Items</h2>
            <button
              type="button"
              onClick={addLine}
              className="text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              + Add Line
            </button>
          </div>

          <div className="space-y-3">
            {/* Header row */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 px-1">
              <div className="col-span-4">Item</div>
              <div className="col-span-2 text-right">Unit Price (₦)</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Discount (₦)</div>
              <div className="col-span-1 text-right">Subtotal</div>
              <div className="col-span-1" />
            </div>

            {lineItems.map((li, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start border border-gray-100 dark:border-gray-700 rounded-xl p-3 lg:border-0 lg:p-0 lg:rounded-none">
                {/* Item select */}
                <div className="col-span-12 lg:col-span-4">
                  <label className="text-xs text-gray-400 lg:hidden mb-0.5 block">Item</label>
                  <select
                    value={li.businessItemId}
                    onChange={e => handleItemSelect(index, e.target.value)}
                    className={inputCls}
                    required
                  >
                    <option value="">Select item...</option>
                    {items.map(it => (
                      <option key={it.id} value={it.id}>{it.itemCode} — {it.description}</option>
                    ))}
                  </select>
                  {li._description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{li._description}</p>
                  )}
                </div>

                {/* Unit Price */}
                <div className="col-span-6 lg:col-span-2">
                  <label className="text-xs text-gray-400 lg:hidden mb-0.5 block">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={li.unitPrice}
                    onChange={e => handleLineChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    className={`${inputCls} text-right`}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-6 lg:col-span-2">
                  <label className="text-xs text-gray-400 lg:hidden mb-0.5 block">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={li.quantity}
                    onChange={e => handleLineChange(index, "quantity", parseInt(e.target.value) || 1)}
                    className={`${inputCls} text-center`}
                    required
                  />
                </div>

                {/* Discount */}
                <div className="col-span-6 lg:col-span-2">
                  <label className="text-xs text-gray-400 lg:hidden mb-0.5 block">Discount (₦)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={li.lineDiscount ?? 0}
                    onChange={e => handleLineChange(index, "lineDiscount", parseFloat(e.target.value) || 0)}
                    className={`${inputCls} text-right`}
                  />
                </div>

                {/* Subtotal */}
                <div className="col-span-5 lg:col-span-1 flex items-center justify-end">
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    ₦{lineTotal(li).toLocaleString()}
                  </span>
                </div>

                {/* Remove */}
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    disabled={lineItems.length === 1}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-20 transition-colors"
                    title="Remove line"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              No business items found. <a href="/items" className="underline">Add items NRSt.</a>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="max-w-xs ml-auto space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800 dark:text-white">₦{grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>VAT (7.5%)</span>
              <span className="font-medium text-gray-800 dark:text-white">₦{vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <span className="text-brand-500">₦{(grandTotal + vatAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </>
  );
}
