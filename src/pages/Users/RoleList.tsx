import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import { SkeletonTableRows } from "../../components/ui/skeleton/Skeleton";
import {
  roleApi,
  type RoleSummary,
  type CreateRolePayload,
} from "../../lib/api";
import { USE_MOCK, MOCK_ROLES } from "../../lib/mockData";
import { useIsAdmin } from "../../context/AuthContext";

// Permissions available when building custom roles.
// Mirrors PermissionConstants.ClientAdminAssignablePermissions.
// Note: app-mode switching (business.manage_settings) and
// integration management (system.manage_integrations) are reserved
// for the built-in ClientAdmin system role and cannot be delegated.
const ASSIGNABLE_PERMISSIONS: {
  group: string;
  items: { value: string; label: string }[];
}[] = [
  {
    group: "Invoices",
    items: [
      { value: "invoices.create", label: "Create" },
      { value: "invoices.view", label: "View" },
      { value: "invoices.update", label: "Update" },
      { value: "invoices.delete", label: "Delete" },
      { value: "invoices.submit", label: "Submit to NRS" },
      { value: "invoices.approve", label: "Approve" },
      { value: "invoices.reject", label: "Reject" },
    ],
  },
  {
    group: "Parties",
    items: [
      { value: "parties.create", label: "Create" },
      { value: "parties.view", label: "View" },
      { value: "parties.update", label: "Update" },
      { value: "parties.delete", label: "Delete" },
    ],
  },
  {
    group: "Items",
    items: [
      { value: "items.create", label: "Create" },
      { value: "items.view", label: "View" },
      { value: "items.update", label: "Update" },
      { value: "items.delete", label: "Delete" },
    ],
  },
  {
    group: "Users",
    items: [
      { value: "users.create", label: "Create" },
      { value: "users.view", label: "View" },
      { value: "users.update", label: "Update" },
      { value: "users.delete", label: "Delete" },
      { value: "users.activate", label: "Activate" },
      { value: "users.deactivate", label: "Deactivate" },
      { value: "users.reset_password", label: "Reset Password" },
    ],
  },
  {
    group: "Business",
    items: [
      { value: "business.view", label: "View" },
      { value: "business.update", label: "Update" },
      { value: "business.manage_branches", label: "Manage Branches" },
    ],
  },
  {
    group: "Reports & Audit",
    items: [
      { value: "system.view_audit_logs", label: "View Audit Logs" },
      { value: "system.view_integration_logs", label: "View Integration Logs" },
    ],
  },
];

const inputCls =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

const emptyForm: CreateRolePayload = {
  name: "",
  description: "",
  permissions: [],
};

function GroupCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
    />
  );
}

