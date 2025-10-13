import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = "https://api-logaxp.onrender.com/api";  

export const useLogin = () => {
  const { setUser, setAccessToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    },
    onSuccess: (data) => {
      
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user || { email: data.email });
    },
  });
};
