/**
 * MOCK DATA — for UI review only.
 * Set USE_MOCK = false when the backend is ready.
 *
 * Switch active user role by changing MOCK_USER below:
 *   MOCK_USER_CLIENT_ADMIN  — business admin (default)
 *   MOCK_USER_CLIENT_USER   — read-only business user
 *   MOCK_USER_AEGIS_ADMIN   — platform super-admin
 */
export const USE_MOCK = true;

/** Page size used for client-side mock pagination */
export const MOCK_PAGE_SIZE = 5;

// ─── User Presets ─────────────────────────────────────────────────────────────
export const MOCK_USER_CLIENT_ADMIN = {
  userId: "mock-user-001",
  businessId: "mock-biz-001",
  firstName: "Chidi",
  lastName: "Okonkwo",
  email: "chidi.okonkwo@acmeng.com",
  roles: ["ClientAdmin"],
  permissions: ["invoice:create", "invoice:approve", "party:manage", "user:manage"],
  isAegisUser: false,
  aegisRole: undefined as string | undefined,
  subscriptionTier: "SaaS",
  mustChangePassword: false,
};

export const MOCK_USER_CLIENT_USER = {
  userId: "mock-user-002",
  businessId: "mock-biz-001",
  firstName: "Ngozi",
  lastName: "Eze",
  email: "ngozi.eze@acmeng.com",
  roles: ["ClientUser"],
  permissions: ["invoice:view", "party:view"],
  isAegisUser: false,
  aegisRole: undefined as string | undefined,
  subscriptionTier: "SaaS",
  mustChangePassword: false,
};

export const MOCK_USER_AEGIS_ADMIN = {
  userId: "aegis-admin-001",
  businessId: undefined as string | undefined,
  firstName: "Emeka",
  lastName: "Adeyemi",
  email: "emeka.adeyemi@aegisnrs.com",
  roles: ["AegisAdmin"],
  permissions: [],
  isAegisUser: true,
  aegisRole: "SuperAdmin",
  subscriptionTier: undefined as string | undefined,
  mustChangePassword: false,
};

// ── Change this line to switch role ──────────────────────────────────────────
export const MOCK_USER = MOCK_USER_CLIENT_ADMIN;
// export const MOCK_USER = MOCK_USER_CLIENT_USER;
// export const MOCK_USER = MOCK_USER_AEGIS_ADMIN;

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