export default function RoleList() {
  const isAdmin = useIsAdmin();

  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateRolePayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Edit-permissions panel
  const [editRole, setEditRole] = useState<RoleSummary | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState<RoleSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    if (USE_MOCK) {
      setRoles(MOCK_ROLES as RoleSummary[]);
      setLoading(false);
      return;
    }
    setLoading(true);
    roleApi
      .list()
      .then(setRoles)
      .catch(() => toast.error("Failed to load roles."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // ── Create custom role ─────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Role name is required.");
      return;
    }
    if (form.permissions.length === 0) {
      toast.error("Select at least one permission.");
      return;
    }
    setSaving(true);
    try {
      if (!USE_MOCK) await roleApi.create(form);
      toast.success(`Role '${form.name}' created.`);
      setForm(emptyForm);
      setShowForm(false);
      load();
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
        toast.error(e?.response?.data?.message || "Failed to create role.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleFormPerm = (value: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(value)
        ? f.permissions.filter((p) => p !== value)
        : [...f.permissions, value],
    }));
  };

  // ── Edit permissions ───────────────────────────────────────────────────────
  const openEdit = (role: RoleSummary) => {
    setEditRole(role);
    setEditPerms([...role.permissions]);
  };

  const toggleEditPerm = (value: string) => {
    setEditPerms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  };

  const handleSaveEdit = async () => {
    if (!editRole) return;
    if (editPerms.length === 0) {
      toast.error("Select at least one permission.");
      return;
    }
    setEditSaving(true);
    try {
      if (!USE_MOCK)
        await roleApi.updatePermissions(editRole.id, {
          permissions: editPerms,
        });
      toast.success(`Permissions updated for '${editRole.name}'.`);
      setEditRole(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        e?.response?.data?.message || "Failed to update permissions.",
      );
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (!USE_MOCK) await roleApi.delete(deleteTarget.id);
      toast.success(`Role '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Failed to delete role.");
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Roles | Aegis EInvoicing Portal"
        description="Manage custom roles and permissions for your organisation"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Roles
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            System roles are read-only. Create custom roles to assign specific
            permissions.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          + Create Custom Role
        </button>
      </div>

      {/* Create Role Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6"
        >
          <h2 className="text-base font-semibold text-gray-700 dark:text-white mb-4">
            New Custom Role
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Invoice Approver"
                value={form.name}
                maxLength={50}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="Short description of this role's purpose"
                value={form.description}
                maxLength={200}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Permission checkboxes */}
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
            Permissions <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {ASSIGNABLE_PERMISSIONS.map((group) => {
              const groupValues = group.items.map((i) => i.value);
              const selectedCount = groupValues.filter((v) =>
                form.permissions.includes(v),
              ).length;
              const allSelected = selectedCount === groupValues.length;
              const someSelected = selectedCount > 0 && !allSelected;
              return (
                <div key={group.group}>
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <GroupCheckbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(on) =>
                        setForm((f) => ({
                          ...f,
                          permissions: on
                            ? [...new Set([...f.permissions, ...groupValues])]
                            : f.permissions.filter(
                                (p) => !groupValues.includes(p),
                              ),
                        }))
                      }
                    />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {group.group}
                    </span>
                  </label>
                  <div className="space-y-1.5 pl-6">
                    {group.items.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(item.value)}
                          onChange={() => toggleFormPerm(item.value)}
                          className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
            >
              {saving ? "Creating…" : "Create Role"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <SkeletonTableRows
                  rows={6}
                  colWidths={["w-36", "w-24", "w-48", "w-16", "w-20"]}
                />
              </tbody>
            </table>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Permissions
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                  Users
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {role.name}
                      </span>
                      {role.isSystemRole && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs">
                      {role.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                    {role.category}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {role.permissions.slice(0, 5).map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 text-[10px] bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded font-medium"
                        >
                          {p.replace(/\./g, " › ")}
                        </span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                          +{role.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">
                    {role.assignedUserCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {role.isSystemRole ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Read-only
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(role)}
                          className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
                        >
                          Edit Permissions
                        </button>
                        <button
                          onClick={() => setDeleteTarget(role)}
                          className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Permissions Slide-over / Modal */}
      {editRole && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
              Edit Permissions — {editRole.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {editRole.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {ASSIGNABLE_PERMISSIONS.map((group) => {
                const groupValues = group.items.map((i) => i.value);
                const selectedCount = groupValues.filter((v) =>
                  editPerms.includes(v),
                ).length;
                const allSelected = selectedCount === groupValues.length;
                const someSelected = selectedCount > 0 && !allSelected;
                return (
                  <div key={group.group}>
                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                      <GroupCheckbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={(on) =>
                          setEditPerms((prev) =>
                            on
                              ? [...new Set([...prev, ...groupValues])]
                              : prev.filter((p) => !groupValues.includes(p)),
                          )
                        }
                      />
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {group.group}
                      </span>
                    </label>
                    <div className="space-y-1.5 pl-6">
                      {group.items.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editPerms.includes(item.value)}
                            onChange={() => toggleEditPerm(item.value)}
                            className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
              >
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditRole(null)}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2">
              Delete Role?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {deleteTarget.name}
              </span>
              ? This cannot be undone. Users currently holding this role must be
              reassigned first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
