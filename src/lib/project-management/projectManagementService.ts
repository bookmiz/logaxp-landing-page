// src/lib/project-management/projectManagementService.ts
"use client";

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  // DTOs
  ProjectListQuery,
  CreateProjectDto,
  UpdateProjectDto,

  AddProjectMemberDto,
  ChangeProjectMemberRoleDto,

  CreateWorkflowDto,
  CloneWorkflowDto,
  CreateWorkflowStatusDto,
  ReorderWorkflowStatusesItemDto,
  RenameWorkflowDto,

  WorkItemListQuery,
  BulkUpdateWorkItemsDto,
  CreateLabelDto,
  CreateWorkItemAttachmentDto,
  CreateWorkItemCommentDto,
  CreateWorkItemRelationDto,
  CreateWorkItemDto,
  UpdateWorkItemDto,

  CreateSprintDto,
  CloseSprintDto,
  UpdateSprintDto,

  CreateBoardDto,
  UpdateBoardDto,
  CreateBoardColumnDto,
  ReorderBoardColumnsDto,
  UpdateBoardColumnDto,

  // Entities
  ApiResponse,
  Project,
  ProjectMember,
  Workflow,
  WorkflowStatus,
  WorkItem,
  Label,
  WorkItemAttachment,
  WorkItemComment,
  WorkItemRelation,
  Sprint,
  Board,
  BoardColumn,

  // Responses (enveloped)
  ListProjectsResponse,
  GetProjectResponse,
  CreateProjectResponse,
  UpdateProjectResponse,
  ArchiveProjectResponse,
  RestoreProjectResponse,
  SoftDeleteProjectResponse,
  ProjectSummaryResponse,
  ProjectActivityResponse,

  ListProjectMembersResponse,
  AddProjectMemberResponse,
  ChangeProjectMemberRoleResponse,
  TransferProjectOwnerResponse,
  RemoveProjectMemberResponse,

  ListWorkflowsResponse,
  CreateWorkflowResponse,
  CloneWorkflowResponse,
  AddWorkflowStatusResponse,
  ReorderWorkflowStatusesResponse,
  SetDefaultWorkflowResponse,
  RenameWorkflowResponse,
  DeleteWorkflowStatusResponse,

  ListWorkItemsResponse,
  GetWorkItemResponse,
  CreateWorkItemResponse,
  UpdateWorkItemResponse,
  SoftDeleteWorkItemResponse,
  RestoreWorkItemResponse,
  BulkUpdateWorkItemsResponse,
  ListWorkItemLabelsResponse,
  CreateLabelResponse,
  AddWorkItemCommentResponse,
  DeleteWorkItemCommentResponse,
  AttachWorkItemLabelResponse,
  DetachWorkItemLabelResponse,
  CreateWorkItemRelationResponse,
  DeleteWorkItemRelationResponse,
  AddWorkItemAttachmentResponse,
  DeleteWorkItemAttachmentResponse,
  WorkItemActivityResponse,

  ListSprintsResponse,
  GetSprintResponse,
  CreateSprintResponse,
  UpdateSprintResponse,
  StartSprintResponse,
  CloseSprintResponse,
  SprintBoardViewResponse,
  SprintVelocityResponse,
  SprintWorkItemsResponse,

  ListBoardsResponse,
  GetBoardResponse,
  CreateBoardResponse,
  UpdateBoardResponse,
  SoftDeleteBoardResponse,
  RestoreBoardResponse,
  ListBoardColumnsResponse,
  CreateBoardColumnResponse,
  ReorderBoardColumnsResponse,
  UpdateBoardColumnResponse,
  RemoveBoardColumnResponse,

  CreateProjectMilestoneDto,
  UpdateProjectMilestoneDto,
  ReorderMilestonesDto,
  DeleteMilestoneResponse,
  RestoreMilestoneResponse,
  ProjectMilestone,
  ListTimelineEventsResponse,
  ListProjectTimelineEventsFilterDto,
  GetTimelineEventResponse,
  ProjectTimelineEvent,
  CreateTimelineEventResponse,
  CreateProjectTimelineEventDto,
  UpdateTimelineEventResponse,
  UpdateProjectTimelineEventDto,
  DeleteTimelineEventResponse,
  RestoreTimelineEventResponse,
  ListProjectMilestonesFilterDto,
  ListMilestonesResponse,
  GetMilestoneResponse,
  CreateMilestoneResponse,
  UpdateMilestoneResponse,
  ReorderMilestonesResponse,
  ChangeMilestoneStatusDto,
  LinkMilestoneWorkItemDto,
  MilestoneDependencyDto,
  RoadmapQueryDto,
  RoadmapResponse,
  RoadmapTimelineResponse
} from "./projectManagement.types";

