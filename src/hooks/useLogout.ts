"use client";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "@/logaxp/lib/api/apiClient";
import { tokenStorage } from "@/logaxp/lib/auth/tokenStorage";

export function useLogout() {
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      tokenStorage.clear();
      clearAuth();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
}
