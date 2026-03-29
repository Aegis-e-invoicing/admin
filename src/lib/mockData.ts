/**
 * MOCK DATA — for UI review only.
 * Set USE_MOCK = false when the backend is ready.
 */
export const USE_MOCK = true;

// ─── Auth User ────────────────────────────────────────────────────────────────
export const MOCK_USER = {
  userId: "mock-user-001",
  businessId: "mock-biz-001",
  NRStName: "Chidi",
  lastName: "Okonkwo",
  email: "chidi.okonkwo@acmeng.com",
  roles: ["ClientAdmin"],
  permissions: ["invoice:create", "invoice:approve", "party:manage", "user:manage"],
  isAegisUser: false,
  aegisRole: undefined,
  subscriptionTier: "SaaS",
  mustChangePassword: false,
};

// Uncomment the below instead of MOCK_USER to review the Aegis admin view:
// export const MOCK_USER = {
//   userId: "aegis-admin-001",
//   businessId: undefined,
//   NRStName: "Emeka",
//   lastName: "Adeyemi",
//   email: "emeka.adeyemi@aegisnrs.com",
//   roles: ["AegisAdmin"],
//   permissions: [],
//   isAegisUser: true,
//   aegisRole: "SuperAdmin",
//   subscriptionTier: undefined,
//   mustChangePassword: false,
// };

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
  // Business
  totalBusinesses: 47,
  activeBusinesses: 38,
  suspendedBusinesses: 3,
  pendingOnboardings: 6,
  expiredSubscriptions: 2,
  saaSBusinesses: 21,
  onPremiseBusinesses: 0,
  portalPlanBusinesses: 21,
  sftpPlanBusinesses: 14,
  apiPlanBusinesses: 12,
  pendingRegistrations: 5,
  // Invoices
  totalInvoices: 284,
  totalInvoicesThisMonth: 42,
  draftInvoices: 18,
  pendingApprovalInvoices: 9,
  submittedToNRS: 197,
  confirmedByNRS: 183,
  rejectedInvoices: 7,
  portalCreatedInvoices: 140,
  sftpCreatedInvoices: 92,
  apiCreatedInvoices: 52,
  // Financial
  totalInvoiceValue: 185_400_000,
  totalVatCollected: 13_905_000,
  totalInvoiceValueThisMonth: 24_300_000,
  totalVatThisMonth: 1_822_500,
  // IRN
  totalIRNsGenerated: 183,
  pendingIRNs: 14,
  // Payment
  paidInvoices: 142,
  unpaidInvoices: 89,
  partiallyPaidInvoices: 53,
  // Received
  totalReceivedInvoices: 76,
};

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const MOCK_INVOICES = [
  {
    id: "inv-001", invoiceCode: "INV-2025-0042", irn: "FIR20250042ACME0000001",
    issueDate: "2025-03-20", dueDate: "2025-04-20",
    totalAmount: 4_720_000, totalTaxAmount: 354_000,
    status: "ConfirmedByNRS", paymentStatus: "Paid",
    source: "Portal", partyName: "Dangote Industries Ltd",
  },
  {
    id: "inv-002", invoiceCode: "INV-2025-0041", irn: "FIR20250041ACME0000002",
    issueDate: "2025-03-18", dueDate: "2025-04-18",
    totalAmount: 1_850_000, totalTaxAmount: 138_750,
    status: "SubmittedToNRS", paymentStatus: "Unpaid",
    source: "Portal", partyName: "MTN Nigeria Comm. Plc",
  },
  {
    id: "inv-003", invoiceCode: "INV-2025-0040", irn: undefined,
    issueDate: "2025-03-15", dueDate: "2025-04-15",
    totalAmount: 920_000, totalTaxAmount: 69_000,
    status: "PendingApproval", paymentStatus: "Unpaid",
    source: "Portal", partyName: "Zenith Bank Plc",
  },
  {
    id: "inv-004", invoiceCode: "INV-2025-0039", irn: undefined,
    issueDate: "2025-03-10", dueDate: "2025-04-10",
    totalAmount: 560_000, totalTaxAmount: 42_000,
    status: "Draft", paymentStatus: "Unpaid",
    source: "Portal", partyName: "NRSt Bank of Nigeria",
  },
  {
    id: "inv-005", invoiceCode: "INV-2025-0038", irn: "FIR20250038ACME0000005",
    issueDate: "2025-03-05", dueDate: "2025-04-05",
    totalAmount: 2_300_000, totalTaxAmount: 172_500,
    status: "ConfirmedByNRS", paymentStatus: "PartiallyPaid",
    source: "Portal", partyName: "Airtel Nigeria Ltd",
  },
  {
    id: "inv-006", invoiceCode: "INV-2025-0037", irn: "FIR20250037ACME0000006",
    issueDate: "2025-02-28", dueDate: "2025-03-28",
    totalAmount: 780_000, totalTaxAmount: 58_500,
    status: "Rejected", paymentStatus: "Unpaid",
    source: "Portal", partyName: "Nestle Nigeria Plc",
  },
  {
    id: "inv-007", invoiceCode: "INV-2025-0036", irn: "FIR20250036ACME0000007",
    issueDate: "2025-02-20", dueDate: "2025-03-20",
    totalAmount: 3_120_000, totalTaxAmount: 234_000,
    status: "ConfirmedByNRS", paymentStatus: "Paid",
    source: "Portal", partyName: "Dangote Industries Ltd",
  },
  {
    id: "inv-008", invoiceCode: "INV-2025-0035", irn: undefined,
    issueDate: "2025-02-15", dueDate: undefined,
    totalAmount: 490_000, totalTaxAmount: 36_750,
    status: "Approved", paymentStatus: "Unpaid",
    source: "Portal", partyName: "Unilever Nigeria Plc",
  },
];

