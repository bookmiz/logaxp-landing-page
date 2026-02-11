import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = "https://api-logaxp.onrender.com/api";

export const useRequestEmailVerification = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation({
    mutationFn: async () => {
      return axios.post(
        `${API_URL}/auth/verify-email/request`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    },
  });
};
