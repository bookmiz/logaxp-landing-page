// src/lib/testing/testingService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  ApiEnvelope,
  Paginated,
  TestSuite,
  TestCase,
  TestPlan,
  TestRun,
  TestExecution,
  TestingDashboard,
  ListSuitesQuery,
  ListCasesQuery,
  ListPlansQuery,
  ListRunsQuery,
  CreateTestSuiteDto,
  UpdateTestSuiteDto,
  CreateTestCaseDto,
  UpdateTestCaseDto,
  ListRunExecutionsQuery,
  AddCoverageDto,
  PublishTestRunDto,
  CreateTestPlanDto,
  UpdateTestPlanDto,
  AddPlanCasesDto,
  CreateTestRunDto,
  UpdateTestExecutionDto,
  AddExecutionEvidenceDto,
  CreateBugFromExecutionDto,
  CreateBugFromExecutionResult,
  ID,
} from "./testing.types";

/* =========================================================
 * Helpers
 * ========================================================= */

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload)) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

function buildQuery(params: Record<string, unknown>): string {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "boolean") qp.set(k, v ? "true" : "false");
    else qp.set(k, String(v));
  });
  const s = qp.toString();
  return s ? `?${s}` : "";
}

/* =========================================================
 * Service
 * ========================================================= */

export const testingService = {
  async dashboard(projectId: ID): Promise<TestingDashboard> {
    const res = await api.get(`/testing/dashboard${buildQuery({ projectId })}`);
    return unwrap(res.data);
  },

  // ---------------------------
  // Suites
  // ---------------------------
  async listSuites(q: ListSuitesQuery): Promise<Paginated<TestSuite> | TestSuite[]> {
    const res = await api.get(`/testing/suites${buildQuery(q)}`);
    return unwrap(res.data);
  },

  async createSuite(dto: CreateTestSuiteDto): Promise<TestSuite> {
    const res = await api.post(`/testing/suites`, dto);
    return unwrap(res.data);
  },

  async updateSuite(id: ID, dto: UpdateTestSuiteDto): Promise<TestSuite> {
    const res = await api.patch(`/testing/suites/${id}`, dto);
    return unwrap(res.data);
  },

  async deleteSuite(id: ID): Promise<{ ok: true }> {
    const res = await api.delete(`/testing/suites/${id}`);
    return unwrap(res.data);
  },

  async restoreSuite(id: ID): Promise<TestSuite> {
    const res = await api.post(`/testing/suites/${id}/restore`);
    return unwrap(res.data);
  },

  // ---------------------------
  // Cases
  // ---------------------------
  async listCases(q: ListCasesQuery): Promise<Paginated<TestCase> | TestCase[]> {
    const res = await api.get(`/testing/cases${buildQuery(q)}`);
    return unwrap(res.data);
  },

  async createCase(dto: CreateTestCaseDto): Promise<TestCase> {
    const res = await api.post(`/testing/cases`, dto);
    return unwrap(res.data);
  },

  async updateCase(id: ID, dto: UpdateTestCaseDto): Promise<TestCase> {
    const res = await api.patch(`/testing/cases/${id}`, dto);
    return unwrap(res.data);
  },

  async deleteCase(id: ID): Promise<{ ok: true }> {
    const res = await api.delete(`/testing/cases/${id}`);
    return unwrap(res.data);
  },

  async restoreCase(id: ID): Promise<TestCase> {
    const res = await api.post(`/testing/cases/${id}/restore`);
    return unwrap(res.data);
  },

  async addCoverage(caseId: ID, dto: AddCoverageDto): Promise<TestCase> {
    const res = await api.post(`/testing/cases/${caseId}/coverage`, dto);
    return unwrap(res.data);
  },

  async removeCoverage(caseId: ID, workItemId: ID): Promise<TestCase> {
    const res = await api.delete(`/testing/cases/${caseId}/coverage/${workItemId}`);
    return unwrap(res.data);
  },

  // ---------------------------
  // Plans
  // ---------------------------
  async listPlans(q: ListPlansQuery): Promise<Paginated<TestPlan> | TestPlan[]> {
    const res = await api.get(`/testing/plans${buildQuery(q)}`);
    return unwrap(res.data);
  },

  async createPlan(dto: CreateTestPlanDto): Promise<TestPlan> {
    const res = await api.post(`/testing/plans`, dto);
    return unwrap(res.data);
  },

  async updatePlan(id: ID, dto: UpdateTestPlanDto): Promise<TestPlan> {
    const res = await api.patch(`/testing/plans/${id}`, dto);
    return unwrap(res.data);
  },

  async deletePlan(id: ID): Promise<{ ok: true }> {
    const res = await api.delete(`/testing/plans/${id}`);
    return unwrap(res.data);
  },

  async restorePlan(id: ID): Promise<TestPlan> {
    const res = await api.post(`/testing/plans/${id}/restore`);
    return unwrap(res.data);
  },

  async addPlanCases(planId: ID, dto: AddPlanCasesDto): Promise<TestPlan> {
    const res = await api.post(`/testing/plans/${planId}/cases`, dto);
    return unwrap(res.data);
  },

  async removePlanCase(planId: ID, testCaseId: ID): Promise<TestPlan> {
    const res = await api.delete(`/testing/plans/${planId}/cases/${testCaseId}`);
    return unwrap(res.data);
  },
// ---------------------------
// Runs
// ---------------------------
async listRuns(q: ListRunsQuery) {
  const res = await api.get(`/testing/runs${buildQuery(q)}`);
  return unwrap(res.data);
},

async getRunDetail(id: ID) {
  const res = await api.get(`/testing/runs/${id}/detail`);
  return unwrap(res.data);
},

async listRunExecutions(runId: ID, q?: ListRunExecutionsQuery) {
  const res = await api.get(`/testing/runs/${runId}/executions${buildQuery(q ?? {})}`);
  return unwrap(res.data);
},

async createRun(dto: CreateTestRunDto) {
  const res = await api.post(`/testing/runs`, dto);
  return unwrap(res.data);
},

async startRun(id: ID) {
  const res = await api.post(`/testing/runs/${id}/start`);
  return unwrap(res.data);
},

async completeRun(id: ID) {
  const res = await api.post(`/testing/runs/${id}/complete`);
  return unwrap(res.data);
},

async cancelRun(id: ID) {
  const res = await api.post(`/testing/runs/${id}/cancel`);
  return unwrap(res.data);
},

async deleteRun(id: ID) {
  const res = await api.delete(`/testing/runs/${id}`);
  return unwrap(res.data);
},

async restoreRun(id: ID) {
  const res = await api.post(`/testing/runs/${id}/restore`);
  return unwrap(res.data);
},

async publishRun(id: ID, dto?: PublishTestRunDto) {
  const res = await api.post(`/testing/runs/${id}/publish`, dto ?? {});
  return unwrap(res.data);
},
  // ---------------------------
  // Executions
  // ---------------------------
  async updateExecution(id: ID, dto: UpdateTestExecutionDto): Promise<TestExecution> {
    const res = await api.patch(`/testing/executions/${id}`, dto);
    return unwrap(res.data);
  },

  async addExecutionEvidence(id: ID, dto: AddExecutionEvidenceDto): Promise<TestExecution> {
    const res = await api.post(`/testing/executions/${id}/evidence`, dto);
    return unwrap(res.data);
  },

  async createBugFromExecution(
    id: ID,
    dto: CreateBugFromExecutionDto
  ): Promise<CreateBugFromExecutionResult> {
    const res = await api.post(`/testing/executions/${id}/create-bug`, dto);
    return unwrap(res.data);
  },
};
