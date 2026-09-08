import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "@/logaxp/lib/api/apiClient";
import { tokenStorage } from "@/logaxp/lib/auth/tokenStorage";

export const useLogin = () => {
  const { setUser, setAccessToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },

    onSuccess: (data) => {
      if (!data?.accessToken) return;

      tokenStorage.setTokens(data.accessToken, undefined);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken ?? null);
      setUser(data.user);
    },
  });
};
