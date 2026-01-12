import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = "https://api-logaxp.onrender.com/api";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "SUPERVISOR" | "STAFF";
  companyId: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetUsersParams {
  q?: string;
  role?: "SUPER_ADMIN" | "ADMIN" | "SUPERVISOR" | "STAFF";
  isActive?: boolean;
  companyId?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

interface GetUsersResponse {
  success: boolean;
  items: User[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  status: number;
}

export const useGetUsers = (params?: GetUsersParams) => {
  const { accessToken } = useAuthStore();

  return useQuery<GetUsersResponse, AxiosError<ApiErrorResponse>>({
    queryKey: ["users", params],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("No access token available. Please login again.");
      }

      const response = await axios.get<GetUsersResponse>(
        `${API_URL}/users`,
        {
          params: {
            ...params,
            page: params?.page || 1,
            limit: params?.limit || 20,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    enabled: !!accessToken,
  });
};