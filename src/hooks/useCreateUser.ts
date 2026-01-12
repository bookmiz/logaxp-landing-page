import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = "https://api-logaxp.onrender.com/api";

interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN";
  companyId: string;
}

interface CreateUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
  };
  message: string;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  status: number;
  path: string;
  method: string;
  traceId: string;
  timestamp: string;
}

export const useCreateUser = () => {
  const { accessToken } = useAuthStore();

  return useMutation<CreateUserResponse, AxiosError<ApiErrorResponse>, CreateUserData>({
    mutationFn: async (userData: CreateUserData) => {
      if (!accessToken) {
        throw new Error("No access token available. Please login again.");
      }

      const response = await axios.post<CreateUserResponse>(
        `${API_URL}/auth/admin/create-user`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("User created successfully:", data);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error("Error creating user:", {
          message: errorData.message,
          status: errorData.status,
          path: errorData.path,
          traceId: errorData.traceId,
        });
        
        // Handle specific error cases
        if (errorData.status === 401) {
          console.error("Authentication error: Token is invalid or expired. Please login again.");
        }
      } else {
        console.error("Error creating user:", error.message);
      }
    },
  });
};

