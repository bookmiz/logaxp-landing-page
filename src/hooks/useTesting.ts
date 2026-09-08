// src/hooks/useTesting.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/logaxp/components/ui/toast";
import { testingService } from "@/logaxp/lib/testing/testingService";
import type {
  ID,
  ListSuitesQuery,
  ListCasesQuery,
  ListPlansQuery,
  ListRunsQuery,
  CreateTestSuiteDto,
  UpdateTestSuiteDto,
  CreateTestCaseDto,
  UpdateTestCaseDto,
  AddCoverageDto,
  CreateTestPlanDto,
  UpdateTestPlanDto,
  AddPlanCasesDto,
  CreateTestRunDto,
  UpdateTestExecutionDto,
  AddExecutionEvidenceDto,
  CreateBugFromExecutionDto,
  ListRunExecutionsQuery,
  PublishTestRunDto,
} from "@/logaxp/lib/testing/testing.types";

/* =========================================================
 * Query keys
 * ========================================================= */

const testingKeys = {
  root: ["testing"] as const,

  dashboard: (projectId: ID) => [...testingKeys.root, "dashboard", projectId] as const,
  suites: (q: ListSuitesQuery) => [...testingKeys.root, "suites", q] as const,
  cases: (q: ListCasesQuery) => [...testingKeys.root, "cases", q] as const,
  plans: (q: ListPlansQuery) => [...testingKeys.root, "plans", q] as const,
  runs: (q: ListRunsQuery) => [...testingKeys.root, "runs", q] as const,

  // broad invalidations
  suitesAll: () => [...testingKeys.root, "suites"] as const,
  casesAll: () => [...testingKeys.root, "cases"] as const,
  plansAll: () => [...testingKeys.root, "plans"] as const,
  runsAll: () => [...testingKeys.root, "runs"] as const,
};

export function useTestingDashboard(projectId?: ID | null) {
  return useQuery({
    queryKey: testingKeys.dashboard(projectId ?? ""),
    queryFn: () => testingService.dashboard(projectId as ID),
    enabled: Boolean(projectId),
  });
}

/* =========================================================
 * Suites
 * ========================================================= */

export function useTestingSuites(q: ListSuitesQuery) {
  return useQuery({
    queryKey: testingKeys.suites(q),
    queryFn: () => testingService.listSuites(q),
    enabled: Boolean(q?.projectId),
  });
}

export function useCreateTestingSuite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTestSuiteDto) => testingService.createSuite(dto),
    onSuccess: () => {
      toast.success("Test suite created.");
      qc.invalidateQueries({ queryKey: testingKeys.suitesAll() });
    },
  });
}

export function useUpdateTestingSuite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: ID; dto: UpdateTestSuiteDto }) => testingService.updateSuite(vars.id, vars.dto),
    onSuccess: () => {
      toast.success("Test suite updated.");
      qc.invalidateQueries({ queryKey: testingKeys.suitesAll() });
    },
  });
}

export function useDeleteTestingSuite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.deleteSuite(id),
    onSuccess: () => {
      toast.success("Test suite deleted.");
      qc.invalidateQueries({ queryKey: testingKeys.suitesAll() });
    },
  });
}

export function useRestoreTestingSuite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.restoreSuite(id),
    onSuccess: () => {
      toast.success("Test suite restored.");
      qc.invalidateQueries({ queryKey: testingKeys.suitesAll() });
    },
  });
}

/* =========================================================
 * Cases
 * ========================================================= */

export function useTestingCases(q: ListCasesQuery) {
  return useQuery({
    queryKey: testingKeys.cases(q),
    queryFn: () => testingService.listCases(q),
    enabled: Boolean(q?.projectId),
  });
}

export function useCreateTestingCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTestCaseDto) => testingService.createCase(dto),
    onSuccess: () => {
      toast.success("Test case created.");
      qc.invalidateQueries({ queryKey: testingKeys.casesAll() });
      qc.invalidateQueries({ queryKey: testingKeys.suitesAll() });
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useUpdateTestingCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: ID; dto: UpdateTestCaseDto }) => testingService.updateCase(vars.id, vars.dto),
    onSuccess: () => {
      toast.success("Test case updated.");
      qc.invalidateQueries({ queryKey: testingKeys.casesAll() });
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useDeleteTestingCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.deleteCase(id),
    onSuccess: () => {
      toast.success("Test case deleted.");
      qc.invalidateQueries({ queryKey: testingKeys.casesAll() });
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useRestoreTestingCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.restoreCase(id),
    onSuccess: () => {
      toast.success("Test case restored.");
      qc.invalidateQueries({ queryKey: testingKeys.casesAll() });
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useAddTestCaseCoverage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { caseId: ID; dto: AddCoverageDto }) => testingService.addCoverage(vars.caseId, vars.dto),
    onSuccess: () => {
      toast.success("Coverage added.");
      qc.invalidateQueries({ queryKey: testingKeys.casesAll() });
    },
  });
}

