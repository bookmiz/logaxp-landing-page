// src/lib/project-management/projectManagement.types.ts

/** ----------------------------------------
 * Generic API envelope
 * Adjust if backend shape differs
 * --------------------------------------- */
export type ApiResponse<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

export type Maybe<T> = T | null;

export type ListMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export type ListData<T> =
  | T[]
  | {
      items: T[];
      meta?: ListMeta;
      [key: string]: unknown;
    };

export interface PaginationDto {
  page?: number;
  pageSize?: number;
}

/** ----------------------------------------
 * Enum mirrors (string-based FE-safe)
 * --------------------------------------- */
export type ProjectStatus = string;
export type ProjectVisibility = string;
export type ProjectMemberRole = string;
export type BoardType = string;
export type WorkflowStatusCategory = "TODO" | "IN_PROGRESS" | "DONE";
export type WorkItemType = string;
export type WorkItemPriority = string;
export type SprintStatus = string;
export type WorkItemRelationType = string;

/** ----------------------------------------
 * Entities (flexible)
 * --------------------------------------- */
export interface Project {
  id: string;
  key?: string;
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  workflowId?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
  archivedAt?: string | null;
  deletedAt?: string | null;
  metadata?: unknown;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export type ProjectHealth = "ON_TRACK" | "AT_RISK" | "BLOCKED" | "COMPLETED";

export interface ProjectSummary {
  counts?: {
    boards?: number;
    workItems?: number;
    openWorkItems?: number;
    completedWorkItems?: number;
    members?: number;
    sprints?: number;
    milestones?: number;
    timelineEvents?: number;
    budgets?: number;
    expenses?: number;
    testSuites?: number;
    testCases?: number;
    testPlans?: number;
    testRuns?: number;
    [key: string]: number | undefined;
  };
  activeSprint?: Sprint | null;
  health?: ProjectHealth | string;
  testingHealth?: string;
  dateProgress?: {
    startDate?: string | null;
    targetDate?: string | null;
    totalDays?: number | null;
    elapsedDays?: number | null;
    daysRemaining?: number | null;
    progressPercent?: number | null;
    isOverdue?: boolean;
  };
  [key: string]: unknown;
}

export interface ProjectActivity {
  id: string;
  action?: string;
  entityType?: string;
  entityId?: string | null;
  actorUserId?: string | null;
  actorMembershipId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  createdAt?: string;
  [key: string]: unknown;
}

export interface ProjectMember {
  id: string;
  projectId?: string;
  membershipId?: string;
  role?: ProjectMemberRole;
  membership?: {
    id?: string;
    title?: string | null;
    status?: string;
    user?: {
      id?: string;
      email?: string;
      status?: string;
      profile?: {
        displayName?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      } | null;
    } | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Workflow {
  id: string;
  name?: string;
  isDefault?: boolean;
  metadata?: unknown;
  createdAt?: string;
  updatedAt?: string;
  statuses?: WorkflowStatus[];
  [key: string]: unknown;
}

export interface WorkflowStatus {
  id: string;
  workflowId?: string;
  key?: string;
  name?: string;
  category?: WorkflowStatusCategory;
  order?: number;
  isDefault?: boolean;
  isTerminal?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface WorkItem {
  id: string;
  key?: string;
  issueKey?: string | null;
  projectId?: string;
  type?: WorkItemType;
  priority?: WorkItemPriority;
  title?: string;
  description?: string | null;

  boardId?: string | null;
  columnId?: string | null;
  sprintId?: string | null;

  workflowId?: string | null;
  statusId?: string | null;

  reporterMembershipId?: string | null;
  assigneeMembershipId?: string | null;
  assigneeEmployeeId?: string | null;

  rank?: string | null;
  storyPoints?: number | null;
  originalEstimateMinutes?: number | null;
  remainingEstimateMinutes?: number | null;

  dueAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;

  metadata?: unknown;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Label {
  id: string;
  name?: string;
  color?: string | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface WorkItemLabel {
  id?: string;
  workItemId?: string;
  labelId?: string;
  label?: Label;
  createdAt?: string;
  [key: string]: unknown;
}

export interface WorkItemComment {
  id: string;
  workItemId?: string;
  authorUserId?: string | null;
  authorMembershipId?: string | null;
  body?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface WorkItemRelation {
  id: string;
  fromId?: string;
  toId?: string;
  type?: WorkItemRelationType;
  from?: Partial<WorkItem>;
  to?: Partial<WorkItem>;
  createdAt?: string;
  [key: string]: unknown;
}

export interface WorkItemAttachment {
  id: string;
  workItemId?: string;
  fileId?: string;
  file?: unknown;
  uploadedByUserId?: string | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Sprint {
  id: string;
  projectId?: string;
  boardId?: string | null;
  name?: string;
  goal?: string | null;
  status?: SprintStatus;
  startAt?: string | null;
  endAt?: string | null;
  closedAt?: string | null;
  capacityPoints?: number | string | null;
  closeSummary?: SprintCloseSummary | null;
  metrics?: SprintMetrics;
  velocityHistory?: SprintVelocityItem[];
  project?: Partial<Project> | null;
  board?: Partial<Board> | null;
  workItems?: WorkItem[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SprintMetrics {
  capacityPoints?: number | null;
  committedPoints?: number;
  completedPoints?: number;
  incompletePoints?: number;
  workItemCount?: number;
  completedCount?: number;
  incompleteCount?: number;
  capacityRemainingPoints?: number | null;
  capacityUsedPercent?: number | null;
}

export interface SprintCloseSummary {
  closedAt?: string;
  summaryNote?: string | null;
  completedCount?: number;
  incompleteCount?: number;
  totalCount?: number;
  completedPoints?: number;
  incompletePoints?: number;
  committedPoints?: number;
  movedBackToBacklogCount?: number;
  movedToSprintId?: string | null;
  movedToSprintName?: string | null;
  [key: string]: unknown;
}

export interface SprintVelocityItem {
  id: string;
  name?: string;
  status?: SprintStatus;
  startAt?: string | null;
  endAt?: string | null;
  closedAt?: string | null;
  committedPoints?: number;
  completedPoints?: number;
  committedCount?: number;
  completedCount?: number;
}

export interface SprintVelocity {
  projectId: string;
  history: SprintVelocityItem[];
  averageCompletedPoints: number;
  closedSprintCount: number;
}

export interface SprintBoardView {
  sprint: Sprint;
  board?: Board | null;
  columns: Array<{ column: BoardColumn; items: WorkItem[] }>;
  unassigned: WorkItem[];
}

export interface Board {
  id: string;
  projectId?: string;
  type?: BoardType;
  name?: string;
  description?: string | null;
  isDefault?: boolean;
  metadata?: unknown;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  columns?: BoardColumn[];
  [key: string]: unknown;
}

export interface BoardColumn {
  id: string;
  boardId?: string;
  key?: string;
  name?: string;
  order?: number;
  wipLimit?: number | null;
  isBacklog?: boolean;
  isDone?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** ----------------------------------------
 * Projects DTOs
 * --------------------------------------- */
export interface CreateProjectDto {
  key: string;
  name: string;
  description?: string;
  visibility?: ProjectVisibility;
  workflowId?: string | null;
  startDate?: string;
  targetDate?: string;
  metadata?: unknown;
  defaultBoardName?: string;
  defaultWorkflowName?: string;
}

export interface UpdateProjectDto {
  key?: string;
  name?: string;
  description?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  workflowId?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
  metadata?: unknown;
}

export interface ProjectListFilterDto {
  status?: ProjectStatus;
  q?: string;
}

export type ProjectListQuery = ProjectListFilterDto & PaginationDto;

/** ----------------------------------------
 * Project Members DTOs
 * --------------------------------------- */
export interface AddProjectMemberDto {
  membershipId: string;
  role?: ProjectMemberRole;
}

export interface InviteProjectMemberDto {
  email: string;
  title?: string;
  role?: ProjectMemberRole;
}

export interface ChangeProjectMemberRoleDto {
  role: ProjectMemberRole;
}

/** ----------------------------------------
 * Workflows DTOs
 * --------------------------------------- */
export interface CreateWorkflowDto {
  name: string;
  isDefault?: boolean;
  metadata?: unknown;
}

export interface CloneWorkflowDto {
  name?: string;
}

export interface CreateWorkflowStatusDto {
  workflowId?: string; // backend will overwrite from path in your controller
  key: string;
  name: string;
  category: WorkflowStatusCategory;
  order: number;
  isDefault?: boolean;
  isTerminal?: boolean;
}

export interface ReorderWorkflowStatusesItemDto {
  id: string;
  order: number;
}

export interface RenameWorkflowDto {
  name: string;
}

/** ----------------------------------------
 * Work Items DTOs
 * --------------------------------------- */
export interface CreateWorkItemDto {
  projectId: string;
  type: WorkItemType;
  priority?: WorkItemPriority;
  title: string;
  description?: string;

  boardId?: string;
  columnId?: string;
  sprintId?: string;

  workflowId?: string;
  statusId?: string;

  reporterMembershipId?: string;
  assigneeMembershipId?: string;
  assigneeEmployeeId?: string;

  rank?: string;
  storyPoints?: number;
  originalEstimateMinutes?: number;
  remainingEstimateMinutes?: number;

  dueAt?: string;
  metadata?: unknown;
}

export interface UpdateWorkItemDto {
  priority?: WorkItemPriority;
  type?: WorkItemType;
  title?: string;
  description?: string;

  boardId?: string | null;
  columnId?: string | null;
  sprintId?: string | null;
  workflowId?: string | null;
  statusId?: string | null;

  reporterMembershipId?: string;
  assigneeMembershipId?: string;
  assigneeEmployeeId?: string;

  rank?: string;
  storyPoints?: number;
  originalEstimateMinutes?: number;
  remainingEstimateMinutes?: number;

  dueAt?: string;
  startedAt?: string;
  completedAt?: string;

  metadata?: unknown;
}

export interface WorkItemListFilterDto {
  projectId?: string;
  boardId?: string;
  sprintId?: string;
  columnId?: string;
  statusId?: string;
  assigneeMembershipId?: string;
  type?: WorkItemType;
  priority?: WorkItemPriority;
  labelId?: string;
  q?: string;
}

export type WorkItemListQuery = WorkItemListFilterDto & PaginationDto;

export interface BulkUpdateWorkItemsDto {
  ids: string[];
  patch: UpdateWorkItemDto;
}

/** ----------------------------------------
 * Sprints DTOs
 * --------------------------------------- */
export interface CreateSprintDto {
  projectId: string;
  boardId?: string;
  name: string;
  goal?: string;
  status?: SprintStatus;
  startAt?: string;
  endAt?: string;
  capacityPoints?: number | null;
}

export interface UpdateSprintDto {
  boardId?: string | null;
  name?: string;
  goal?: string;
  status?: SprintStatus;
  startAt?: string | null;
  endAt?: string | null;
  capacityPoints?: number | null;
}

export interface CloseSprintDto {
  moveIncompleteToBacklog?: boolean;
  targetSprintId?: string | null;
  summaryNote?: string;
}

/** ----------------------------------------
 * Boards / Columns DTOs
 * --------------------------------------- */
export interface CreateBoardDto {
  projectId: string;
  type: BoardType;
  name: string;
  description?: string;
  isDefault?: boolean;
  metadata?: unknown;
}

export interface UpdateBoardDto {
  type?: BoardType;
  name?: string;
  description?: string;
  isDefault?: boolean;
  metadata?: unknown;
}

export interface CreateBoardColumnDto {
  boardId?: string; // backend will set from path param
  key: string;
  name: string;

  order?: number; // ✅ ADD THIS (required by Prisma model)

  wipLimit?: number;
  isBacklog?: boolean;
  isDone?: boolean;
}

export interface ReorderBoardColumnsDto {
  columns: Array<{ id: string; order: number }>;
}

export interface UpdateBoardColumnDto {
  name?: string;
  wipLimit?: number | null;
  isBacklog?: boolean;
  isDone?: boolean;
}

/** ----------------------------------------
 * Extra DTOs you pasted (future endpoints)
 * --------------------------------------- */
export interface CreateWorkItemRelationDto {
  fromId: string;
  toId: string;
  type: WorkItemRelationType;
}

export interface CreateLabelDto {
  name: string;
  color?: string;
}

export interface AttachLabelDto {
  workItemId: string;
  labelId: string;
}

export interface CreateWorkItemCommentDto {
  workItemId: string;
  body: string;
}

export interface CreateWorkItemAttachmentDto {
  workItemId: string;
  fileId: string;
  uploadedByUserId?: string;
}

/** ----------------------------------------
 * Response aliases
 * --------------------------------------- */
// Projects
export type ListProjectsResponse = ApiResponse<ListData<Project>>;
export type GetProjectResponse = ApiResponse<Project>;
export type CreateProjectResponse = ApiResponse<Project>;
export type UpdateProjectResponse = ApiResponse<Project>;
export type ArchiveProjectResponse = ApiResponse<Project | { ok?: true }>;
export type RestoreProjectResponse = ApiResponse<Project | { ok?: true }>;
export type SoftDeleteProjectResponse = ApiResponse<Project | { ok?: true }>;
export type ProjectSummaryResponse = ApiResponse<ProjectSummary>;
export type ProjectActivityResponse = ApiResponse<ProjectActivity[]>;

// Project Members
export type ListProjectMembersResponse = ApiResponse<ListData<ProjectMember>>;
export type AddProjectMemberResponse = ApiResponse<ProjectMember>;
export type ChangeProjectMemberRoleResponse = ApiResponse<ProjectMember>;
export type TransferProjectOwnerResponse = ApiResponse<ProjectMember>;
export type RemoveProjectMemberResponse = ApiResponse<{ ok?: true } | ProjectMember>;

// Workflows
export type ListWorkflowsResponse = ApiResponse<ListData<Workflow>>;
export type CreateWorkflowResponse = ApiResponse<Workflow>;
export type CloneWorkflowResponse = ApiResponse<Workflow>;
export type AddWorkflowStatusResponse = ApiResponse<WorkflowStatus>;
export type ReorderWorkflowStatusesResponse = ApiResponse<WorkflowStatus[] | { ok?: true }>;
export type SetDefaultWorkflowResponse = ApiResponse<Workflow | { ok?: true }>;
export type RenameWorkflowResponse = ApiResponse<Workflow>;
export type DeleteWorkflowStatusResponse = ApiResponse<{ ok?: true } | WorkflowStatus>;

// Work Items
export type ListWorkItemsResponse = ApiResponse<ListData<WorkItem>>;
export type GetWorkItemResponse = ApiResponse<WorkItem>;
export type CreateWorkItemResponse = ApiResponse<WorkItem>;
export type UpdateWorkItemResponse = ApiResponse<WorkItem>;
export type SoftDeleteWorkItemResponse = ApiResponse<WorkItem | { ok?: true }>;
export type RestoreWorkItemResponse = ApiResponse<WorkItem | { ok?: true }>;
export type BulkUpdateWorkItemsResponse = ApiResponse<{ ok?: true; count?: number }>;
export type ListWorkItemLabelsResponse = ApiResponse<ListData<Label>>;
export type CreateLabelResponse = ApiResponse<Label>;
export type AddWorkItemCommentResponse = ApiResponse<WorkItemComment>;
export type DeleteWorkItemCommentResponse = ApiResponse<{ ok?: true }>;
export type AttachWorkItemLabelResponse = ApiResponse<{ ok?: true }>;
export type DetachWorkItemLabelResponse = ApiResponse<{ ok?: true }>;
export type CreateWorkItemRelationResponse = ApiResponse<WorkItemRelation>;
export type DeleteWorkItemRelationResponse = ApiResponse<{ ok?: true }>;
export type AddWorkItemAttachmentResponse = ApiResponse<WorkItemAttachment>;
export type DeleteWorkItemAttachmentResponse = ApiResponse<{ ok?: true }>;
export type WorkItemActivityResponse = ApiResponse<ProjectActivity[]>;

// Sprints
export type ListSprintsResponse = ApiResponse<ListData<Sprint>>;
export type GetSprintResponse = ApiResponse<Sprint>;
export type CreateSprintResponse = ApiResponse<Sprint>;
export type UpdateSprintResponse = ApiResponse<Sprint>;
export type StartSprintResponse = ApiResponse<Sprint | { ok?: true }>;
export type CloseSprintResponse = ApiResponse<Sprint | { ok?: true }>;
export type SprintWorkItemsResponse = ApiResponse<WorkItem[]>;
export type SprintBoardViewResponse = ApiResponse<SprintBoardView>;
export type SprintVelocityResponse = ApiResponse<SprintVelocity>;

// Boards / Columns
export type ListBoardsResponse = ApiResponse<ListData<Board>>;
export type GetBoardResponse = ApiResponse<Board>;
export type CreateBoardResponse = ApiResponse<Board>;
export type UpdateBoardResponse = ApiResponse<Board>;
export type SoftDeleteBoardResponse = ApiResponse<Board | { ok?: true }>;
export type RestoreBoardResponse = ApiResponse<Board | { ok?: true }>;

export type ListBoardColumnsResponse = ApiResponse<ListData<BoardColumn>>;
export type CreateBoardColumnResponse = ApiResponse<BoardColumn>;
export type ReorderBoardColumnsResponse = ApiResponse<BoardColumn[] | { ok?: true }>;
export type UpdateBoardColumnResponse = ApiResponse<BoardColumn>;
export type RemoveBoardColumnResponse = ApiResponse<{ ok?: true } | BoardColumn>;



/** ----------------------------------------
 * Timeline (Roadmap / Milestones / Events)
 * --------------------------------------- */

export type ProjectMilestoneStatus = string;
export type TimelineEventType = string;

export interface ProjectMilestone {
  id: string;
  projectId?: string;
  title?: string;
  description?: string | null;
  status?: ProjectMilestoneStatus;

  startAt?: string | null;
  dueAt?: string | null;

  sortOrder?: number;
  ownerMembershipId?: string | null;
  dependencyIds?: string[];
  isOverdue?: boolean;
  isUpcoming?: boolean;
  daysUntilDue?: number | null;
  durationDays?: number | null;
  deletedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;

  // optional includes
  workItems?: Array<{
    workItemId?: string;
    workItem?: WorkItem;
  }>;

  [key: string]: unknown;
}

export interface ProjectTimelineEvent {
  id: string;
  projectId?: string;

  title?: string;
  description?: string | null;

  type?: TimelineEventType;

  startAt?: string | null;
  endAt?: string | null;
  milestoneId?: string | null;
  isOverdue?: boolean;
  isUpcoming?: boolean;
  daysUntilStart?: number | null;

  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

export interface RoadmapQueryDto {
  q?: string;
  from?: string;
  to?: string;
  includeDeleted?: boolean;

  includeSprints?: boolean;
  includeDueWorkItems?: boolean;
  milestoneId?: string;
  ownerMembershipId?: string;
}

export interface RoadmapResponse {
  project?: Partial<Project>;
  projectWindow?: {
    startDate?: string | null;
    targetDate?: string | null;
  };
  milestones: ProjectMilestone[];
  events: ProjectTimelineEvent[];
  sprints: Sprint[];
  dueWorkItems: WorkItem[];
}

/** Milestones DTOs */
export interface ListProjectMilestonesFilterDto {
  q?: string;
  status?: ProjectMilestoneStatus;
  includeDeleted?: boolean;
  ownerMembershipId?: string;
  overdue?: boolean;
  upcomingDays?: number;
}

export interface CreateProjectMilestoneDto {
  title: string;
  description?: string;

  startAt?: string;
  dueAt?: string;

  sortOrder?: number;
  ownerMembershipId?: string;
  metadata?: unknown;
}

export interface UpdateProjectMilestoneDto {
  title?: string;
  description?: string | null;

  startAt?: string | null;
  dueAt?: string | null;

  sortOrder?: number;
  status?: ProjectMilestoneStatus;
  ownerMembershipId?: string | null;
  metadata?: unknown;
}

export interface ReorderMilestonesDto {
  milestones: Array<{ id: string; sortOrder: number }>;
}

export interface ChangeMilestoneStatusDto {
  status: ProjectMilestoneStatus;
}

export interface LinkMilestoneWorkItemDto {
  workItemId: string;
}

export interface MilestoneDependencyDto {
  dependsOnMilestoneId: string;
}

/** Events DTOs */
export interface ListProjectTimelineEventsFilterDto {
  q?: string;
  from?: string;
  to?: string;
  type?: TimelineEventType;
  includeDeleted?: boolean;
  milestoneId?: string;
}

export interface CreateProjectTimelineEventDto {
  title: string;
  description?: string;

  type?: TimelineEventType;

  startAt: string;
  endAt?: string | null;
  milestoneId?: string;
  metadata?: unknown;
}

export interface UpdateProjectTimelineEventDto {
  title?: string;
  description?: string | null;

  type?: TimelineEventType;

  startAt?: string;
  endAt?: string | null;
  milestoneId?: string | null;
  metadata?: unknown;
}

/** Timeline Responses */
export type RoadmapTimelineResponse = ApiResponse<RoadmapResponse>;

export type ListMilestonesResponse = ApiResponse<ListData<ProjectMilestone>>;
export type GetMilestoneResponse = ApiResponse<ProjectMilestone>;
export type CreateMilestoneResponse = ApiResponse<ProjectMilestone>;
export type UpdateMilestoneResponse = ApiResponse<ProjectMilestone>;
export type ReorderMilestonesResponse = ApiResponse<{ ok?: true } | ProjectMilestone[]>;
export type DeleteMilestoneResponse = ApiResponse<{ ok?: true }>;
export type RestoreMilestoneResponse = ApiResponse<ProjectMilestone | { ok?: true }>;

export type ListTimelineEventsResponse = ApiResponse<ListData<ProjectTimelineEvent>>;
export type GetTimelineEventResponse = ApiResponse<ProjectTimelineEvent>;
export type CreateTimelineEventResponse = ApiResponse<ProjectTimelineEvent>;
export type UpdateTimelineEventResponse = ApiResponse<ProjectTimelineEvent>;
export type DeleteTimelineEventResponse = ApiResponse<{ ok?: true }>;
export type RestoreTimelineEventResponse = ApiResponse<ProjectTimelineEvent | { ok?: true }>;

/** ----------------------------------------
 * Timeline: Linking Work Items to Milestones
 * --------------------------------------- */
export interface AttachMilestoneWorkItemDto {
  workItemId: string;
}

/** ----------------------------------------
 * Timeline: Milestone ⇄ WorkItem linking
 * --------------------------------------- */
export interface LinkMilestoneWorkItemDto {
  workItemId: string;
}
