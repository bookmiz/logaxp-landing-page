"use client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-api-url.com";

export function useRefreshToken() {
  const { refreshToken, setAccessToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // ✅ Update tokens in Zustand
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
    },
  });
}
