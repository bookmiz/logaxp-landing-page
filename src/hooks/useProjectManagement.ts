// src/hooks/useProjectManagement.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type {
  ProjectListQuery,
  CreateProjectDto,
  UpdateProjectDto,

  AddProjectMemberDto,
  ChangeProjectMemberRoleDto,

  CreateWorkflowDto,
  CreateWorkflowStatusDto,
  ReorderWorkflowStatusesItemDto,
  RenameWorkflowDto,

  WorkItemListQuery,
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
  UpdateProjectTimelineEventDto,
  CreateProjectTimelineEventDto,
  ListProjectTimelineEventsFilterDto,
  ChangeMilestoneStatusDto,
  ReorderMilestonesDto,
  UpdateProjectMilestoneDto,
  CreateProjectMilestoneDto,
  ListProjectMilestonesFilterDto,
  RoadmapQueryDto,
  AttachMilestoneWorkItemDto,
  MilestoneDependencyDto,
} from "@/logaxp/lib/project-management/projectManagement.types";

type ApiErrorShape = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
  message?: unknown;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;

  if (err && typeof err === "object") {
    const e = err as ApiErrorShape;

    const apiMsg = e.response?.data?.message;
    if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;

    if (Array.isArray(apiMsg) && apiMsg.length) {
      const first = apiMsg.find((x) => typeof x === "string" && x.trim());
      if (typeof first === "string") return first;
    }

    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Something went wrong";
}

