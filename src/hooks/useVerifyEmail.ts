import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "https://api-logaxp.onrender.com/api";

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      return axios.post(`${API_URL}/auth/verify-email`, { token });
    },
  });
};
