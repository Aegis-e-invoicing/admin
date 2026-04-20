import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authApi, type TokenClaims, type LoginPayload } from "../lib/api";
import { setAccessToken } from "../lib/apiClient";
import {
  USE_MOCK,
  MOCK_USER,
  MOCK_USER_AEGIS_ADMIN,
  MOCK_USER_CLIENT_ADMIN,
  MOCK_USER_CLIENT_USER,
  MOCK_USER_SFTP_ADMIN,
  MOCK_USER_API_ONLY,
} from "../lib/mockData";

const resolveMockUser = (email?: string) => {
  if (email === MOCK_USER_AEGIS_ADMIN.email) return MOCK_USER_AEGIS_ADMIN;
  if (email === MOCK_USER_CLIENT_ADMIN.email) return MOCK_USER_CLIENT_ADMIN;
  if (email === MOCK_USER_CLIENT_USER.email) return MOCK_USER_CLIENT_USER;
  if (email === MOCK_USER_SFTP_ADMIN.email) return MOCK_USER_SFTP_ADMIN;
  if (email === MOCK_USER_API_ONLY.email) return MOCK_USER_API_ONLY;
  return MOCK_USER; // fall back to env-configured default
};

export interface AuthUser {
  userId: string;
  businessId?: string;
  NRStName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  isAegisUser: boolean;
  aegisRole?: string;
  subscriptionTier?: string; // "SaaS" | "SFTP" | "ApiOnly"
  mustChangePassword: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const claimsToUser = (
  claims: TokenClaims,
  userId: string,
  mustChangePassword: boolean,
): AuthUser => ({
  userId,
  businessId: claims.businessId,
  NRStName: claims.NRStName,
  lastName: claims.lastName,
  email: claims.email,
  roles: claims.roles ?? [],
  permissions: claims.permissions ?? [],
  isAegisUser: claims.isAegisUser,
  aegisRole: claims.aegisRole,
  subscriptionTier: claims.subscriptionTier,
  mustChangePassword,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to restore session via cookie-based token-claims
  useEffect(() => {
    if (USE_MOCK) {
      const savedEmail = sessionStorage.getItem("mock_user_email");
      setUser(savedEmail ? resolveMockUser(savedEmail) : MOCK_USER);
      setIsLoading(false);
      return;
    }
    const restoreSession = async () => {
      try {
        // Try refresh NRSt to get a new access token using the cookie
        const refreshed = await authApi.refresh();
        if (refreshed.accessToken) {
          setAccessToken(refreshed.accessToken);
          const claims = await authApi.tokenClaims();
          setUser(claimsToUser(claims, "", claims.mustChangePassword ?? false));
        }
      } catch {
        // No valid session
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (_payload: LoginPayload) => {
    if (USE_MOCK) {
      const resolved = resolveMockUser(_payload.email);
      sessionStorage.setItem("mock_user_email", resolved.email ?? "");
      setUser(resolved);
      return { mustChangePassword: false };
    }
    const result = await authApi.login(_payload);
    setAccessToken(result.accessToken);
    const u = claimsToUser(
      result.claims,
      result.userId,
      result.mustChangePassword,
    );
    setUser(u);
    return { mustChangePassword: result.mustChangePassword };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    sessionStorage.removeItem("mock_user_email");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const claims = await authApi.tokenClaims();
      setUser((prev) =>
        prev ? claimsToUser(claims, prev.userId, claims.mustChangePassword ?? false) : null,
      );
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Convenience role helpers
export const useIsAegis = () => {
  const { user } = useAuth();
  return user?.isAegisUser === true || user?.roles.includes("Aegis") === true;
};

export const useIsAdmin = () => {
  const { user } = useAuth();
  return (
    user?.isAegisUser === true ||
    user?.roles.includes("ClientAdmin") === true ||
    user?.roles.includes("Admin") === true // legacy
  );
};

export const useIsUser = () => {
  const { user } = useAuth();
  return (
    user?.roles.includes("ClientUser") === true ||
    user?.roles.includes("User") === true
  );
};

export const useCanCreateInvoice = () => {
  const { user } = useAuth();
  if (!user) return false;
  if (user.subscriptionTier === "SFTP" || user.subscriptionTier === "ApiOnly")
    return false;
  // If the user has explicit permissions, check invoices.create
  if (user.permissions.length > 0)
    return user.isAegisUser || user.permissions.includes("invoices.create");
  // Fallback: allow if no permission system is in use yet
  return true;
};

export const useCanManageAppSettings = () => {
  const { user } = useAuth();
  if (!user) return false;
  if (user.isAegisUser) return true;
  if (user.permissions.length > 0)
    return user.permissions.includes("business.manage_settings");
  // Fallback: ClientAdmin role without explicit permissions list
  return user.roles.includes("ClientAdmin");
};

export const useSubscriptionTier = () => {
  const { user } = useAuth();
  return user?.subscriptionTier ?? null;
};
