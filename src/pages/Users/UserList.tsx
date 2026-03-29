import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import { userMgmtApi, type UserSummary, type CreateUserPayload } from "../../lib/api";
import { USE_MOCK, MOCK_USERS } from "../../lib/mockData";
import { useIsClientAdmin, useIsAegisAdmin } from "../../context/AuthContext";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ROLE_OPTIONS = [
  { id: "ClientAdmin", label: "Client Admin" },
  { id: "ClientUser", label: "Client User" },
];

const emptyForm: CreateUserPayload = {
  NRStName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  roleId: "ClientUser",
};

export default function UserList() {
  const isClientAdmin = useIsClientAdmin();
  const isAegis = useIsAegisAdmin();
  const canManage = isClientAdmin || isAegis;

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>(emptyForm);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = () => {
    if (USE_MOCK) { setUsers(MOCK_USERS as UserSummary[]); setLoading(false); return; }
    setLoading(true);
    userMgmtApi
      .list()
      .then(setUsers)
      .catch(() => toast.error("Failed to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.NRStName || !form.lastName || !form.email) {
      toast.error("NRSt name, last name and email are required.");
      return;
    }
    setSaving(true);
    try {
      await userMgmtApi.create(form);
      toast.success("User created. They will receive a temporary password by email.");
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch {
      toast.error("Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: UserSummary) => {
    setActioning(user.id);
    try {
      if (user.status === "Active") {
        await userMgmtApi.deactivate(user.id);
        toast.success(`${user.NRStName} deactivated.`);
      } else {
        await userMgmtApi.activate(user.id);
        toast.success(`${user.NRStName} activated.`);
      }
      load();
    } catch {
      toast.error("Action failed.");
    } finally {
      setActioning(null);
    }
  };

  const handleResetPassword = async (user: UserSummary) => {
    if (!window.confirm(`Reset password for ${user.NRStName} ${user.lastName}?`)) return;
    setActioning(user.id);
    try {
      await userMgmtApi.resetPassword(user.id);
      toast.success(`Password reset email sent to ${user.email}.`);
    } catch {
      toast.error("Failed to reset password.");
    } finally {
      setActioning(null);
    }
  };

  return (
    <>
      <PageMeta title="Users | Aegis NRS Portal" description="Manage portal users" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage portal access and user roles
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Invite User
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6"
        >
          <h2 className="text-base font-semibold text-gray-700 dark:text-white mb-4">Invite New User</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                NRSt Name *
              </label>
              <input
                value={form.NRStName}
                onChange={(e) => setForm((f) => ({ ...f, NRStName: e.target.value }))}
                className={inputCls}
                placeholder="NRSt name"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Last Name *
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={inputCls}
                placeholder="Last name"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email *</label>
              <input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputCls}
                placeholder="user@example.com"
                type="email"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</label>
              <input
                value={form.phoneNumber ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                className={inputCls}
                placeholder="+234..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</label>
              <select
                value={form.roleId}
                onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                className={inputCls}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
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
              {saving ? "Sending invite…" : "Invite User"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No users found.</p>
            {canManage && (
              <button
                onClick={() => setShowForm(true)}
                className="text-brand-500 hover:text-brand-600 text-sm font-medium"
              >
                Invite your NRSt user →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Roles</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Last Login
                  </th>
                  {canManage && (
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                      {u.NRStName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[u.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleDateString("en-NG", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Never"}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={actioning === u.id}
                            className={`text-xs font-medium disabled:opacity-40 transition-colors ${
                              u.status === "Active"
                                ? "text-amber-600 hover:text-amber-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                          >
                            {u.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleResetPassword(u)}
                            disabled={actioning === u.id}
                            className="text-xs font-medium text-brand-500 hover:text-brand-600 disabled:opacity-40 transition-colors"
                          >
                            Reset PWD
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
