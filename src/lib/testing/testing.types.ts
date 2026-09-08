// src/lib/testing/testing.types.ts

export type ID = string;

export type ApiEnvelope<T> = {
  statusCode?: number;
  message?: string;
  data: T;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
  nextCursor?: string | null;
};

export type SoftDeletable = {
  deletedAt?: string | null;
};

export type Timestamped = {
  createdAt: string;
  updatedAt: string;
};

export type TestCasePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TestCaseStatus = "DRAFT" | "ACTIVE" | "DEPRECATED";
export type TestRunStatus = "PLANNED" | "RUNNING" | "COMPLETED" | "CANCELED";
export type TestRunOutcomeStatus = "NOT_STARTED" | "PASSED" | "FAILED" | "BLOCKED";
export type TestExecutionStatus = "PASS" | "FAIL" | "BLOCKED" | "SKIPPED";
export type LegacyTestExecutionStatus = "PASSED" | "FAILED";
export type TestExecutionStatusInput = TestExecutionStatus | LegacyTestExecutionStatus;

export type TestSuite = Timestamped &
  SoftDeletable & {
    id: ID;
    tenantId: ID;
    projectId: ID;
    parentId?: ID | null;
    name: string;
    description?: string | null;
    sortOrder?: number | null;
    createdByUserId?: ID | null;
    _count?: { cases?: number; children?: number };
  };

export type TestCase = Timestamped &
  SoftDeletable & {
    id: ID;
    tenantId: ID;
    projectId: ID;
    suiteId?: ID | null;
    key?: string | null;
    title: string;
    description?: string | null;
    priority: TestCasePriority;
    status: TestCaseStatus;
    source?: "MANUAL" | "AUTOMATED";
    tags?: string[];
    steps?: Array<{ title?: string; action: string; expected: string }>;
    references?: Array<{ label?: string; url: string }>;
    metadata?: Record<string, unknown> | null;
    coverageWorkItemIds?: ID[];
    coverageLinks?: Array<{ id: ID; workItemId: ID; workItem?: { id: ID; issueKey?: string | null; title?: string | null } }>;
    createdByUserId?: ID | null;
  };

export type TestPlan = Timestamped &
  SoftDeletable & {
    id: ID;
    tenantId: ID;
    projectId: ID;
    sprintId?: ID | null;
    sprint?: { id: ID; name: string; status?: string } | null;
    name: string;
    description?: string | null;
    testCaseIds?: ID[];
    cases?: Array<{ id?: ID; testCaseId: ID; testCase?: TestCase }>;
    runs?: TestRun[];
    _count?: { cases?: number; runs?: number };
  };

export type TestRunSummary = {
  total: number;
  pass: number;
  fail: number;
  blocked: number;
  skipped: number;
  outcomeStatus?: TestRunOutcomeStatus;
};

export type TestRun = Timestamped &
  SoftDeletable & {
    id: ID;
    tenantId: ID;
    projectId: ID;
    planId?: ID | null;
    plan?: { id: ID; name: string } | null;
    name: string;
    status: TestRunStatus;
    outcomeStatus?: TestRunOutcomeStatus;
    startedAt?: string | null;
    completedAt?: string | null;
    environment?: string | null;
    buildRef?: string | null;
    publishBoardId?: ID | null;
    createdByUserId?: ID | null;
    summary?: TestRunSummary;
    _count?: { executions?: number };
  };

export type TestExecution = Timestamped &
  SoftDeletable & {
    id: ID;
    tenantId: ID;
    projectId: ID;
    runId: ID;
    testCaseId: ID;
    testCase?: TestCase;
    status: TestExecutionStatus;
    executedByMembershipId?: ID | null;
    assignedToMembershipId?: ID | null;
    notes?: string | null;
    durationMs?: number | null;
    durationSeconds?: number | null;
    evidence?: Array<{ id: ID; fileId?: ID | null; url?: string | null; title?: string | null; createdAt: string }>;
    evidenceFiles?: Array<{ id: ID; fileId: ID; file?: { id: ID; url?: string | null; metadata?: any }; createdAt: string }>;
    defectWorkItemId?: ID | null;
    createdBugWorkItemId?: ID | null;
  };

export type TestingDashboard = {
  project: { id: ID; key: string; name: string };
  counts: { suites: number; cases: number; plans: number; runs: number };
  coverage: { totalCases: number; coveredCases: number; uncoveredCases: number; coveragePercent: number };
  executions: { pass: number; fail: number; blocked: number; skipped: number; failedWithoutBug: number; linkedBugs: number };
  latestRuns: TestRun[];
};

export type ListSuitesQuery = { projectId: ID; includeDeleted?: boolean; q?: string; page?: number; pageSize?: number };
export type ListCasesQuery = { projectId: ID; suiteId?: ID; tag?: string; q?: string; includeDeleted?: boolean; page?: number; pageSize?: number };
export type ListRunExecutionsQuery = { q?: string; status?: TestExecutionStatusInput; executedByMembershipId?: ID; onlyFailures?: boolean; cursor?: ID; pageSize?: number };
export type ListPlansQuery = { projectId: ID; includeDeleted?: boolean; q?: string; sprintId?: ID; page?: number; pageSize?: number };
export type ListRunsQuery = { projectId: ID; includeDeleted?: boolean; status?: TestRunStatus; planId?: ID; q?: string; page?: number; pageSize?: number };

export type CreateTestSuiteDto = { projectId: ID; name: string; description?: string | null; parentId?: ID | null; sortOrder?: number | null };
export type UpdateTestSuiteDto = Partial<{ name: string; description: string | null; parentId: ID | null; sortOrder: number | null }>;

export type CreateTestCaseDto = {
  projectId: ID;
  suiteId?: ID | null;
  key?: string | null;
  title: string;
  description?: string | null;
  priority?: TestCasePriority;
  status?: TestCaseStatus;
  tags?: string[];
  steps?: Array<{ title?: string; action: string; expected: string }>;
  references?: Array<{ label?: string; url: string }>;
};

export type UpdateTestCaseDto = Partial<{
  suiteId: ID | null;
  title: string;
  description: string | null;
  priority: TestCasePriority;
  status: TestCaseStatus;
  tags: string[];
  steps: Array<{ title?: string; action: string; expected: string }>;
  references: Array<{ label?: string; url: string }>;
}>;

export type AddCoverageDto = { workItemId: ID };

export type CreateTestPlanDto = { projectId: ID; name: string; description?: string | null; sprintId?: ID | null; testCaseIds?: ID[] };
export type UpdateTestPlanDto = Partial<{ name: string; description: string | null; sprintId: ID | null }>;
export type AddPlanCasesDto = { testCaseIds: ID[] };

export type CreateTestRunDto = {
  projectId: ID;
  name: string;
  planId?: ID | null;
  environment?: string | null;
  buildRef?: string | null;
  publishBoardId?: ID | null;
  testCaseIds?: ID[];
};

export type PublishTestRunDto = Partial<{ boardId: ID; columnId: ID; labelName: string }>;

export type UpdateTestExecutionDto = Partial<{
  status: TestExecutionStatusInput;
  notes: string | null;
  assignedToMembershipId: ID | null;
  durationSeconds: number | null;
}>;

export type AddExecutionEvidenceDto = { title?: string | null; fileId?: ID; url?: string };

export type CreateBugFromExecutionDto = {
  title?: string;
  description?: string;
  assigneeMembershipId?: ID | null;
  labels?: string[];
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  boardId?: ID | null;
  columnId?: ID | null;
};

export type CreateBugFromExecutionResult = { ok?: true; workItemId?: ID; defectWorkItemId?: ID; issueKey?: string | null };
