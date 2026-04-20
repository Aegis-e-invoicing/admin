import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Endpoints that require AES-256-CBC encrypted payloads (must match backend ProtectedPaths)
const ENCRYPTED_PATHS = [
  "/auth/login",
  "/auth/forgot-password",
  "/profile/change-password",
];

// AES-256-CBC encryption using Web Crypto API (no external deps)
async function encryptPayload(plaintext: string): Promise<{ data: string; iv: string }> {
  const keyB64 = import.meta.env.VITE_PAYLOAD_ENCRYPTION_KEY as string;
  if (!keyB64) throw new Error("VITE_PAYLOAD_ENCRYPTION_KEY is not configured");

  const rawKey = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "AES-CBC" }, false, ["encrypt"]);

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, cryptoKey, encoded);

  const toB64 = (buf: ArrayBuffer | Uint8Array) =>
    btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf.buffer)));

  return { data: toB64(cipherBuffer), iv: toB64(iv) };
}

function requiresEncryption(url: string): boolean {
  const path = url.replace(/^.*\/api\/v\d+/, ""); // strip base + version prefix
  return ENCRYPTED_PATHS.some((p) => path.toLowerCase().startsWith(p));
}

// In-memory token storage (never in localStorage for security)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send refresh token cookie
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach access token + encrypt protected payloads
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Encrypt body for protected endpoints
  const url = config.url ?? "";
  if (
    config.method?.toLowerCase() === "post" &&
    requiresEncryption(url) &&
    config.data
  ) {
    const plaintext = typeof config.data === "string" ? config.data : JSON.stringify(config.data);
    const encrypted = await encryptPayload(plaintext);
    config.data = JSON.stringify(encrypted);
    config.headers["X-Encrypted"] = "true";
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Response interceptor — handle 401 with token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Typed API response helper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const unwrap = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  return response.data.data;
};