// ─── Invoices (15 rows → 3 pages of 5) ───────────────────────────────────────
export const MOCK_INVOICES = [
  { id: "inv-001", invoiceCode: "INV-2025-0042", irn: "FIR20250042ACME0000001", issueDate: "2025-03-20", dueDate: "2025-04-20", totalAmount: 4_720_000, totalTaxAmount: 354_000, status: "ConfirmedByNRS", paymentStatus: "Paid", source: "Portal", partyName: "Dangote Industries Ltd" },
  { id: "inv-002", invoiceCode: "INV-2025-0041", irn: "FIR20250041ACME0000002", issueDate: "2025-03-18", dueDate: "2025-04-18", totalAmount: 1_850_000, totalTaxAmount: 138_750, status: "SubmittedToNRS", paymentStatus: "Unpaid", source: "Portal", partyName: "MTN Nigeria Comm. Plc" },
  { id: "inv-003", invoiceCode: "INV-2025-0040", irn: undefined, issueDate: "2025-03-15", dueDate: "2025-04-15", totalAmount: 920_000, totalTaxAmount: 69_000, status: "PendingApproval", paymentStatus: "Unpaid", source: "Portal", partyName: "Zenith Bank Plc" },
  { id: "inv-004", invoiceCode: "INV-2025-0039", irn: undefined, issueDate: "2025-03-10", dueDate: "2025-04-10", totalAmount: 560_000, totalTaxAmount: 42_000, status: "Draft", paymentStatus: "Unpaid", source: "Portal", partyName: "First Bank of Nigeria" },
  { id: "inv-005", invoiceCode: "INV-2025-0038", irn: "FIR20250038ACME0000005", issueDate: "2025-03-05", dueDate: "2025-04-05", totalAmount: 2_300_000, totalTaxAmount: 172_500, status: "ConfirmedByNRS", paymentStatus: "PartiallyPaid", source: "Portal", partyName: "Airtel Nigeria Ltd" },
  { id: "inv-006", invoiceCode: "INV-2025-0037", irn: "FIR20250037ACME0000006", issueDate: "2025-02-28", dueDate: "2025-03-28", totalAmount: 780_000, totalTaxAmount: 58_500, status: "Rejected", paymentStatus: "Unpaid", source: "Portal", partyName: "Nestle Nigeria Plc" },
  { id: "inv-007", invoiceCode: "INV-2025-0036", irn: "FIR20250036ACME0000007", issueDate: "2025-02-20", dueDate: "2025-03-20", totalAmount: 3_120_000, totalTaxAmount: 234_000, status: "ConfirmedByNRS", paymentStatus: "Paid", source: "Portal", partyName: "Dangote Industries Ltd" },
  { id: "inv-008", invoiceCode: "INV-2025-0035", irn: undefined, issueDate: "2025-02-15", dueDate: undefined, totalAmount: 490_000, totalTaxAmount: 36_750, status: "Approved", paymentStatus: "Unpaid", source: "Portal", partyName: "Unilever Nigeria Plc" },
  { id: "inv-009", invoiceCode: "INV-2025-0034", irn: "FIR20250034ACME0000009", issueDate: "2025-02-10", dueDate: "2025-03-10", totalAmount: 6_400_000, totalTaxAmount: 480_000, status: "ConfirmedByNRS", paymentStatus: "Paid", source: "Portal", partyName: "Stanbic IBTC Bank Plc" },
  { id: "inv-010", invoiceCode: "INV-2025-0033", irn: undefined, issueDate: "2025-02-05", dueDate: "2025-03-05", totalAmount: 1_100_000, totalTaxAmount: 82_500, status: "Draft", paymentStatus: "Unpaid", source: "Portal", partyName: "Access Bank Plc" },
  { id: "inv-011", invoiceCode: "INV-2025-0032", irn: "FIR20250032ACME0000011", issueDate: "2025-01-28", dueDate: "2025-02-28", totalAmount: 3_750_000, totalTaxAmount: 281_250, status: "ConfirmedByNRS", paymentStatus: "Paid", source: "Portal", partyName: "Guaranty Trust Bank Plc" },
  { id: "inv-012", invoiceCode: "INV-2025-0031", irn: "FIR20250031ACME0000012", issueDate: "2025-01-20", dueDate: "2025-02-20", totalAmount: 870_000, totalTaxAmount: 65_250, status: "SubmittedToNRS", paymentStatus: "Unpaid", source: "Portal", partyName: "Nigerian Breweries Plc" },
  { id: "inv-013", invoiceCode: "INV-2025-0030", irn: undefined, issueDate: "2025-01-15", dueDate: "2025-02-15", totalAmount: 2_050_000, totalTaxAmount: 153_750, status: "PendingApproval", paymentStatus: "Unpaid", source: "Portal", partyName: "Lafarge Africa Plc" },
  { id: "inv-014", invoiceCode: "INV-2025-0029", irn: "FIR20250029ACME0000014", issueDate: "2025-01-10", dueDate: "2025-02-10", totalAmount: 5_200_000, totalTaxAmount: 390_000, status: "ConfirmedByNRS", paymentStatus: "PartiallyPaid", source: "Portal", partyName: "Flour Mills of Nigeria" },
  { id: "inv-015", invoiceCode: "INV-2025-0028", irn: undefined, issueDate: "2025-01-05", dueDate: "2025-02-05", totalAmount: 330_000, totalTaxAmount: 24_750, status: "Draft", paymentStatus: "Unpaid", source: "Portal", partyName: "Zenith Bank Plc" },
];