function ok<T>(statusCode: number, data: T): ApiResponse<T> {
  return { statusCode, message: "ok", data };
}

function cleanParams(obj?: Record<string, unknown> | object): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function enc(v: string) {
  return encodeURIComponent(v);
}

export const projectManagementService = {
  /** ======================================
   * Projects
   * ===================================== */
  projects: {
    async list(query?: ProjectListQuery): Promise<ListProjectsResponse> {
      // backend returns raw list (items/total or items/meta etc)
      const res = await api.get<ListProjectsResponse["data"]>("/projects", {
        params: cleanParams(query as Record<string, unknown>),
      });
      return ok(res.status, res.data);
    },

    async get(id: string): Promise<GetProjectResponse> {
      // backend returns raw Project
      const res = await api.get<Project>(`/projects/${enc(id)}`);
      return ok(res.status, res.data);
    },

    async create(dto: CreateProjectDto): Promise<CreateProjectResponse> {
      const res = await api.post<Project>("/projects", dto);
      return ok(res.status, res.data);
    },

    async update(id: string, dto: UpdateProjectDto): Promise<UpdateProjectResponse> {
      const res = await api.patch<Project>(`/projects/${enc(id)}`, dto);
      return ok(res.status, res.data);
    },

    async archive(id: string): Promise<ArchiveProjectResponse> {
      const res = await api.post<Project | { ok?: true }>(`/projects/${enc(id)}/archive`);
      return ok(res.status, res.data);
    },

    async restore(id: string): Promise<RestoreProjectResponse> {
      const res = await api.post<Project | { ok?: true }>(`/projects/${enc(id)}/restore`);
      return ok(res.status, res.data);
    },

    async softDelete(id: string): Promise<SoftDeleteProjectResponse> {
      const res = await api.delete<Project | { ok?: true }>(`/projects/${enc(id)}`);
      return ok(res.status, res.data);
    },

    async summary(id: string): Promise<ProjectSummaryResponse> {
      const res = await api.get<ProjectSummaryResponse["data"]>(`/projects/${enc(id)}/summary`);
      return ok(res.status, res.data);
    },

    async activity(id: string): Promise<ProjectActivityResponse> {
      const res = await api.get<ProjectActivityResponse["data"]>(`/projects/${enc(id)}/activity`);
      return ok(res.status, res.data);
    },
  },

  /** ======================================
   * Project Members
   * ===================================== */
  projectMembers: {
    async list(projectId: string): Promise<ListProjectMembersResponse> {
      const res = await api.get<ListProjectMembersResponse["data"]>(`/projects/${enc(projectId)}/members`);
      return ok(res.status, res.data);
    },

    async add(projectId: string, dto: AddProjectMemberDto): Promise<AddProjectMemberResponse> {
      const res = await api.post<ProjectMember>(`/projects/${enc(projectId)}/members`, dto);
      return ok(res.status, res.data);
    },

    async changeRole(projectMemberId: string, dto: ChangeProjectMemberRoleDto): Promise<ChangeProjectMemberRoleResponse> {
      const res = await api.patch<ProjectMember>(`/projects/members/${enc(projectMemberId)}/role`, dto);
      return ok(res.status, res.data);
    },

    async transferOwner(projectId: string, projectMemberId: string): Promise<TransferProjectOwnerResponse> {
      const res = await api.post<ProjectMember>(
        `/projects/${enc(projectId)}/members/${enc(projectMemberId)}/transfer-owner`
      );
      return ok(res.status, res.data);
    },

    async remove(projectMemberId: string): Promise<RemoveProjectMemberResponse> {
      const res = await api.delete<{ ok?: true } | ProjectMember>(`/projects/members/${enc(projectMemberId)}`);
      return ok(res.status, res.data);
    },
  },

  /** ======================================
   * Workflows
   * ===================================== */
  workflows: {
    async list(): Promise<ListWorkflowsResponse> {
      const res = await api.get<ListWorkflowsResponse["data"]>("/workflows");
      return ok(res.status, res.data);
    },

    async create(dto: CreateWorkflowDto): Promise<CreateWorkflowResponse> {
      const res = await api.post<Workflow>("/workflows", dto);
      return ok(res.status, res.data);
    },

    async clone(workflowId: string, dto?: CloneWorkflowDto): Promise<CloneWorkflowResponse> {
      const res = await api.post<Workflow>(`/workflows/${enc(workflowId)}/clone`, dto ?? {});
      return ok(res.status, res.data);
    },

    async addStatus(workflowId: string, dto: CreateWorkflowStatusDto): Promise<AddWorkflowStatusResponse> {
      const { workflowId: _ignored, ...payload } = dto;
      const res = await api.post<WorkflowStatus>(`/workflows/${enc(workflowId)}/statuses`, payload);
      return ok(res.status, res.data);
    },

    async reorderStatuses(workflowId: string, items: ReorderWorkflowStatusesItemDto[]): Promise<ReorderWorkflowStatusesResponse> {
      const res = await api.post<WorkflowStatus[] | { ok?: true }>(
        `/workflows/${enc(workflowId)}/statuses/reorder`,
        items
      );
      return ok(res.status, res.data);
    },

    async setDefault(workflowId: string): Promise<SetDefaultWorkflowResponse> {
      const res = await api.post<Workflow | { ok?: true }>(`/workflows/${enc(workflowId)}/default`);
      return ok(res.status, res.data);
    },

    async rename(workflowId: string, dto: RenameWorkflowDto): Promise<RenameWorkflowResponse> {
      const res = await api.patch<Workflow>(`/workflows/${enc(workflowId)}`, dto);
      return ok(res.status, res.data);
    },

    async deleteStatus(statusId: string): Promise<DeleteWorkflowStatusResponse> {
      const res = await api.delete<{ ok?: true } | WorkflowStatus>(`/workflows/statuses/${enc(statusId)}`);
      return ok(res.status, res.data);
    },
  },

  /** ======================================
   * Work Items
   * ===================================== */
  workItems: {
    async list(query?: WorkItemListQuery): Promise<ListWorkItemsResponse> {
      const res = await api.get<ListWorkItemsResponse["data"]>("/work-items", {
        params: cleanParams(query as Record<string, unknown>),
      });
      return ok(res.status, res.data);
    },

    async get(id: string): Promise<GetWorkItemResponse> {
      const res = await api.get<WorkItem>(`/work-items/${enc(id)}`);
      return ok(res.status, res.data);
    },

    async create(dto: CreateWorkItemDto): Promise<CreateWorkItemResponse> {
      const res = await api.post<WorkItem>("/work-items", dto);
      return ok(res.status, res.data);
    },

    async update(id: string, dto: UpdateWorkItemDto): Promise<UpdateWorkItemResponse> {
      const res = await api.patch<WorkItem>(`/work-items/${enc(id)}`, dto);
      return ok(res.status, res.data);
    },

    async softDelete(id: string): Promise<SoftDeleteWorkItemResponse> {
      const res = await api.delete<WorkItem | { ok?: true }>(`/work-items/${enc(id)}`);
      return ok(res.status, res.data);
    },

    async restore(id: string): Promise<RestoreWorkItemResponse> {
      const res = await api.post<WorkItem | { ok?: true }>(`/work-items/${enc(id)}/restore`);
      return ok(res.status, res.data);
    },

    async bulkUpdate(dto: BulkUpdateWorkItemsDto): Promise<BulkUpdateWorkItemsResponse> {
      const res = await api.post<{ ok?: true; count?: number }>("/work-items/bulk", dto);
      return ok(res.status, res.data);
    },

    async listLabels(): Promise<ListWorkItemLabelsResponse> {
      const res = await api.get<ListWorkItemLabelsResponse["data"]>("/work-items/labels");
      return ok(res.status, res.data);
    },

    async createLabel(dto: CreateLabelDto): Promise<CreateLabelResponse> {
      const res = await api.post<Label>("/work-items/labels", dto);
      return ok(res.status, res.data);
    },

    async addComment(workItemId: string, dto: Omit<CreateWorkItemCommentDto, "workItemId">): Promise<AddWorkItemCommentResponse> {
      const res = await api.post<WorkItemComment>(`/work-items/${enc(workItemId)}/comments`, dto);
      return ok(res.status, res.data);
    },

    async deleteComment(workItemId: string, commentId: string): Promise<DeleteWorkItemCommentResponse> {
      const res = await api.delete<{ ok?: true }>(`/work-items/${enc(workItemId)}/comments/${enc(commentId)}`);
      return ok(res.status, res.data);
    },

    async attachLabel(workItemId: string, labelId: string): Promise<AttachWorkItemLabelResponse> {
      const res = await api.post<{ ok?: true }>(`/work-items/${enc(workItemId)}/labels`, { labelId });
      return ok(res.status, res.data);
    },

    async detachLabel(workItemId: string, labelId: string): Promise<DetachWorkItemLabelResponse> {
      const res = await api.delete<{ ok?: true }>(`/work-items/${enc(workItemId)}/labels/${enc(labelId)}`);
      return ok(res.status, res.data);
    },

    async createRelation(
      workItemId: string,
      dto: Omit<CreateWorkItemRelationDto, "fromId">
    ): Promise<CreateWorkItemRelationResponse> {
      const res = await api.post<WorkItemRelation>(`/work-items/${enc(workItemId)}/relations`, dto);
      return ok(res.status, res.data);
    },

    async deleteRelation(workItemId: string, relationId: string): Promise<DeleteWorkItemRelationResponse> {
      const res = await api.delete<{ ok?: true }>(`/work-items/${enc(workItemId)}/relations/${enc(relationId)}`);
      return ok(res.status, res.data);
    },

    async addAttachment(
      workItemId: string,
      dto: Omit<CreateWorkItemAttachmentDto, "workItemId">
    ): Promise<AddWorkItemAttachmentResponse> {
      const res = await api.post<WorkItemAttachment>(`/work-items/${enc(workItemId)}/attachments`, dto);
      return ok(res.status, res.data);
    },

    async deleteAttachment(workItemId: string, attachmentId: string): Promise<DeleteWorkItemAttachmentResponse> {
      const res = await api.delete<{ ok?: true }>(`/work-items/${enc(workItemId)}/attachments/${enc(attachmentId)}`);
      return ok(res.status, res.data);
    },

    async activity(workItemId: string): Promise<WorkItemActivityResponse> {
      const res = await api.get<WorkItemActivityResponse["data"]>(`/work-items/${enc(workItemId)}/activity`);
      return ok(res.status, res.data);
    },
  },
   /** ======================================
   * ProjectTimeline (Batch 4)
   * ===================================== */

 /** ======================================
 * Timeline
 * ===================================== */
timeline: {
  async roadmap(projectId: string, query?: RoadmapQueryDto): Promise<RoadmapTimelineResponse> {
    const res = await api.get<RoadmapResponse>(`/projects/${enc(projectId)}/timeline/roadmap`, {
      params: cleanParams(query as any),
    });
    return ok(res.status, res.data);
  },

  // =========================================================
  // Milestones
  // list/create/reorder are project-scoped
  // get/update/status/delete/restore/link are milestoneId-scoped (backend)
  // =========================================================

  async listMilestones(projectId: string, filter?: ListProjectMilestonesFilterDto): Promise<ListMilestonesResponse> {
    const res = await api.get<ListMilestonesResponse["data"]>(`/projects/${enc(projectId)}/timeline/milestones`, {
      params: cleanParams(filter as any),
    });
    return ok(res.status, res.data);
  },

  async getMilestone(_projectId: string, milestoneId: string): Promise<GetMilestoneResponse> {
    const res = await api.get<ProjectMilestone>(`/projects/timeline/milestones/${enc(milestoneId)}`);
    return ok(res.status, res.data);
  },

  async createMilestone(projectId: string, dto: CreateProjectMilestoneDto): Promise<CreateMilestoneResponse> {
    const res = await api.post<ProjectMilestone>(`/projects/${enc(projectId)}/timeline/milestones`, dto);
    return ok(res.status, res.data);
  },

  async updateMilestone(
    _projectId: string,
    milestoneId: string,
    dto: UpdateProjectMilestoneDto
  ): Promise<UpdateMilestoneResponse> {
    const res = await api.patch<ProjectMilestone>(`/projects/timeline/milestones/${enc(milestoneId)}`, dto);
    return ok(res.status, res.data);
  },

  async reorderMilestones(projectId: string, dto: ReorderMilestonesDto): Promise<ReorderMilestonesResponse> {
    const res = await api.post<ProjectMilestone[] | { ok?: true }>(
      `/projects/${enc(projectId)}/timeline/milestones/reorder`,
      dto
    );
    return ok(res.status, res.data);
  },

  async changeMilestoneStatus(
    _projectId: string,
    milestoneId: string,
    dto: ChangeMilestoneStatusDto
  ): Promise<UpdateMilestoneResponse> {
    const res = await api.post<ProjectMilestone>(`/projects/timeline/milestones/${enc(milestoneId)}/status`, dto);
    return ok(res.status, res.data);
  },

  async softDeleteMilestone(_projectId: string, milestoneId: string): Promise<DeleteMilestoneResponse> {
    const res = await api.delete<{ ok?: true }>(`/projects/timeline/milestones/${enc(milestoneId)}`);
    return ok(res.status, res.data);
  },

  async restoreMilestone(_projectId: string, milestoneId: string): Promise<RestoreMilestoneResponse> {
    const res = await api.post<ProjectMilestone | { ok?: true }>(
      `/projects/timeline/milestones/${enc(milestoneId)}/restore`
    );
    return ok(res.status, res.data);
  },

  async linkMilestoneWorkItem(
    _projectId: string,
    milestoneId: string,
    dto: LinkMilestoneWorkItemDto
  ): Promise<ApiResponse<{ ok?: true } | ProjectMilestone>> {
    const res = await api.post<{ ok?: true } | ProjectMilestone>(
      `/projects/timeline/milestones/${enc(milestoneId)}/work-items`,
      dto
    );
    return ok(res.status, res.data);
  },

  async unlinkMilestoneWorkItem(
    _projectId: string,
    milestoneId: string,
    workItemId: string
  ): Promise<ApiResponse<{ ok?: true }>> {
    const res = await api.delete<{ ok?: true }>(
      `/projects/timeline/milestones/${enc(milestoneId)}/work-items/${enc(workItemId)}`
    );
    return ok(res.status, res.data);
  },

  async addMilestoneDependency(
    _projectId: string,
    milestoneId: string,
    dto: MilestoneDependencyDto
  ): Promise<UpdateMilestoneResponse> {
    const res = await api.post<ProjectMilestone>(
      `/projects/timeline/milestones/${enc(milestoneId)}/dependencies`,
      dto
    );
    return ok(res.status, res.data);
  },

  async removeMilestoneDependency(
    _projectId: string,
    milestoneId: string,
    dependsOnMilestoneId: string
  ): Promise<UpdateMilestoneResponse> {
    const res = await api.delete<ProjectMilestone>(
      `/projects/timeline/milestones/${enc(milestoneId)}/dependencies/${enc(dependsOnMilestoneId)}`
    );
    return ok(res.status, res.data);
  },

  // Optional aliases (keep if your UI already calls attach/detach)
  async attachWorkItem(_projectId: string, milestoneId: string, dto: { workItemId: string }) {
    const res = await api.post(
      `/projects/timeline/milestones/${enc(milestoneId)}/work-items`,
      dto
    );
    return ok(res.status, res.data);
  },

  async detachWorkItem(_projectId: string, milestoneId: string, workItemId: string) {
    const res = await api.delete(
      `/projects/timeline/milestones/${enc(milestoneId)}/work-items/${enc(workItemId)}`
    );
    return ok(res.status, res.data);
  },

  // =========================================================
  // Events
  // list/create are project-scoped
  // get/update/delete/restore are eventId-scoped (backend)
  // =========================================================

  async listEvents(projectId: string, filter?: ListProjectTimelineEventsFilterDto): Promise<ListTimelineEventsResponse> {
    const res = await api.get<ListTimelineEventsResponse["data"]>(`/projects/${enc(projectId)}/timeline/events`, {
      params: cleanParams(filter as any),
    });
    return ok(res.status, res.data);
  },

  async getEvent(_projectId: string, eventId: string): Promise<GetTimelineEventResponse> {
    const res = await api.get<ProjectTimelineEvent>(`/projects/timeline/events/${enc(eventId)}`);
    return ok(res.status, res.data);
  },

  async createEvent(projectId: string, dto: CreateProjectTimelineEventDto): Promise<CreateTimelineEventResponse> {
    const res = await api.post<ProjectTimelineEvent>(`/projects/${enc(projectId)}/timeline/events`, dto);
    return ok(res.status, res.data);
  },

  async updateEvent(
    _projectId: string,
    eventId: string,
    dto: UpdateProjectTimelineEventDto
  ): Promise<UpdateTimelineEventResponse> {
    const res = await api.patch<ProjectTimelineEvent>(`/projects/timeline/events/${enc(eventId)}`, dto);
    return ok(res.status, res.data);
  },

  async softDeleteEvent(_projectId: string, eventId: string): Promise<DeleteTimelineEventResponse> {
    const res = await api.delete<{ ok?: true }>(`/projects/timeline/events/${enc(eventId)}`);
    return ok(res.status, res.data);
  },

  async restoreEvent(_projectId: string, eventId: string): Promise<RestoreTimelineEventResponse> {
    const res = await api.post<ProjectTimelineEvent | { ok?: true }>(
      `/projects/timeline/events/${enc(eventId)}/restore`
    );
    return ok(res.status, res.data);
  },
},

  /** ======================================
   * Sprints
   * ===================================== */
  sprints: {
    async listByProject(projectId?: string): Promise<ListSprintsResponse> {
      const res = await api.get<ListSprintsResponse["data"]>("/sprints", {
        params: cleanParams({ projectId }),
      });
      return ok(res.status, res.data);
    },

    async get(id: string): Promise<GetSprintResponse> {
      const res = await api.get<Sprint>(`/sprints/${enc(id)}`);
      return ok(res.status, res.data);
    },

    async workItems(id: string): Promise<SprintWorkItemsResponse> {
      const res = await api.get<SprintWorkItemsResponse["data"]>(`/sprints/${enc(id)}/work-items`);
      return ok(res.status, res.data);
    },

    async boardView(id: string): Promise<SprintBoardViewResponse> {
      const res = await api.get<SprintBoardViewResponse["data"]>(`/sprints/${enc(id)}/board-view`);
      return ok(res.status, res.data);
    },

    async velocity(projectId: string): Promise<SprintVelocityResponse> {
      const res = await api.get<SprintVelocityResponse["data"]>("/sprints/velocity", { params: { projectId } });
      return ok(res.status, res.data);
    },

    async create(dto: CreateSprintDto): Promise<CreateSprintResponse> {
      const res = await api.post<Sprint>("/sprints", dto);
      return ok(res.status, res.data);
    },

    async update(id: string, dto: UpdateSprintDto): Promise<UpdateSprintResponse> {
      const res = await api.patch<Sprint>(`/sprints/${enc(id)}`, dto);
      return ok(res.status, res.data);
    },

    async start(id: string): Promise<StartSprintResponse> {
      const res = await api.post<Sprint | { ok?: true }>(`/sprints/${enc(id)}/start`);
      return ok(res.status, res.data);
    },

    async close(id: string, dto?: CloseSprintDto): Promise<CloseSprintResponse> {
      const res = await api.post<Sprint | { ok?: true }>(`/sprints/${enc(id)}/close`, dto ?? {});
      return ok(res.status, res.data);
    },
  },

  /** ======================================
   * Boards + Columns
   * ===================================== */
  boards: {
    async listByProject(projectId: string): Promise<ListBoardsResponse> {
      const res = await api.get<ListBoardsResponse["data"]>("/boards", { params: { projectId } });
      return ok(res.status, res.data);
    },

    async get(id: string): Promise<GetBoardResponse> {
      const res = await api.get<Board>(`/boards/${enc(id)}`);
      return ok(res.status, res.data);
    },

    async create(dto: CreateBoardDto): Promise<CreateBoardResponse> {
      const res = await api.post<Board>("/boards", dto);
      return ok(res.status, res.data);
    },

    async update(id: string, dto: UpdateBoardDto): Promise<UpdateBoardResponse> {
      const res = await api.patch<Board>(`/boards/${enc(id)}`, dto);
      return ok(res.status, res.data);
    },

    async softDelete(id: string): Promise<SoftDeleteBoardResponse> {
      const res = await api.delete<Board | { ok?: true }>(`/boards/${enc(id)}`);
      return ok(res.status, res.data);
    },

    async restore(id: string): Promise<RestoreBoardResponse> {
      const res = await api.post<Board | { ok?: true }>(`/boards/${enc(id)}/restore`);
      return ok(res.status, res.data);
    },

    // Columns
    async listColumns(boardId: string): Promise<ListBoardColumnsResponse> {
      const res = await api.get<ListBoardColumnsResponse["data"]>(`/boards/${enc(boardId)}/columns`);
      return ok(res.status, res.data);
    },

    async createColumn(boardId: string, dto: CreateBoardColumnDto): Promise<CreateBoardColumnResponse> {
      const { boardId: _ignored, ...payload } = dto;
      const res = await api.post<BoardColumn>(`/boards/${enc(boardId)}/columns`, payload);
      return ok(res.status, res.data);
    },

    async reorderColumns(boardId: string, dto: ReorderBoardColumnsDto): Promise<ReorderBoardColumnsResponse> {
      const res = await api.post<BoardColumn[] | { ok?: true }>(`/boards/${enc(boardId)}/columns/reorder`, dto);
      return ok(res.status, res.data);
    },

    async updateColumn(columnId: string, dto: UpdateBoardColumnDto): Promise<UpdateBoardColumnResponse> {
      const res = await api.patch<BoardColumn>(`/boards/columns/${enc(columnId)}`, dto);
      return ok(res.status, res.data);
    },

    async removeColumn(columnId: string): Promise<RemoveBoardColumnResponse> {
      const res = await api.delete<{ ok?: true } | BoardColumn>(`/boards/columns/${enc(columnId)}`);
      return ok(res.status, res.data);
    },
  },
};
