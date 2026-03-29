import api, { unwrap } from "./apiClient";
import type { ApiResponse } from "./apiClient";

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginPayload { email: string; password: string; }
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  tenantId?: string;
  mustChangePassword: boolean;
  expiresAt: string;
  claims: TokenClaims;
  terminatedSessionCount: number;
  sessionWarning?: string;
}
export interface TokenClaims {
  NRStName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  businessId?: string;
  branchId?: string;
  isAegisUser: boolean;
  aegisRole?: string;
  subscriptionTier?: string;
}
export interface RegisterPayload {
  adminNRStName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  businessName: string;
  platformSubscriptionId: string;
  billingCycle: number; // 0=Monthly, 1=Annual
}
export interface RegisterResponse {
  pendingRegistrationId: string;
  reference: string;
  paymentUrl: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", payload).then(unwrap),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<RegisterResponse>>("/auth/register", payload).then(unwrap),

  logout: () => api.post("/auth/logout"),

  refresh: () => api.post<ApiResponse<{ accessToken: string; expiresAt: string }>>("/auth/refresh").then(unwrap),

  tokenClaims: () => api.get<ApiResponse<TokenClaims>>("/auth/token-claims").then(unwrap),

  sendOtp: (phoneNo_Email: string) =>
    api.post("/auth/forgot-password-request-otp", { phoneNo_Email }),

  forgotPassword: (payload: { otp: string; password: string; phoneNo_Email: string }) =>
    api.post("/auth/forgot-password", payload),

  changePassword: (payload: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
    api.post("/auth/change-password", payload),
};

// ── Payment / Plans ───────────────────────────────────────────────────────────
export interface SubscriptionPlan {
  id: string;
  planName: string;
  tier: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  description: string;
}
export interface PaymentVerification {
  reference: string;
  status: string;
  isSuccessful: boolean;
  businessId?: string;
  message: string;
}

export const paymentApi = {
  getPlans: () =>
    api.get<ApiResponse<SubscriptionPlan[]>>("/payment/plans").then(unwrap),

  verify: (reference: string) =>
    api.get<ApiResponse<PaymentVerification>>(`/payment/verify/${reference}`).then(unwrap),
};

// ── Business ──────────────────────────────────────────────────────────────────
export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  businessRegistrationNumber: string;
  taxIdentificationNumber: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  serviceId: string;
  NRSBusinessId: string;
  isActive: boolean;
  registeredAddress: Address;
  onboardingCompleted?: boolean;
}
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}
export interface DashboardStats {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  pendingOnboardings: number;
  expiredSubscriptions: number;
  saaSBusinesses: number;
  onPremiseBusinesses: number;
  portalPlanBusinesses: number;
  sftpPlanBusinesses: number;
  apiPlanBusinesses: number;
  totalInvoices: number;
  totalInvoicesThisMonth: number;
  draftInvoices: number;
  pendingApprovalInvoices: number;
  submittedToNRS: number;
  confirmedByNRS: number;
  rejectedInvoices: number;
  portalCreatedInvoices: number;
  sftpCreatedInvoices: number;
  apiCreatedInvoices: number;
  totalInvoiceValue: number;
  totalVatCollected: number;
  totalInvoiceValueThisMonth: number;
  totalVatThisMonth: number;
  totalIRNsGenerated: number;
  pendingIRNs: number;
  paidInvoices: number;
  unpaidInvoices: number;
  partiallyPaidInvoices: number;
  totalReceivedInvoices: number;
  pendingRegistrations: number;
}

export const businessApi = {
  getProfile: () =>
    api.get<ApiResponse<BusinessProfile>>("/business/me").then(unwrap),

  getDashboardStats: () =>
    api.get<ApiResponse<DashboardStats>>("/business/dashboard/stats").then(unwrap),

  updateNRSCredentials: (payload: { apiKey: string; clientSecret: string }) =>
    api.patch("/business/update-NRS-credentials", payload),

  updateQrCodeConfig: (payload: { publicKey: string; certificate: string }) =>
    api.patch("/business/update-qrcode-configuration", payload),

  getSubscription: (businessId: string) =>
    api.get(`/business/get-subscription/${businessId}`).then(r => r.data.data),

  updateProfile: (payload: Partial<Omit<BusinessProfile, "id" | "isActive" | "onboardingCompleted">>) =>
    api.patch<ApiResponse<BusinessProfile>>("/business/me", payload).then(unwrap),
};

