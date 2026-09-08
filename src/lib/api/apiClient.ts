// src/lib/api/apiClient.ts
"use client";

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/logaxp/lib/auth/tokenStorage";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api/v1"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

function applyAccessToken(config: InternalAxiosRequestConfig, accessToken: string | null) {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
}

api.interceptors.request.use((config) => {
  const store = useAuthStore.getState();
  const accessToken = store.accessToken || tokenStorage.getAccessToken();
  const tenantId = store.tenant?.id;

  applyAccessToken(config, accessToken);

  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const url = originalRequest?.url ?? "";

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout")
    ) {
      throw error;
    }

    originalRequest._retry = true;

    refreshPromise ??= axios
      .post<{ accessToken?: string }>(`${API_BASE_URL}/auth/refresh`, undefined, {
        withCredentials: true,
      })
      .then((res) => {
        const accessToken = res.data.accessToken ?? null;

        if (accessToken) {
          tokenStorage.setTokens(accessToken, undefined);
          useAuthStore.getState().setTokens(accessToken, undefined);
        }

        return accessToken;
      })
      .catch((refreshError) => {
        tokenStorage.clear();
        useAuthStore.getState().clearSession();
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const accessToken = await refreshPromise;
    applyAccessToken(originalRequest, accessToken);

    return api(originalRequest);
  }
);

export default api;
