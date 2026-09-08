import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "@/logaxp/lib/api/apiClient";

export const useRequestEmailVerification = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userEmail = useAuthStore((s) => s.user?.email);

  return useMutation({
    mutationFn: async () => {
      if (!userEmail) {
        throw new Error("No email address available for verification request.");
      }

      return api.post(
        "/auth/email/resend",
        { email: userEmail },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    },
  });
};