export function useRemoveTestCaseCoverage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { caseId: ID; workItemId: ID }) => testingService.removeCoverage(vars.caseId, vars.workItemId),
    onSuccess: () => {
      toast.success("Coverage removed.");
      qc.invalidateQueries({ queryKey: testingKeys.casesAll() });
    },
  });
}

/* =========================================================
 * Plans
 * ========================================================= */

export function useTestingPlans(q: ListPlansQuery) {
  return useQuery({
    queryKey: testingKeys.plans(q),
    queryFn: () => testingService.listPlans(q),
    enabled: Boolean(q?.projectId),
  });
}

export function useCreateTestingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTestPlanDto) => testingService.createPlan(dto),
    onSuccess: () => {
      toast.success("Test plan created.");
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useUpdateTestingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: ID; dto: UpdateTestPlanDto }) => testingService.updatePlan(vars.id, vars.dto),
    onSuccess: () => {
      toast.success("Test plan updated.");
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useDeleteTestingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.deletePlan(id),
    onSuccess: () => {
      toast.success("Test plan deleted.");
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useRestoreTestingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.restorePlan(id),
    onSuccess: () => {
      toast.success("Test plan restored.");
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useAddPlanCases() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { planId: ID; dto: AddPlanCasesDto }) => testingService.addPlanCases(vars.planId, vars.dto),
    onSuccess: () => {
      toast.success("Cases added to plan.");
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

export function useRemovePlanCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { planId: ID; testCaseId: ID }) => testingService.removePlanCase(vars.planId, vars.testCaseId),
    onSuccess: () => {
      toast.success("Case removed from plan.");
      qc.invalidateQueries({ queryKey: testingKeys.plansAll() });
    },
  });
}

/* =========================================================
 * Runs
 * ========================================================= */

export function useTestingRuns(q: ListRunsQuery) {
  return useQuery({
    queryKey: testingKeys.runs(q),
    queryFn: () => testingService.listRuns(q),
    enabled: Boolean(q?.projectId),
  });
}

export function useCreateTestingRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTestRunDto) => testingService.createRun(dto),
    onSuccess: () => {
      toast.success("Test run created.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
    },
  });
}

export function useStartTestingRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.startRun(id),
    onSuccess: () => {
      toast.success("Run started.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
    },
  });
}

export function useCompleteTestingRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.completeRun(id),
    onSuccess: () => {
      toast.success("Run completed.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
    },
  });
}

export function useCancelTestingRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.cancelRun(id),
    onSuccess: () => {
      toast.success("Run canceled.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
    },
  });
}

export function useDeleteTestingRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.deleteRun(id),
    onSuccess: () => {
      toast.success("Test run deleted.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
    },
  });
}

export function useRestoreTestingRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => testingService.restoreRun(id),
    onSuccess: () => {
      toast.success("Test run restored.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
    },
  });
}

export function useTestingRunDetail(id?: ID) {
  return useQuery({
    queryKey: [...testingKeys.root, "runs", "detail", id] as const,
    queryFn: () => testingService.getRunDetail(id as ID),
    enabled: !!id,
  });
}

export function useTestingRunExecutions(runId?: ID, q?: ListRunExecutionsQuery) {
  return useQuery({
    queryKey: [...testingKeys.root, "runs", "executions", runId, q ?? {}] as const,
    queryFn: () => testingService.listRunExecutions(runId as ID, q),
    enabled: !!runId,
  });
}

export function usePublishTestingRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: ID; dto?: PublishTestRunDto }) =>
      testingService.publishRun(vars.id, vars.dto),
    onSuccess: () => {
      toast.success("Run published.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
      qc.invalidateQueries({ queryKey: testingKeys.root });
    },
  });
}

/* =========================================================
 * Executions
 * ========================================================= */

export function useUpdateTestExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: ID; dto: UpdateTestExecutionDto }) => testingService.updateExecution(vars.id, vars.dto),
    onSuccess: () => {
      toast.success("Execution updated.");
      // executions are typically surfaced inside runs/cases views
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
      qc.invalidateQueries({ queryKey: testingKeys.casesAll() });
      qc.invalidateQueries({ queryKey: testingKeys.root });
    },
  });
}

export function useAddExecutionEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: ID; dto: AddExecutionEvidenceDto }) =>
      testingService.addExecutionEvidence(vars.id, vars.dto),
    onSuccess: () => {
      toast.success("Evidence added.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
      qc.invalidateQueries({ queryKey: testingKeys.root });
    },
  });
}

export function useCreateBugFromExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: ID; dto: CreateBugFromExecutionDto }) =>
      testingService.createBugFromExecution(vars.id, vars.dto),
    onSuccess: (res) => {
      toast.success(res?.issueKey ? `Bug created (${res.issueKey}).` : "Bug created.");
      qc.invalidateQueries({ queryKey: testingKeys.runsAll() });
      qc.invalidateQueries({ queryKey: testingKeys.casesAll() });
      qc.invalidateQueries({ queryKey: testingKeys.root });
    },
  });
}
