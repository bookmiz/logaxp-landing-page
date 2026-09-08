// src/logaxp/lib/uploads/uploads.service.ts

import { api } from "@/logaxp/lib/api/apiClient";
import type { GetFileResponse, RegisterFileRequest, RegisterFileResponse } from "./uploads.types";

export const uploadsService = {
  async register(dto: RegisterFileRequest): Promise<RegisterFileResponse> {
    const res = await api.post<RegisterFileResponse>("/files", dto);
    return res.data;
  },

  async getById(id: string): Promise<GetFileResponse> {
    const res = await api.get<GetFileResponse>(`/files/${id}`);
    return res.data;
  },
};