export function useProjectManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  /** ======================================
   * Projects
   * ===================================== */
  const listProjects = useCallback(
    (query?: ProjectListQuery) => wrap(() => projectManagementService.projects.list(query)),
    [wrap]
  );

  const getProject = useCallback(
    (id: string) => wrap(() => projectManagementService.projects.get(id)),
    [wrap]
  );

  const createProject = useCallback(
    (dto: CreateProjectDto) => wrap(() => projectManagementService.projects.create(dto)),
    [wrap]
  );

  const updateProject = useCallback(
    (id: string, dto: UpdateProjectDto) => wrap(() => projectManagementService.projects.update(id, dto)),
    [wrap]
  );

  const archiveProject = useCallback(
    (id: string) => wrap(() => projectManagementService.projects.archive(id)),
    [wrap]
  );

  const softDeleteProject = useCallback(
    (id: string) => wrap(() => projectManagementService.projects.softDelete(id)),
    [wrap]
  );

  /** ======================================
   * Project Members
   * ===================================== */
  const listProjectMembers = useCallback(
    (projectId: string) => wrap(() => projectManagementService.projectMembers.list(projectId)),
    [wrap]
  );

  const addProjectMember = useCallback(
    (projectId: string, dto: AddProjectMemberDto) =>
      wrap(() => projectManagementService.projectMembers.add(projectId, dto)),
    [wrap]
  );

  const changeProjectMemberRole = useCallback(
    (projectMemberId: string, dto: ChangeProjectMemberRoleDto) =>
      wrap(() => projectManagementService.projectMembers.changeRole(projectMemberId, dto)),
    [wrap]
  );

  const removeProjectMember = useCallback(
    (projectMemberId: string) => wrap(() => projectManagementService.projectMembers.remove(projectMemberId)),
    [wrap]
  );

  /** ======================================
   * Workflows
   * ===================================== */
  const listWorkflows = useCallback(
    () => wrap(() => projectManagementService.workflows.list()),
    [wrap]
  );

  const createWorkflow = useCallback(
    (dto: CreateWorkflowDto) => wrap(() => projectManagementService.workflows.create(dto)),
    [wrap]
  );

  const addWorkflowStatus = useCallback(
    (workflowId: string, dto: CreateWorkflowStatusDto) =>
      wrap(() => projectManagementService.workflows.addStatus(workflowId, dto)),
    [wrap]
  );

  const reorderWorkflowStatuses = useCallback(
    (workflowId: string, items: ReorderWorkflowStatusesItemDto[]) =>
      wrap(() => projectManagementService.workflows.reorderStatuses(workflowId, items)),
    [wrap]
  );

  const setDefaultWorkflow = useCallback(
    (workflowId: string) => wrap(() => projectManagementService.workflows.setDefault(workflowId)),
    [wrap]
  );

  const renameWorkflow = useCallback(
    (workflowId: string, dto: RenameWorkflowDto) =>
      wrap(() => projectManagementService.workflows.rename(workflowId, dto)),
    [wrap]
  );

  const deleteWorkflowStatus = useCallback(
    (statusId: string) => wrap(() => projectManagementService.workflows.deleteStatus(statusId)),
    [wrap]
  );

  /** ======================================
   * Work Items
   * ===================================== */
  const listWorkItems = useCallback(
    (query?: WorkItemListQuery) => wrap(() => projectManagementService.workItems.list(query)),
    [wrap]
  );

  const getWorkItem = useCallback(
    (id: string) => wrap(() => projectManagementService.workItems.get(id)),
    [wrap]
  );

  const createWorkItem = useCallback(
    (dto: CreateWorkItemDto) => wrap(() => projectManagementService.workItems.create(dto)),
    [wrap]
  );

  const updateWorkItem = useCallback(
    (id: string, dto: UpdateWorkItemDto) => wrap(() => projectManagementService.workItems.update(id, dto)),
    [wrap]
  );

  const softDeleteWorkItem = useCallback(
    (id: string) => wrap(() => projectManagementService.workItems.softDelete(id)),
    [wrap]
  );

    /** ======================================
   * Project Milestones
   * ===================================== */

      /** ======================================
   * Timeline
   * ===================================== */
  const roadmap = useCallback(
    (projectId: string, query?: RoadmapQueryDto) => wrap(() => projectManagementService.timeline.roadmap(projectId, query)),
    [wrap]
  );

  const listMilestones = useCallback(
    (projectId: string, filter?: ListProjectMilestonesFilterDto) =>
      wrap(() => projectManagementService.timeline.listMilestones(projectId, filter)),
    [wrap]
  );

  const createMilestone = useCallback(
    (projectId: string, dto: CreateProjectMilestoneDto) =>
      wrap(() => projectManagementService.timeline.createMilestone(projectId, dto)),
    [wrap]
  );

  const updateMilestone = useCallback(
    (projectId: string, milestoneId: string, dto: UpdateProjectMilestoneDto) =>
      wrap(() => projectManagementService.timeline.updateMilestone(projectId, milestoneId, dto)),
    [wrap]
  );

  const reorderMilestones = useCallback(
    (projectId: string, dto: ReorderMilestonesDto) =>
      wrap(() => projectManagementService.timeline.reorderMilestones(projectId, dto)),
    [wrap]
  );

  const changeMilestoneStatus = useCallback(
    (projectId: string, milestoneId: string, dto: ChangeMilestoneStatusDto) =>
      wrap(() => projectManagementService.timeline.changeMilestoneStatus(projectId, milestoneId, dto)),
    [wrap]
  );

  const softDeleteMilestone = useCallback(
    (projectId: string, milestoneId: string) =>
      wrap(() => projectManagementService.timeline.softDeleteMilestone(projectId, milestoneId)),
    [wrap]
  );

  const restoreMilestone = useCallback(
    (projectId: string, milestoneId: string) =>
      wrap(() => projectManagementService.timeline.restoreMilestone(projectId, milestoneId)),
    [wrap]
  );

  const listEvents = useCallback(
    (projectId: string, filter?: ListProjectTimelineEventsFilterDto) =>
      wrap(() => projectManagementService.timeline.listEvents(projectId, filter)),
    [wrap]
  );

  const createEvent = useCallback(
    (projectId: string, dto: CreateProjectTimelineEventDto) =>
      wrap(() => projectManagementService.timeline.createEvent(projectId, dto)),
    [wrap]
  );

  const updateEvent = useCallback(
    (projectId: string, eventId: string, dto: UpdateProjectTimelineEventDto) =>
      wrap(() => projectManagementService.timeline.updateEvent(projectId, eventId, dto)),
    [wrap]
  );

  const getMilestone = useCallback(
  (projectId: string, milestoneId: string) =>
    wrap(() => projectManagementService.timeline.getMilestone(projectId, milestoneId)),
  [wrap]
);

const attachWorkItem = useCallback(
  (projectId: string, milestoneId: string, dto: AttachMilestoneWorkItemDto) =>
    wrap(() => projectManagementService.timeline.attachWorkItem(projectId, milestoneId, dto)),
  [wrap]
);

