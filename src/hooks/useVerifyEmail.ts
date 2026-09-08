import { useMutation } from "@tanstack/react-query";
import { api } from "@/logaxp/lib/api/apiClient";

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      return api.post("/auth/email/verify", { token });
    },
  });
};