// ── Invoices ──────────────────────────────────────────────────────────────────
export interface InvoiceSummary {
  id: string;
  invoiceCode: string;
  irn?: string;
  issueDate: string;
  dueDate?: string;
  totalAmount: number;
  totalTaxAmount: number;
  status: string;
  paymentStatus: string;
  source: string;
  partyName?: string;
}
export interface PaginatedResult<T> { items: T[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number; }
export interface CreateInvoicePayload {
  partyId: string;
  issueDate: string;
  dueDate?: string;
  currencyCode: string;
  invoiceTypeCode: string;
  paymentMeansCode?: string;
  note?: string;
  items: InvoiceItemPayload[];
}
export interface InvoiceItemPayload {
  businessItemId: string;
  quantity: number;
  unitPrice: number;
  lineDiscount?: number;
}

export const invoiceApi = {
  list: (params?: { page?: number; pageSize?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedResult<InvoiceSummary>>>("/invoice", { params }).then(unwrap),

  get: (id: string) => api.get<ApiResponse<unknown>>(`/invoice/${id}`).then(unwrap),

  create: (payload: CreateInvoicePayload) =>
    api.post<ApiResponse<unknown>>("/invoice", payload).then(unwrap),

  approve: (id: string) => api.post(`/invoice/${id}/approve`),

  reject: (id: string, reason: string) => api.post(`/invoice/${id}/reject`, { reason }),

  updatePaymentStatus: (payload: { invoiceId: string; paymentStatus: string; paymentReference?: string }) =>
    api.put("/invoice/update-invoice-payment-status", payload),

  receivedList: (params?: { page?: number; pageSize?: number }) =>
    api.get<ApiResponse<PaginatedResult<InvoiceSummary>>>("/invoice/received-invoices", { params }).then(unwrap),
};

// ── Parties ───────────────────────────────────────────────────────────────────
export interface Party {
  id: string;
  name: string;
  tin: string;
  contactEmail?: string;
  contactPhone?: string;
  role: string;
  address?: Address;
}
export interface CreatePartyPayload {
  name: string;
  tin: string;
  contactEmail?: string;
  contactPhone?: string;
  role: string;
  address?: Address;
}

export const partyApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    api.get<ApiResponse<PaginatedResult<Party>>>("/party", { params }).then(unwrap),
  create: (payload: CreatePartyPayload) => api.post<ApiResponse<Party>>("/party", payload).then(unwrap),
  update: (id: string, payload: Partial<CreatePartyPayload>) => api.put(`/party/${id}`, payload),
  delete: (id: string) => api.delete(`/party/${id}`),
};

// ── Business Items ────────────────────────────────────────────────────────────
export interface BusinessItem {
  id: string;
  itemCode: string;
  description: string;
  unitPrice: number;
  taxCategories?: string[];
}
export interface CreateBusinessItemPayload {
  itemCode: string;
  description: string;
  unitPrice: number;
  taxCategories?: string[];
}

export const businessItemApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    api.get<ApiResponse<PaginatedResult<BusinessItem>>>("/businessitem", { params }).then(unwrap),
  create: (payload: CreateBusinessItemPayload) => api.post<ApiResponse<BusinessItem>>("/businessitem", payload).then(unwrap),
  update: (id: string, payload: Partial<CreateBusinessItemPayload>) => api.put(`/businessitem/${id}`, payload),
  delete: (id: string) => api.delete(`/businessitem/${id}`),
};

// ── User Management ───────────────────────────────────────────────────────────
export interface UserSummary {
  id: string;
  NRStName: string;
  lastName: string;
  email: string;
  status: string;
  roles: string[];
  lastLogin?: string;
}
export interface CreateUserPayload {
  NRStName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roleId: string;
}

export const userMgmtApi = {
  list: () => api.get<ApiResponse<UserSummary[]>>("/usermanagement/users").then(unwrap),
  create: (payload: CreateUserPayload) => api.post<ApiResponse<UserSummary>>("/usermanagement/users", payload).then(unwrap),
  activate: (userId: string) => api.post(`/usermanagement/users/${userId}/activate`),
  deactivate: (userId: string) => api.post(`/usermanagement/users/${userId}/deactivate`),
  resetPassword: (userId: string) => api.post(`/usermanagement/users/${userId}/reset-password`),
  assignRole: (userId: string, roleId: string) => api.post(`/usermanagement/users/${userId}/roles`, { roleId }),
};

// ── Miscellaneous ─────────────────────────────────────────────────────────────
export const miscApi = {
  getIndustries: () => api.get<ApiResponse<{ name: string }[]>>("/miscellenous/industry").then(unwrap),
  getStates: () => api.get<ApiResponse<{ name: string }[]>>("/miscellenous/states").then(unwrap),
  getCities: (state: string) => api.get<ApiResponse<{ name: string }[]>>(`/miscellenous/cities/${state}`).then(unwrap),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get<ApiResponse<unknown>>("/userprofile").then(unwrap),
  update: (payload: unknown) => api.put("/userprofile", payload),
};