const detachWorkItem = useCallback(
  (projectId: string, milestoneId: string, workItemId: string) =>
    wrap(() => projectManagementService.timeline.detachWorkItem(projectId, milestoneId, workItemId)),
  [wrap]
);

const addMilestoneDependency = useCallback(
  (projectId: string, milestoneId: string, dto: MilestoneDependencyDto) =>
    wrap(() => projectManagementService.timeline.addMilestoneDependency(projectId, milestoneId, dto)),
  [wrap]
);

const removeMilestoneDependency = useCallback(
  (projectId: string, milestoneId: string, dependsOnMilestoneId: string) =>
    wrap(() => projectManagementService.timeline.removeMilestoneDependency(projectId, milestoneId, dependsOnMilestoneId)),
  [wrap]
);

  const softDeleteEvent = useCallback(
    (projectId: string, eventId: string) =>
      wrap(() => projectManagementService.timeline.softDeleteEvent(projectId, eventId)),
    [wrap]
  );

  const restoreEvent = useCallback(
    (projectId: string, eventId: string) =>
      wrap(() => projectManagementService.timeline.restoreEvent(projectId, eventId)),
    [wrap]
  );

  const timeline = useMemo(
    () => ({
      roadmap,
      listMilestones,
      getMilestone,
      createMilestone,
      updateMilestone,
      reorderMilestones,
      changeMilestoneStatus,
      softDeleteMilestone,
      restoreMilestone,

       attachWorkItem,        // ✅
       detachWorkItem,        // ✅
      addMilestoneDependency,
      removeMilestoneDependency,

      listEvents,
      createEvent,
      updateEvent,
      softDeleteEvent,
      restoreEvent,
    }),
    [
      roadmap,
      listMilestones,
      createMilestone,
      updateMilestone,
      reorderMilestones,
      changeMilestoneStatus,
      softDeleteMilestone,
      restoreMilestone,
      listEvents,
      createEvent,
      updateEvent,
      softDeleteEvent,
      restoreEvent,
      attachWorkItem,
      detachWorkItem,
      addMilestoneDependency,
      removeMilestoneDependency,
      getMilestone,
    ]
  );

  /** ======================================
   * Sprints
   * ===================================== */
  const listSprintsByProject = useCallback(
    (projectId?: string) => wrap(() => projectManagementService.sprints.listByProject(projectId)),
    [wrap]
  );

  const createSprint = useCallback(
    (dto: CreateSprintDto) => wrap(() => projectManagementService.sprints.create(dto)),
    [wrap]
  );

  const updateSprint = useCallback(
    (id: string, dto: UpdateSprintDto) => wrap(() => projectManagementService.sprints.update(id, dto)),
    [wrap]
  );

  const startSprint = useCallback(
    (id: string) => wrap(() => projectManagementService.sprints.start(id)),
    [wrap]
  );

  const closeSprint = useCallback(
    (id: string, dto?: CloseSprintDto) => wrap(() => projectManagementService.sprints.close(id, dto)),
    [wrap]
  );

  /** ======================================
   * Boards + Columns
   * ===================================== */
  const listBoardsByProject = useCallback(
    (projectId: string) => wrap(() => projectManagementService.boards.listByProject(projectId)),
    [wrap]
  );

  const getBoard = useCallback(
    (id: string) => wrap(() => projectManagementService.boards.get(id)),
    [wrap]
  );

  const createBoard = useCallback(
    (dto: CreateBoardDto) => wrap(() => projectManagementService.boards.create(dto)),
    [wrap]
  );

  const updateBoard = useCallback(
    (id: string, dto: UpdateBoardDto) => wrap(() => projectManagementService.boards.update(id, dto)),
    [wrap]
  );

  const softDeleteBoard = useCallback(
    (id: string) => wrap(() => projectManagementService.boards.softDelete(id)),
    [wrap]
  );

  const listBoardColumns = useCallback(
    (boardId: string) => wrap(() => projectManagementService.boards.listColumns(boardId)),
    [wrap]
  );

  const createBoardColumn = useCallback(
    (boardId: string, dto: CreateBoardColumnDto) =>
      wrap(() => projectManagementService.boards.createColumn(boardId, dto)),
    [wrap]
  );

  const reorderBoardColumns = useCallback(
    (boardId: string, dto: ReorderBoardColumnsDto) =>
      wrap(() => projectManagementService.boards.reorderColumns(boardId, dto)),
    [wrap]
  );

  const updateBoardColumn = useCallback(
    (columnId: string, dto: UpdateBoardColumnDto) =>
      wrap(() => projectManagementService.boards.updateColumn(columnId, dto)),
    [wrap]
  );

  const removeBoardColumn = useCallback(
    (columnId: string) => wrap(() => projectManagementService.boards.removeColumn(columnId)),
    [wrap]
  );

  /** ======================================
   * Grouped API surface
   * ===================================== */
  const projects = useMemo(
    () => ({
      list: listProjects,
      get: getProject,
      create: createProject,
      update: updateProject,
      archive: archiveProject,
      softDelete: softDeleteProject,
    }),
    [listProjects, getProject, createProject, updateProject, archiveProject, softDeleteProject]
  );

  const projectMembers = useMemo(
    () => ({
      list: listProjectMembers,
      add: addProjectMember,
      changeRole: changeProjectMemberRole,
      remove: removeProjectMember,
    }),
    [listProjectMembers, addProjectMember, changeProjectMemberRole, removeProjectMember]
  );

  const workflows = useMemo(
    () => ({
      list: listWorkflows,
      create: createWorkflow,
      addStatus: addWorkflowStatus,
      reorderStatuses: reorderWorkflowStatuses,
      setDefault: setDefaultWorkflow,
      rename: renameWorkflow,
      deleteStatus: deleteWorkflowStatus,
    }),
    [
      listWorkflows,
      createWorkflow,
      addWorkflowStatus,
      reorderWorkflowStatuses,
      setDefaultWorkflow,
      renameWorkflow,
      deleteWorkflowStatus,
    ]
  );

  const workItems = useMemo(
    () => ({
      list: listWorkItems,
      get: getWorkItem,
      create: createWorkItem,
      update: updateWorkItem,
      softDelete: softDeleteWorkItem,
    }),
    [listWorkItems, getWorkItem, createWorkItem, updateWorkItem, softDeleteWorkItem]
  );

  const sprints = useMemo(
    () => ({
      listByProject: listSprintsByProject,
      create: createSprint,
      update: updateSprint,
      start: startSprint,
      close: closeSprint,
    }),
    [listSprintsByProject, createSprint, updateSprint, startSprint, closeSprint]
  );

  const boards = useMemo(
    () => ({
      listByProject: listBoardsByProject,
      get: getBoard,
      create: createBoard,
      update: updateBoard,
      softDelete: softDeleteBoard,

      listColumns: listBoardColumns,
      createColumn: createBoardColumn,
      reorderColumns: reorderBoardColumns,
      updateColumn: updateBoardColumn,
      removeColumn: removeBoardColumn,
    }),
    [
      listBoardsByProject,
      getBoard,
      createBoard,
      updateBoard,
      softDeleteBoard,
      listBoardColumns,
      createBoardColumn,
      reorderBoardColumns,
      updateBoardColumn,
      removeBoardColumn,
    ]
  );

  return {
    loading,
    error,
    clearError,
    wrap,

    // grouped
    projects,
    projectMembers,
    workflows,
    workItems,
    sprints,
    boards,
    timeline,

    // flat (optional)
    listProjects,
    getProject,
    createProject,
    updateProject,
    archiveProject,
    softDeleteProject,

    listProjectMembers,
    addProjectMember,
    changeProjectMemberRole,
    removeProjectMember,

    listWorkflows,
    createWorkflow,
    addWorkflowStatus,
    reorderWorkflowStatuses,
    setDefaultWorkflow,
    renameWorkflow,
    deleteWorkflowStatus,

    listWorkItems,
    getWorkItem,
    createWorkItem,
    updateWorkItem,
    softDeleteWorkItem,

    listSprintsByProject,
    createSprint,
    updateSprint,
    startSprint,
    closeSprint,

    listBoardsByProject,
    getBoard,
    createBoard,
    updateBoard,
    softDeleteBoard,
    listBoardColumns,
    createBoardColumn,
    reorderBoardColumns,
    updateBoardColumn,
    removeBoardColumn,

    roadmap,
    listMilestones,
    createMilestone,
    updateMilestone,
    reorderMilestones,
    changeMilestoneStatus,
    softDeleteMilestone,
    restoreMilestone,

    listEvents,
    createEvent,
    updateEvent,
    softDeleteEvent,
    restoreEvent,
  };
}
