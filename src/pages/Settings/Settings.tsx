import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import { businessApi, miscApi, type BusinessProfile } from "../../lib/api";
import { USE_MOCK, MOCK_BUSINESS_PROFILE, MOCK_INDUSTRIES } from "../../lib/mockData";
import { useIsAegisAdmin, useIsClientAdmin, useAuth } from "../../context/AuthContext";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const isAegis = useIsAegisAdmin();
  const isClientAdmin = useIsClientAdmin();
  const canEdit = isClientAdmin || isAegis;

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [industries, setIndustries] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);

  // NRS credentials state
  const [NRS, setNRS] = useState({ apiKey: "", clientSecret: "" });
  const [savingNRS, setSavingNRS] = useState(false);

  // QR config state
  const [qr, setQr] = useState({ publicKey: "", certificate: "" });
  const [savingQr, setSavingQr] = useState(false);

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    description: "",
    contactEmail: "",
    contactPhone: "",
    industry: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  useEffect(() => {
    if (USE_MOCK) {
      const prof = MOCK_BUSINESS_PROFILE as BusinessProfile;
      setProfile(prof);
      setProfileForm({
        description: prof.description ?? "",
        contactEmail: prof.contactEmail ?? "",
        contactPhone: prof.contactPhone ?? "",
        industry: prof.industry ?? "",
        street: prof.registeredAddress?.street ?? "",
        city: prof.registeredAddress?.city ?? "",
        state: prof.registeredAddress?.state ?? "",
        country: prof.registeredAddress?.country ?? "",
        postalCode: prof.registeredAddress?.postalCode ?? "",
      });
      setIndustries(MOCK_INDUSTRIES.map(i => i.name));
      setLoadingProfile(false);
      return;
    }
    Promise.all([
      businessApi.getProfile(),
      miscApi.getIndustries().catch(() => [] as { name: string }[]),
    ])
      .then(([prof, industryList]) => {
        setProfile(prof);
        setProfileForm({
          description: prof.description ?? "",
          contactEmail: prof.contactEmail ?? "",
          contactPhone: prof.contactPhone ?? "",
          industry: prof.industry ?? "",
          street: prof.registeredAddress?.street ?? "",
          city: prof.registeredAddress?.city ?? "",
          state: prof.registeredAddress?.state ?? "",
          country: prof.registeredAddress?.country ?? "",
          postalCode: prof.registeredAddress?.postalCode ?? "",
        });
        setIndustries(industryList.map((i) => i.name));
      })
      .catch(() => toast.error("Failed to load business profile."))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await businessApi.updateProfile({
        description: profileForm.description,
        contactEmail: profileForm.contactEmail,
        contactPhone: profileForm.contactPhone,
        industry: profileForm.industry,
        registeredAddress: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          country: profileForm.country,
          postalCode: profileForm.postalCode,
        },
      });
      toast.success("Business profile updated.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNRS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!NRS.apiKey || !NRS.clientSecret) {
      toast.error("Both API key and client secret are required.");
      return;
    }
    setSavingNRS(true);
    try {
      await businessApi.updateNRSCredentials(NRS);
      toast.success("NRS credentials updated.");
      setNRS({ apiKey: "", clientSecret: "" });
    } catch {
      toast.error("Failed to update NRS credentials.");
    } finally {
      setSavingNRS(false);
    }
  };

  const handleSaveQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qr.publicKey || !qr.certificate) {
      toast.error("Both public key and certificate are required.");
      return;
    }
    setSavingQr(true);
    try {
      await businessApi.updateQrCodeConfig(qr);
      toast.success("QR code configuration updated.");
      setQr({ publicKey: "", certificate: "" });
    } catch {
      toast.error("Failed to update QR config.");
    } finally {
      setSavingQr(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Settings | Aegis NRS Portal" description="Business settings and configuration" />

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your business configuration and integrations
        </p>
      </div>

      <div className="space-y-6">
        {/* Business Info (read-only) */}
        {profile && (
          <Section title="Business Information" description="Core registration details (read-only)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Business Name</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">TIN</p>
                <p className="text-gray-800 dark:text-white font-mono">{profile.taxIdentificationNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Reg. Number</p>
                <p className="text-gray-800 dark:text-white font-mono">{profile.businessRegistrationNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">NRS Business ID</p>
                <p className="text-gray-800 dark:text-white font-mono">{profile.NRSBusinessId || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Service ID</p>
                <p className="text-gray-800 dark:text-white font-mono">{profile.serviceId || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Subscription Plan</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  {user?.subscriptionTier ?? "—"}
                </span>
              </div>
            </div>
          </Section>
        )}

        {/* Editable Business Profile */}
        {canEdit && (
          <Section title="Contact & Address" description="Update your business contact details and address">
            <form onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Contact Email</label>
                  <input
                    value={profileForm.contactEmail}
                    onChange={(e) => setProfileForm((f) => ({ ...f, contactEmail: e.target.value }))}
                    className={inputCls}
                    type="email"
                    placeholder="contact@business.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Contact Phone</label>
                  <input
                    value={profileForm.contactPhone}
                    onChange={(e) => setProfileForm((f) => ({ ...f, contactPhone: e.target.value }))}
                    className={inputCls}
                    placeholder="+234..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Industry</label>
                  <select
                    value={profileForm.industry}
                    onChange={(e) => setProfileForm((f) => ({ ...f, industry: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Select industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <textarea
                    value={profileForm.description}
                    onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))}
                    className={`${inputCls} resize-none`}
                    rows={2}
                    placeholder="Brief description of your business"
                  />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Street Address</label>
                  <input
                    value={profileForm.street}
                    onChange={(e) => setProfileForm((f) => ({ ...f, street: e.target.value }))}
                    className={inputCls}
                    placeholder="123 Business Street"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">City</label>
                  <input
                    value={profileForm.city}
                    onChange={(e) => setProfileForm((f) => ({ ...f, city: e.target.value }))}
                    className={inputCls}
                    placeholder="City"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">State</label>
                  <input
                    value={profileForm.state}
                    onChange={(e) => setProfileForm((f) => ({ ...f, state: e.target.value }))}
                    className={inputCls}
                    placeholder="State"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Country</label>
                  <input
                    value={profileForm.country}
                    onChange={(e) => setProfileForm((f) => ({ ...f, country: e.target.value }))}
                    className={inputCls}
                    placeholder="Nigeria"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Postal Code</label>
                  <input
                    value={profileForm.postalCode}
                    onChange={(e) => setProfileForm((f) => ({ ...f, postalCode: e.target.value }))}
                    className={inputCls}
                    placeholder="100001"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
                >
                  {savingProfile ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </Section>
        )}

        {/* NRS Credentials */}
        {canEdit && (
          <Section
            title="NRS NRS Credentials"
            description="Update your NRS API key and client secret. Values are stored securely and never displayed."
          >
            <form onSubmit={handleSaveNRS}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    API Key
                  </label>
                  <input
                    value={NRS.apiKey}
                    onChange={(e) => setNRS((f) => ({ ...f, apiKey: e.target.value }))}
                    className={inputCls}
                    placeholder="Enter new API key"
                    autoComplete="off"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Client Secret
                  </label>
                  <input
                    value={NRS.clientSecret}
                    onChange={(e) => setNRS((f) => ({ ...f, clientSecret: e.target.value }))}
                    className={inputCls}
                    placeholder="Enter new client secret"
                    type="password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={savingNRS}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
                >
                  {savingNRS ? "Updating…" : "Update Credentials"}
                </button>
              </div>
            </form>
          </Section>
        )}

        {/* QR Code Configuration */}
        {canEdit && (
          <Section
            title="QR Code Configuration"
            description="Update your public key and certificate for QR code generation on invoices."
          >
            <form onSubmit={handleSaveQr}>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Public Key
                  </label>
                  <textarea
                    value={qr.publicKey}
                    onChange={(e) => setQr((f) => ({ ...f, publicKey: e.target.value }))}
                    className={`${inputCls} resize-none font-mono text-xs`}
                    rows={4}
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Certificate
                  </label>
                  <textarea
                    value={qr.certificate}
                    onChange={(e) => setQr((f) => ({ ...f, certificate: e.target.value }))}
                    className={`${inputCls} resize-none font-mono text-xs`}
                    rows={4}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={savingQr}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
                >
                  {savingQr ? "Updating…" : "Update QR Config"}
                </button>
              </div>
            </form>
          </Section>
        )}

        {!canEdit && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
            You need Admin access to modify settings. Contact your business admin.
          </div>
        )}
      </div>
    </>
  );
}
