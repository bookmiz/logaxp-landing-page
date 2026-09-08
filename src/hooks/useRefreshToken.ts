"use client";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "@/logaxp/lib/api/apiClient";
import { tokenStorage } from "@/logaxp/lib/auth/tokenStorage";

export function useRefreshToken() {
  const { setAccessToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/refresh");
      return response.data;
    },
    onSuccess: (data) => {
      tokenStorage.setTokens(data.accessToken, undefined);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken ?? null);
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
    },
  });
}