export const MOCK_RECEIVED_INVOICES = [
  {
    id: "rec-001", invoiceCode: "SUPINV-2025-0018", irn: "FIR20250018SUPP0000001",
    issueDate: "2025-03-22", dueDate: "2025-04-22",
    totalAmount: 3_500_000, totalTaxAmount: 262_500,
    status: "ConfirmedByNRS", paymentStatus: "Unpaid",
    source: "SFTP", partyName: "Lafarge Africa Plc",
  },
  {
    id: "rec-002", invoiceCode: "SUPINV-2025-0017", irn: "FIR20250017SUPP0000002",
    issueDate: "2025-03-18", dueDate: "2025-04-18",
    totalAmount: 1_200_000, totalTaxAmount: 90_000,
    status: "ConfirmedByNRS", paymentStatus: "Paid",
    source: "API", partyName: "Nigerian Breweries Plc",
  },
  {
    id: "rec-003", invoiceCode: "SUPINV-2025-0016", irn: undefined,
    issueDate: "2025-03-10", dueDate: "2025-04-10",
    totalAmount: 670_000, totalTaxAmount: 50_250,
    status: "SubmittedToNRS", paymentStatus: "Unpaid",
    source: "SFTP", partyName: "Flour Mills of Nigeria",
  },
];

// ─── Parties ──────────────────────────────────────────────────────────────────
export const MOCK_PARTIES = [
  { id: "party-001", name: "Dangote Industries Ltd", tin: "12345678-0001", contactEmail: "invoices@dangote.com", contactPhone: "+234 803 000 0001", role: "Buyer", address: { street: "2 Cement Close", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101233" } },
  { id: "party-002", name: "MTN Nigeria Comm. Plc", tin: "12345678-0002", contactEmail: "ap@mtnnigeria.net", contactPhone: "+234 803 000 0002", role: "Buyer", address: { street: "MTN Plaza, Falomo", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101230" } },
  { id: "party-003", name: "Zenith Bank Plc", tin: "12345678-0003", contactEmail: "accounts@zenithbank.com", contactPhone: "+234 803 000 0003", role: "Buyer", address: { street: "84 Ajose Adeogun St", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101241" } },
  { id: "party-004", name: "NRSt Bank of Nigeria", tin: "12345678-0004", contactEmail: "payables@NRStbanknigeria.com", contactPhone: "+234 803 000 0004", role: "Buyer", address: { street: "Samuel Asabia House, 35 Marina", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "102273" } },
  { id: "party-005", name: "Airtel Nigeria Ltd", tin: "12345678-0005", contactEmail: "finance@airtel.com.ng", contactPhone: "+234 803 000 0005", role: "Buyer", address: { street: "Plot 1, Hakeem Balogun St", city: "Abuja", state: "FCT", country: "Nigeria", postalCode: "900108" } },
];

// ─── Business Items ───────────────────────────────────────────────────────────
export const MOCK_ITEMS = [
  { id: "item-001", itemCode: "CNSLT-001", description: "IT Consulting Services (per hour)", unitPrice: 75_000, taxCategories: ["VAT"] },
  { id: "item-002", itemCode: "SW-LIC-001", description: "Enterprise Software License (annual)", unitPrice: 2_400_000, taxCategories: ["VAT"] },
  { id: "item-003", itemCode: "MAINT-001", description: "System Maintenance & Support (monthly)", unitPrice: 450_000, taxCategories: ["VAT"] },
  { id: "item-004", itemCode: "TRAIN-001", description: "Staff Training Program (per session)", unitPrice: 320_000, taxCategories: ["VAT"] },
  { id: "item-005", itemCode: "CLOUD-001", description: "Cloud Hosting Services (per month)", unitPrice: 180_000, taxCategories: ["VAT"] },
  { id: "item-006", itemCode: "DATA-001", description: "Data Analytics & Reporting", unitPrice: 650_000, taxCategories: ["VAT"] },
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { id: "user-001", NRStName: "Chidi", lastName: "Okonkwo", email: "chidi.okonkwo@acmeng.com", status: "Active", roles: ["ClientAdmin"], lastLogin: "2025-03-29T08:30:00Z" },
  { id: "user-002", NRStName: "Ngozi", lastName: "Eze", email: "ngozi.eze@acmeng.com", status: "Active", roles: ["ClientUser"], lastLogin: "2025-03-28T14:15:00Z" },
  { id: "user-003", NRStName: "Babatunde", lastName: "Adewale", email: "bade.adewale@acmeng.com", status: "Active", roles: ["ClientUser"], lastLogin: "2025-03-27T10:00:00Z" },
  { id: "user-004", NRStName: "Amaka", lastName: "Obi", email: "amaka.obi@acmeng.com", status: "Inactive", roles: ["ClientUser"], lastLogin: "2025-02-10T09:00:00Z" },
];

// ─── Business Profile ─────────────────────────────────────────────────────────
export const MOCK_BUSINESS_PROFILE = {
  id: "mock-biz-001",
  name: "Acme Nigeria Ltd",
  description: "Leading provider of enterprise IT solutions and software services in Nigeria",
  businessRegistrationNumber: "RC-0123456",
  taxIdentificationNumber: "01234567-0001",
  contactEmail: "info@acmeng.com",
  contactPhone: "+234 803 000 0100",
  industry: "Information Technology",
  serviceId: "SVC-NRS-00123",
  NRSBusinessId: "NRS-BID-00456",
  isActive: true,
  onboardingCompleted: true,
  registeredAddress: {
    street: "14 Kofo Abayomi Street, Victoria Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    postalCode: "101241",
  },
};

// ─── Subscription Plans ───────────────────────────────────────────────────────
export const MOCK_PLANS = [
  {
    id: "plan-001",
    planName: "Portal Plan",
    tier: "SaaS",
    monthlyPrice: 100_000,
    annualPrice: 1_000_000,
    currency: "NGN",
    description: "Create and manage invoices directly on the Aegis portal",
  },
  {
    id: "plan-002",
    planName: "SFTP Plan",
    tier: "SFTP",
    monthlyPrice: 120_000,
    annualPrice: 1_200_000,
    currency: "NGN",
    description: "Upload invoices in bulk via secure SFTP integration",
  },
  {
    id: "plan-003",
    planName: "API Plan",
    tier: "ApiOnly",
    monthlyPrice: 150_000,
    annualPrice: 1_500_000,
    currency: "NGN",
    description: "Integrate directly with the NRS API from your own systems",
  },
];

// ─── Industries ───────────────────────────────────────────────────────────────
export const MOCK_INDUSTRIES = [
  { name: "Agriculture" }, { name: "Banking & Finance" }, { name: "Construction" },
  { name: "Education" }, { name: "Energy & Utilities" }, { name: "Healthcare" },
  { name: "Hospitality & Tourism" }, { name: "Information Technology" },
  { name: "Insurance" }, { name: "Manufacturing" }, { name: "Media & Entertainment" },
  { name: "Mining" }, { name: "Oil & Gas" }, { name: "Real Estate" },
  { name: "Retail & FMCG" }, { name: "Telecommunications" }, { name: "Transportation & Logistics" },
];
