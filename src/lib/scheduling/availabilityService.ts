"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  AvailabilityListFilterDto,
  BulkUpsertAvailabilityDto,
  BulkUpsertAvailabilityResponse,
  CreateAvailabilityResponse,
  CreateAvailabilityRuleDto,
  DeleteAvailabilityResponse,
  GetAvailabilityResponse,
  ListAvailabilityResponse,
  UpdateAvailabilityResponse,
  UpdateAvailabilityRuleDto,
} from "./availability.types";

function enc(v: string) {
  return encodeURIComponent(v);
}
function cleanParams(obj?: Record<string, unknown> | object) {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export const availabilityService = {
  async list(filter?: AvailabilityListFilterDto): Promise<ListAvailabilityResponse> {
    const res = await api.get<ListAvailabilityResponse>("/availability", { params: cleanParams(filter as any) });
    return res.data;
  },

  async get(id: string): Promise<GetAvailabilityResponse> {
    const res = await api.get<GetAvailabilityResponse>(`/availability/${enc(id)}`);
    return res.data;
  },

  async create(dto: CreateAvailabilityRuleDto): Promise<CreateAvailabilityResponse> {
    const res = await api.post<CreateAvailabilityResponse>("/availability", dto);
    return res.data;
  },

  async update(id: string, dto: UpdateAvailabilityRuleDto): Promise<UpdateAvailabilityResponse> {
    const res = await api.patch<UpdateAvailabilityResponse>(`/availability/${enc(id)}`, dto);
    return res.data;
  },

  async remove(id: string): Promise<DeleteAvailabilityResponse> {
    const res = await api.delete<DeleteAvailabilityResponse>(`/availability/${enc(id)}`);
    return res.data;
  },

  async bulkUpsert(dto: BulkUpsertAvailabilityDto): Promise<BulkUpsertAvailabilityResponse> {
    const res = await api.post<BulkUpsertAvailabilityResponse>("/availability/bulk-upsert", dto);
    return res.data;
  },
};