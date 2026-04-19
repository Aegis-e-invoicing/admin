import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import {
  userMgmtApi,
  aegisUserApi,
  type UserSummary,
  type AegisUserSummary,
  type CreateUserPayload,
  type CreateAegisUserPayload,
} from "../../lib/api";
import { USE_MOCK, MOCK_USERS, MOCK_AEGIS_USERS } from "../../lib/mockData";
import { useIsAdmin, useIsAegis } from "../../context/AuthContext";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

const STATUS_COLORS: Record<string, string> = {
  Active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const CLIENT_ROLE_OPTIONS = [
  { id: "Admin", label: "Client Admin" },
  { id: "User", label: "Client User" },
];

const AEGIS_ROLE_OPTIONS = [
  { id: "SuperAdmin", label: "Super Admin" },
  { id: "Operations", label: "Operations" },
  { id: "Support", label: "Support" },
];

const emptyClientForm: CreateUserPayload = {
  NRStName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  roleId: "User",
};

const emptyAegisForm: CreateAegisUserPayload = {
  NRStName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  aegisRole: "Support",
};

export default function UserList() {
  const isAdmin = useIsAdmin();
  const isAegis = useIsAegis();
  const canManage = isAdmin || isAegis;

  const [users, setUsers] = useState<(UserSummary | AegisUserSummary)[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientForm, setClientForm] =
    useState<CreateUserPayload>(emptyClientForm);
  const [aegisForm, setAegisForm] =
    useState<CreateAegisUserPayload>(emptyAegisForm);
  const [actioning, setActioning] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState<
    UserSummary | AegisUserSummary | null
  >(null);
  const [toggleModal, setToggleModal] = useState<
    UserSummary | AegisUserSummary | null
  >(null);

  const [allUsers, setAllUsers] = useState<(UserSummary | AegisUserSummary)[]>(
    [],
  );

  const load = () => {
    if (USE_MOCK) {
      setAllUsers(
        isAegis
          ? (MOCK_AEGIS_USERS as AegisUserSummary[])
          : (MOCK_USERS as UserSummary[]),
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchPromise = isAegis ? aegisUserApi.list() : userMgmtApi.list();
    fetchPromise
      .then(setAllUsers)
      .catch(() => toast.error("Failed to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const total = Math.ceil(allUsers.length / pageSize);
    setTotalPages(total > 0 ? total : 1);
    setUsers(allUsers.slice((page - 1) * pageSize, page * pageSize));
  }, [page, pageSize, allUsers]);

  const handlePageSizeChange = (ps: number) => {
    setPageSize(ps);
    setPage(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = isAegis ? aegisForm : clientForm;
    if (!form.NRStName || !form.lastName || !form.email) {
      toast.error("NRSt name, last name and email are required.");
      return;
    }
    setSaving(true);
    try {
      if (isAegis) {
        if (!USE_MOCK) await aegisUserApi.create(aegisForm);
        toast.success(
          "Aegis staff user created. They will receive a temporary password by email.",
        );
        setAegisForm(emptyAegisForm);
      } else {
        if (!USE_MOCK) await userMgmtApi.create(clientForm);
        toast.success(
          "User created. They will receive a temporary password by email.",
        );
        setClientForm(emptyClientForm);
      }
      setShowForm(false);
      load();
    } catch {
      toast.error("Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (user: UserSummary | AegisUserSummary) => {
    setToggleModal(user);
  };

  const confirmToggleStatus = async () => {
    if (!toggleModal) return;
    const user = toggleModal;
    setToggleModal(null);
    setActioning(user.id);
    try {
      if (user.status === "Active") {
        if (!USE_MOCK) {
          isAegis
            ? await aegisUserApi.deactivate(user.id)
            : await userMgmtApi.deactivate(user.id);
        }
        toast.success(`${user.NRStName} deactivated.`);
      } else {
        if (!USE_MOCK) {
          isAegis
            ? await aegisUserApi.activate(user.id)
            : await userMgmtApi.activate(user.id);
        }
        toast.success(`${user.NRStName} activated.`);
      }
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: user.status === "Active" ? "Inactive" : "Active" }
            : u,
        ),
      );
    } catch {
      toast.error("Action failed.");
    } finally {
      setActioning(null);
    }
  };

  const handleResetPassword = (user: UserSummary | AegisUserSummary) => {
    setResetModal(user);
  };

  const confirmResetPassword = async () => {
    if (!resetModal) return;
    const user = resetModal;
    setResetModal(null);
    setActioning(user.id);
    try {
      if (!USE_MOCK) {
        isAegis
          ? await aegisUserApi.resetPassword(user.id)
          : await userMgmtApi.resetPassword(user.id);
      }
      toast.success(`Password reset email sent to ${user.email}.`);
    } catch {
      toast.error("Failed to reset password.");
    } finally {
      setActioning(null);
    }
  };

  return (
    <>
      <PageMeta
        title={
          isAegis
            ? "Aegis Staff | Aegis EInvoicing Platform"
            : "Users | Aegis EInvoicing Portal"
        }
        description={
          isAegis ? "Manage Aegis platform staff users" : "Manage portal users"
        }
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isAegis ? "Aegis Staff" : "Users"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isAegis
              ? "Manage Aegis platform staff accounts and roles"
              : "Manage portal access and user roles"}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Invite {isAegis ? "Staff" : "User"}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6"
        >
          <h2 className="text-base font-semibold text-gray-700 dark:text-white mb-4">
            Invite {isAegis ? "New Staff" : "New User"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                First Name *
              </label>
              <input
                value={isAegis ? aegisForm.NRStName : clientForm.NRStName}
                onChange={(e) =>
                  isAegis
                    ? setAegisForm((f) => ({ ...f, NRStName: e.target.value }))
                    : setClientForm((f) => ({ ...f, NRStName: e.target.value }))
                }
                className={inputCls}
                placeholder="First name"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Last Name *
              </label>
              <input
                value={isAegis ? aegisForm.lastName : clientForm.lastName}
                onChange={(e) =>
                  isAegis
                    ? setAegisForm((f) => ({ ...f, lastName: e.target.value }))
                    : setClientForm((f) => ({ ...f, lastName: e.target.value }))
                }
                className={inputCls}
                placeholder="Last name"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Email *
              </label>
              <input
                value={isAegis ? aegisForm.email : clientForm.email}
                onChange={(e) =>
                  isAegis
                    ? setAegisForm((f) => ({ ...f, email: e.target.value }))
                    : setClientForm((f) => ({ ...f, email: e.target.value }))
                }
                className={inputCls}
                placeholder={
                  isAegis ? "staff@aegisnrs.com" : "user@example.com"
                }
                type="email"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Phone
              </label>
              <input
                value={
                  (isAegis ? aegisForm.phoneNumber : clientForm.phoneNumber) ??
                  ""
                }
                onChange={(e) =>
                  isAegis
                    ? setAegisForm((f) => ({
                        ...f,
                        phoneNumber: e.target.value,
                      }))
                    : setClientForm((f) => ({
                        ...f,
                        phoneNumber: e.target.value,
                      }))
                }
                className={inputCls}
                placeholder="+234..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Role
              </label>
              {isAegis ? (
                <select
                  value={aegisForm.aegisRole}
                  onChange={(e) =>
                    setAegisForm((f) => ({ ...f, aegisRole: e.target.value }))
                  }
                  className={inputCls}
                >
                  {AEGIS_ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={clientForm.roleId}
                  onChange={(e) =>
                    setClientForm((f) => ({ ...f, roleId: e.target.value }))
                  }
                  className={inputCls}
                >
                  {CLIENT_ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-red-500 dark:border-red-500 text-sm rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-xl disabled:opacity-50 transition-colors"
            >
              {saving ? "Sending invite…" : "Invite"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {allUsers.length > 0
              ? `${allUsers.length} user${allUsers.length !== 1 ? "s" : ""}`
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
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              No users found.
            </p>
            {canManage && (
              <button
                onClick={() => setShowForm(true)}
                className="text-brand-500 hover:text-brand-600 text-sm font-medium"
              >
                {isAegis
                  ? "Invite a staff member →"
                  : "Invite your first user →"}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    {isAegis ? "Platform Role" : "Roles"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
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
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {isAegis
                          ? (u as AegisUserSummary).aegisRole && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                                {(u as AegisUserSummary).aegisRole}
                              </span>
                            )
                          : (u as UserSummary).roles?.map((role) => (
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

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Reset Password Confirmation Modal ── */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                Reset Password
              </h2>
              <button
                onClick={() => setResetModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
            <div className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Send a password reset email to{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {resetModal.NRStName} {resetModal.lastName}
                </span>
                ?
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {resetModal.email}
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setResetModal(null)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetPassword}
                className="px-4 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
              >
                Send Reset Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Activate / Deactivate Confirmation Modal ── */}
      {toggleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                {toggleModal.status === "Active" ? "Deactivate" : "Activate"}{" "}
                User
              </h2>
              <button
                onClick={() => setToggleModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
            <div className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {toggleModal.status === "Active" ? "Deactivate" : "Activate"}{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {toggleModal.NRStName} {toggleModal.lastName}
                </span>
                ?
              </p>
              {toggleModal.status === "Active" && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  This user will no longer be able to log in.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setToggleModal(null)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors text-white ${
                  toggleModal.status === "Active"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {toggleModal.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