// ─── Received Invoices (8 rows → 2 pages of 5) ────────────────────────────────
export const MOCK_RECEIVED_INVOICES = [
  { id: "rec-001", invoiceCode: "SUPINV-2025-0018", irn: "FIR20250018SUPP0000001", issueDate: "2025-03-22", dueDate: "2025-04-22", totalAmount: 3_500_000, totalTaxAmount: 262_500, status: "ConfirmedByNRS", paymentStatus: "Unpaid", source: "SFTP", partyName: "Lafarge Africa Plc" },
  { id: "rec-002", invoiceCode: "SUPINV-2025-0017", irn: "FIR20250017SUPP0000002", issueDate: "2025-03-18", dueDate: "2025-04-18", totalAmount: 1_200_000, totalTaxAmount: 90_000, status: "ConfirmedByNRS", paymentStatus: "Paid", source: "API", partyName: "Nigerian Breweries Plc" },
  { id: "rec-003", invoiceCode: "SUPINV-2025-0016", irn: undefined, issueDate: "2025-03-10", dueDate: "2025-04-10", totalAmount: 670_000, totalTaxAmount: 50_250, status: "SubmittedToNRS", paymentStatus: "Unpaid", source: "SFTP", partyName: "Flour Mills of Nigeria" },
  { id: "rec-004", invoiceCode: "SUPINV-2025-0015", irn: "FIR20250015SUPP0000004", issueDate: "2025-03-05", dueDate: "2025-04-05", totalAmount: 4_800_000, totalTaxAmount: 360_000, status: "ConfirmedByNRS", paymentStatus: "Paid", source: "API", partyName: "Dangote Cement Plc" },
  { id: "rec-005", invoiceCode: "SUPINV-2025-0014", irn: undefined, issueDate: "2025-02-25", dueDate: "2025-03-25", totalAmount: 990_000, totalTaxAmount: 74_250, status: "Rejected", paymentStatus: "Unpaid", source: "SFTP", partyName: "Conoil Plc" },
  { id: "rec-006", invoiceCode: "SUPINV-2025-0013", irn: "FIR20250013SUPP0000006", issueDate: "2025-02-18", dueDate: "2025-03-18", totalAmount: 2_150_000, totalTaxAmount: 161_250, status: "ConfirmedByNRS", paymentStatus: "PartiallyPaid", source: "API", partyName: "Okomu Oil Palm Plc" },
  { id: "rec-007", invoiceCode: "SUPINV-2025-0012", irn: undefined, issueDate: "2025-02-10", dueDate: "2025-03-10", totalAmount: 580_000, totalTaxAmount: 43_500, status: "SubmittedToNRS", paymentStatus: "Unpaid", source: "SFTP", partyName: "Honeywell Flour Mills Plc" },
  { id: "rec-008", invoiceCode: "SUPINV-2025-0011", irn: "FIR20250011SUPP0000008", issueDate: "2025-02-01", dueDate: "2025-03-01", totalAmount: 7_200_000, totalTaxAmount: 540_000, status: "ConfirmedByNRS", paymentStatus: "Paid", source: "API", partyName: "Seplat Energy Plc" },
];

