"use client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-api-url.com";

export function useLogout() {
  const { refreshToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await axios.post(`${API_URL}/auth/revoke`, { refreshToken });
    },
    onSuccess: () => {
      // Clear everything when logged out
      clearAuth();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
}
