import { useAuth } from "../context/AuthContext";

/**
 * Returns helper functions to check whether the current user holds specific permissions.
 *
 * Permissions are resolved from the JWT on login and stored in AuthContext.
 * AegisAdmins hold all permissions by convention ("*" is never stored — the backend
 * simply grants every permission claim, but you can also use `isAegisUser` as a
 * shortcut for a blanket allow).
 *
 * @example
 * const { can, canAny, canAll } = usePermissions();
 *
 * // Show the "Delete" button only if the user has the permission
 * {can("invoices.delete") && <button>Delete</button>}
 *
 * // Show the "Actions" column if the user has either approve or reject
 * {canAny("invoices.approve", "invoices.reject") && <ActionsColumn />}
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = user?.permissions ?? [];
  const isAegisUser = user?.isAegisUser ?? false;

  /** True if the user holds the specified permission (or is an Aegis platform user). */
  const can = (permission: string): boolean => {
    if (isAegisUser) return true;
    return permissions.includes(permission);
  };

  /** True if the user holds at least one of the given permissions. */
  const canAny = (...perms: string[]): boolean => {
    if (isAegisUser) return true;
    return perms.some((p) => permissions.includes(p));
  };

  /** True if the user holds ALL of the given permissions. */
  const canAll = (...perms: string[]): boolean => {
    if (isAegisUser) return true;
    return perms.every((p) => permissions.includes(p));
  };

  return { can, canAny, canAll, permissions, isAegisUser };
}

/** Permission string constants mirroring the backend PermissionConstants.cs */
export const Permission = {
  // Invoices
  CreateInvoices: "invoices.create",
  ViewInvoices: "invoices.view",
  UpdateInvoices: "invoices.update",
  DeleteInvoices: "invoices.delete",
  SubmitInvoices: "invoices.submit",
  ApproveInvoices: "invoices.approve",
  RejectInvoices: "invoices.reject",

  // Parties (customers / suppliers)
  CreateParties: "parties.create",
  ViewParties: "parties.view",
  UpdateParties: "parties.update",
  DeleteParties: "parties.delete",

  // Items / Products
  CreateItems: "items.create",
  ViewItems: "items.view",
  UpdateItems: "items.update",
  DeleteItems: "items.delete",

  // Users
  CreateUsers: "users.create",
  ViewUsers: "users.view",
  UpdateUsers: "users.update",
  DeleteUsers: "users.delete",
  ActivateUsers: "users.activate",
  DeactivateUsers: "users.deactivate",
  ResetPasswords: "users.reset_password",

  // Roles
  CreateRoles: "roles.create",
  ViewRoles: "roles.view",
  UpdateRoles: "roles.update",
  DeleteRoles: "roles.delete",
  AssignRoles: "roles.assign",
  RevokeRoles: "roles.revoke",

  // Business
  ViewBusiness: "business.view",
  UpdateBusiness: "business.update",
  ManageBusinessSettings: "business.manage_settings",
  ManageBranches: "business.manage_branches",
  ManageCertificates: "business.manage_certificates",

  // System
  ViewAuditLogs: "system.view_audit_logs",
  ViewIntegrationLogs: "system.view_integration_logs",
  ManageIntegrations: "system.manage_integrations",
} as const;