// ─── Parties (12 rows → 3 pages of 5) ────────────────────────────────────────
export const MOCK_PARTIES = [
  { id: "party-001", name: "Dangote Industries Ltd", taxIdentificationNumber: "12345678-0001", email: "invoices@dangote.com", phone: "+234 803 000 0001", address: { street: "2 Cement Close", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101233" } },
  { id: "party-002", name: "MTN Nigeria Comm. Plc", taxIdentificationNumber: "12345678-0002", email: "ap@mtnnigeria.net", phone: "+234 803 000 0002", address: { street: "MTN Plaza, Falomo", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101230" } },
  { id: "party-003", name: "Zenith Bank Plc", taxIdentificationNumber: "12345678-0003", email: "accounts@zenithbank.com", phone: "+234 803 000 0003", address: { street: "84 Ajose Adeogun St", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101241" } },
  { id: "party-004", name: "First Bank of Nigeria", taxIdentificationNumber: "12345678-0004", email: "payables@firstbanknigeria.com", phone: "+234 803 000 0004", address: { street: "Samuel Asabia House, 35 Marina", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "102273" } },
  { id: "party-005", name: "Airtel Nigeria Ltd", taxIdentificationNumber: "12345678-0005", email: "finance@airtel.com.ng", phone: "+234 803 000 0005", address: { street: "Plot 1, Hakeem Balogun St", city: "Abuja", state: "FCT", country: "Nigeria", postalCode: "900108" } },
  { id: "party-006", name: "Nestle Nigeria Plc", taxIdentificationNumber: "12345678-0006", email: "accounts@nestle.com.ng", phone: "+234 803 000 0006", address: { street: "22-24 Industrial Avenue", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101233" } },
  { id: "party-007", name: "Unilever Nigeria Plc", taxIdentificationNumber: "12345678-0007", email: "finance@unilever.com.ng", phone: "+234 803 000 0007", address: { street: "1 Billings Way, Oregun", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "100001" } },
  { id: "party-008", name: "Guaranty Trust Bank Plc", taxIdentificationNumber: "12345678-0008", email: "ap@gtbank.com", phone: "+234 803 000 0008", address: { street: "635 Akin Adesola St, V/I", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101241" } },
  { id: "party-009", name: "Nigerian Breweries Plc", taxIdentificationNumber: "12345678-0009", email: "accounts@nigerianbreweries.com", phone: "+234 803 000 0009", address: { street: "1 Abebe Village Rd", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "102243" } },
  { id: "party-010", name: "Lafarge Africa Plc", taxIdentificationNumber: "12345678-0010", email: "finance@lafarge.com.ng", phone: "+234 803 000 0010", address: { street: "27B Gerrard Rd, Ikoyi", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101233" } },
  { id: "party-011", name: "Access Bank Plc", taxIdentificationNumber: "12345678-0011", email: "ap@accessbankplc.com", phone: "+234 803 000 0011", address: { street: "999c Danmole St, V/I", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101241" } },
  { id: "party-012", name: "Stanbic IBTC Bank Plc", taxIdentificationNumber: "12345678-0012", email: "accounts@stanbicibtc.com", phone: "+234 803 000 0012", address: { street: "Walter Carrington Crescent, V/I", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101241" } },
];

// ─── Business Items (10 rows → 2 pages of 5) ─────────────────────────────────
export const MOCK_ITEMS = [
  { id: "item-001", itemCode: "CNSLT-001", description: "IT Consulting Services (per hour)", unitPrice: 75_000, taxCategories: ["STANDARD_VAT"] },
  { id: "item-002", itemCode: "SW-LIC-001", description: "Enterprise Software License (annual)", unitPrice: 2_400_000, taxCategories: ["STANDARD_VAT"] },
  { id: "item-003", itemCode: "MAINT-001", description: "System Maintenance & Support (monthly)", unitPrice: 450_000, taxCategories: ["STANDARD_VAT"] },
  { id: "item-004", itemCode: "TRAIN-001", description: "Staff Training Program (per session)", unitPrice: 320_000, taxCategories: ["ZERO_VAT"] },
  { id: "item-005", itemCode: "CLOUD-001", description: "Cloud Hosting Services (per month)", unitPrice: 180_000, taxCategories: ["STANDARD_VAT"] },
  { id: "item-006", itemCode: "DATA-001", description: "Data Analytics & Reporting", unitPrice: 650_000, taxCategories: ["STANDARD_VAT"] },
  { id: "item-007", itemCode: "DEV-001", description: "Custom Software Development (per sprint)", unitPrice: 1_200_000, taxCategories: ["STANDARD_VAT"] },
  { id: "item-008", itemCode: "AUDIT-001", description: "IT Security Audit & Assessment", unitPrice: 800_000, taxCategories: ["EXEMPTED"] },
  { id: "item-009", itemCode: "INTG-001", description: "API Integration Services", unitPrice: 550_000, taxCategories: ["STANDARD_VAT"] },
  { id: "item-010", itemCode: "PMO-001", description: "Project Management Office (per month)", unitPrice: 380_000, taxCategories: ["STANDARD_VAT"] },
];

// ─── FIRS Tax Categories ───────────────────────────────────────────────────────
export const MOCK_TAX_CATEGORIES = [
  { code: "STANDARD_VAT", value: "Standard Value-Added Tax", percent: "7.5" },
  { code: "REDUCED_VAT", value: "Reduced Value-Added Tax", percent: "7.5" },
  { code: "ZERO_VAT", value: "Zero Value-Added Tax", percent: "0.0" },
  { code: "STANDARD_GST", value: "Standard Goods and Services Tax", percent: "Not Available" },
  { code: "REDUCED_GST", value: "Reduced Goods and Services Tax", percent: "Not Available" },
  { code: "ZERO_GST", value: "Zero Goods and Services Tax", percent: "Not Available" },
  { code: "STATE_SALES_TAX", value: "State Sales Tax", percent: "Not Available" },
  { code: "LOCAL_SALES_TAX", value: "Local Sales Tax", percent: "Not Available" },
  { code: "ALCOHOL_EXCISE_TAX", value: "Alcohol Excise Tax", percent: "Not Available" },
  { code: "TOBACCO_EXCISE_TAX", value: "Tobacco Excise Tax", percent: "Not Available" },
  { code: "FUEL_EXCISE_TAX", value: "Fuel Excise Tax", percent: "Not Available" },
  { code: "CORPORATE_INCOME_TAX", value: "Corporate Income Tax", percent: "Not Available" },
  { code: "PERSONAL_INCOME_TAX", value: "Personal Income Tax", percent: "Not Available" },
  { code: "SOCIAL_SECURITY_TAX", value: "Social Security Tax", percent: "Not Available" },
  { code: "MEDICARE_TAX", value: "Medicare Tax", percent: "Not Available" },
  { code: "REAL_ESTATE_TAX", value: "Real Estate Tax", percent: "Not Available" },
  { code: "PERSONAL_PROPERTY_TAX", value: "Personal Property Tax", percent: "Not Available" },
  { code: "CARBON_TAX", value: "Carbon Tax", percent: "Not Available" },
  { code: "PLASTIC_TAX", value: "Plastic Tax", percent: "Not Available" },
  { code: "IMPORT_DUTY", value: "Import Duty", percent: "Not Available" },
  { code: "EXPORT_DUTY", value: "Export Duty", percent: "Not Available" },
  { code: "LUXURY_TAX", value: "Luxury Tax", percent: "Not Available" },
  { code: "SERVICE_TAX", value: "Service Tax", percent: "Not Available" },
  { code: "TOURISM_TAX", value: "Tourism Tax", percent: "Not Available" },
  { code: "WITHHOLDING_TAX", value: "Withholding Tax", percent: "Not Available" },
  { code: "STAMP_DUTY", value: "Stamp Duty", percent: "Not Available" },
  { code: "EXEMPTED", value: "Tax Exemption", percent: "0.0" },
];

// ─── Users (8 rows → 2 pages of 5) ───────────────────────────────────────────
export const MOCK_USERS = [
  { id: "user-001", NRStName: "Chidi", lastName: "Okonkwo", email: "chidi.okonkwo@acmeng.com", status: "Active", roles: ["ClientAdmin"], lastLogin: "2025-03-29T08:30:00Z" },
  { id: "user-002", NRStName: "Ngozi", lastName: "Eze", email: "ngozi.eze@acmeng.com", status: "Active", roles: ["ClientUser"], lastLogin: "2025-03-28T14:15:00Z" },
  { id: "user-003", NRStName: "Babatunde", lastName: "Adewale", email: "bade.adewale@acmeng.com", status: "Active", roles: ["ClientUser"], lastLogin: "2025-03-27T10:00:00Z" },
  { id: "user-004", NRStName: "Amaka", lastName: "Obi", email: "amaka.obi@acmeng.com", status: "Inactive", roles: ["ClientUser"], lastLogin: "2025-02-10T09:00:00Z" },
  { id: "user-005", NRStName: "Tunde", lastName: "Bakare", email: "tunde.bakare@acmeng.com", status: "Active", roles: ["ClientUser"], lastLogin: "2025-03-26T16:45:00Z" },
  { id: "user-006", NRStName: "Chisom", lastName: "Nwosu", email: "chisom.nwosu@acmeng.com", status: "Active", roles: ["ClientUser"], lastLogin: "2025-03-25T11:20:00Z" },
  { id: "user-007", NRStName: "Yetunde", lastName: "Afolabi", email: "yetunde.afolabi@acmeng.com", status: "Suspended", roles: ["ClientUser"], lastLogin: "2025-01-15T08:00:00Z" },
  { id: "user-008", NRStName: "Emeka", lastName: "Onyekwere", email: "emeka.onyekwere@acmeng.com", status: "Active", roles: ["ClientAdmin"], lastLogin: "2025-03-28T09:10:00Z" },
];

// ─── Businesses (for Aegis admin, 12 rows → 3 pages of 5) ────────────────────
export const MOCK_BUSINESSES = [
  { id: "biz-001", name: "Acme Nigeria Ltd", tin: "01234567-0001", status: "Active", subscriptionTier: "SaaS", industry: "Information Technology", contactEmail: "info@acmeng.com", registeredAt: "2024-09-15" },
  { id: "biz-002", name: "TechBridge Solutions Ltd", tin: "01234567-0002", status: "Active", subscriptionTier: "SFTP", industry: "Information Technology", contactEmail: "admin@techbridge.ng", registeredAt: "2024-10-02" },
  { id: "biz-003", name: "Meridian Logistics Ltd", tin: "01234567-0003", status: "Active", subscriptionTier: "ApiOnly", industry: "Transportation & Logistics", contactEmail: "finance@meridian.ng", registeredAt: "2024-10-20" },
  { id: "biz-004", name: "SunPower Energy Ltd", tin: "01234567-0004", status: "Active", subscriptionTier: "SaaS", industry: "Energy & Utilities", contactEmail: "ops@sunpower.ng", registeredAt: "2024-11-05" },
  { id: "biz-005", name: "Brightfield Agro Ltd", tin: "01234567-0005", status: "Suspended", subscriptionTier: "SaaS", industry: "Agriculture", contactEmail: "info@brightfield.ng", registeredAt: "2024-11-18" },
  { id: "biz-006", name: "Chukwuma & Associates", tin: "01234567-0006", status: "Active", subscriptionTier: "SaaS", industry: "Banking & Finance", contactEmail: "accounts@chukwuma.ng", registeredAt: "2024-12-01" },
  { id: "biz-007", name: "Pelican Healthcare Ltd", tin: "01234567-0007", status: "Active", subscriptionTier: "SFTP", industry: "Healthcare", contactEmail: "admin@pelican.ng", registeredAt: "2024-12-10" },
  { id: "biz-008", name: "NovaBuild Construction Ltd", tin: "01234567-0008", status: "Active", subscriptionTier: "ApiOnly", industry: "Construction", contactEmail: "finance@novabuild.ng", registeredAt: "2025-01-08" },
  { id: "biz-009", name: "Apex Media & Comms Ltd", tin: "01234567-0009", status: "Active", subscriptionTier: "SaaS", industry: "Media & Entertainment", contactEmail: "billing@apexmedia.ng", registeredAt: "2025-01-22" },
  { id: "biz-010", name: "Greenline Retail Ltd", tin: "01234567-0010", status: "Pending", subscriptionTier: "SaaS", industry: "Retail & FMCG", contactEmail: "info@greenline.ng", registeredAt: "2025-02-14" },
  { id: "biz-011", name: "Skyview Real Estate Ltd", tin: "01234567-0011", status: "Active", subscriptionTier: "SFTP", industry: "Real Estate", contactEmail: "accounts@skyview.ng", registeredAt: "2025-02-28" },
  { id: "biz-012", name: "Goldmine Mining Resources", tin: "01234567-0012", status: "Active", subscriptionTier: "ApiOnly", industry: "Mining", contactEmail: "finance@goldmine.ng", registeredAt: "2025-03-10" },
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
  firsBusinessId: "NRS-BID-00456",
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
  { id: "plan-001", planName: "Portal Plan", tier: "SaaS", monthlyPrice: 100_000, annualPrice: 1_000_000, currency: "NGN", description: "Create and manage invoices directly on the Aegis portal" },
  { id: "plan-002", planName: "SFTP Plan", tier: "SFTP", monthlyPrice: 120_000, annualPrice: 1_200_000, currency: "NGN", description: "Upload invoices in bulk via secure SFTP integration" },
  { id: "plan-003", planName: "API Plan", tier: "ApiOnly", monthlyPrice: 150_000, annualPrice: 1_500_000, currency: "NGN", description: "Integrate directly with the NRS API from your own systems" },
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
