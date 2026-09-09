"use client";

import * as React from "react";

import { api } from "@/logaxp/lib/api/apiClient";
import { unwrapApi } from "@/logaxp/lib/api/unwrap";
import {
  UserPlus,
  CheckCircle2,
  SkipForward,
  Ban,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import type { OnboardingStepInstance } from "@/logaxp/lib/onboarding/onboarding.types";
import { useOnboardingAccess } from "@/logaxp/components/onboarding/onboarding.access";

import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Textarea } from "@/logaxp/components/ui/textarea";
import { toast } from "@/logaxp/components/ui/toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/logaxp/components/ui/dialog";

type ActionKey =
  | "assign"
  | "complete"
  | "skip"
  | "block"
  | "unblock"
  | "upload"
  | null;

function upper(v: unknown) {
  return String(v ?? "").toUpperCase();
}

export function StepInstanceActionDialogs({
  stepInstance,
  busy,
  onDone,
}: {
  stepInstance: OnboardingStepInstance;
  busy?: boolean;
  onDone: () => void | Promise<void>;
}) {
  const { stepInstances } = useOnboarding();
  const access = useOnboardingAccess();

  const status = upper(stepInstance.status ?? "UNKNOWN");
  const isBlocked = status === "BLOCKED";
  const isDone = status === "DONE" || status === "COMPLETED";
  const isSkipped = status === "SKIPPED";
  const isTerminal = isDone || isSkipped; // (extend later if backend adds CANCELLED etc.)

  // ---- Dialog open state
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [completeOpen, setCompleteOpen] = React.useState(false);
  const [skipOpen, setSkipOpen] = React.useState(false);
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  // ---- Submitting state
  const [submitting, setSubmitting] = React.useState(false);
  const [submittingAction, setSubmittingAction] =
    React.useState<ActionKey>(null);

  // ---- Assign form
  const [assignedToUserId, setAssignedToUserId] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");

  // ---- Complete form
  const [completeNotes, setCompleteNotes] = React.useState("");
  const [completeDataJson, setCompleteDataJson] = React.useState<string>("{}");

  // ---- Skip form
  const [skipReason, setSkipReason] = React.useState("");

  // ---- Block form
  const [blockReason, setBlockReason] = React.useState("");

  // ---- Upload form (fileId from your file system)
  const [fileId, setFileId] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const submittingRef = React.useRef(false);
  const [title, setTitle] = React.useState("");

  const hardDisabled = Boolean(busy) || submitting;

  // ---- RBAC gating
  const canMutateStep = access.canWriteStepInstances;
  const canUpload = access.canUploadFiles && canMutateStep; // typically you want both

  // ---- Status gating (enterprise)
  const canAssign = canMutateStep && !isTerminal; // you can still assign blocked steps if you want; leave as is
  const canComplete = canMutateStep && !isTerminal && !isBlocked;
  const canSkip = canMutateStep && !isTerminal && !isBlocked;
  const canBlock = canMutateStep && !isTerminal && !isBlocked;
  const canUnblock = canMutateStep && isBlocked && !isTerminal;
  const canAttachDoc = canUpload && !isTerminal; // allow attaching docs while active

  const run = async (action: ActionKey, fn: () => Promise<void>) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      setSubmitting(true);
      setSubmittingAction(action);
      await fn();
      await onDone();
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error ? e.message : "Unable to save. Please try again.",
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
      setSubmittingAction(null);
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <Button
        variant="outline"
        size="sm"
        disabled={hardDisabled || !canAssign}
        title={
          !canAssign ? "You don't have access to assign this step." : undefined
        }
        onClick={() => setAssignOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        Assign
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={hardDisabled || !canComplete}
        title={
          !canMutateStep
            ? "You don't have access to complete steps."
            : isBlocked
              ? "Unblock this step first."
              : isTerminal
                ? "This step is already completed/skipped."
                : undefined
        }
        onClick={() => setCompleteOpen(true)}
      >
        <CheckCircle2 className="h-4 w-4" />
        Complete
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={hardDisabled || !canSkip}
        title={
          !canMutateStep
            ? "You don't have access to skip steps."
            : isBlocked
              ? "Unblock this step first."
              : isTerminal
                ? "This step is already completed/skipped."
                : undefined
        }
        onClick={() => setSkipOpen(true)}
      >
        <SkipForward className="h-4 w-4" />
        Skip
      </Button>

      {!isBlocked ? (
        <Button
          variant="outline"
          size="sm"
          disabled={hardDisabled || !canBlock}
          title={
            !canMutateStep
              ? "You don't have access to block steps."
              : isTerminal
                ? "This step is already completed/skipped."
                : undefined
          }
          onClick={() => setBlockOpen(true)}
        >
          <Ban className="h-4 w-4" />
          Block
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={hardDisabled || !canUnblock}
          title={
            !canUnblock ? "You don't have access to unblock steps." : undefined
          }
          loading={submittingAction === "unblock"}
          onClick={() =>
            void run("unblock", async () => {
              await stepInstances.unblock(stepInstance.id);
              toast.success("Step unblocked");
            })
          }
        >
          <ShieldCheck className="h-4 w-4" />
          Unblock
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={hardDisabled || !canAttachDoc}
        title={
          !access.canUploadFiles
            ? "You don't have file upload access."
            : !canMutateStep
              ? "You don't have access to attach documents."
              : isTerminal
                ? "This step is completed/skipped."
                : undefined
        }
        onClick={() => setUploadOpen(true)}
      >
        <UploadCloud className="h-4 w-4" />
        Upload doc
      </Button>

      {/* ASSIGN */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Assign Step</DialogTitle>
            <DialogDescription>
              Assign this step to a user and optionally set a due date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              label="assignedToUserId (optional)"
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              placeholder="userId..."
              disabled={hardDisabled || !canAssign}
            />
            <Input
              label="dueAt (optional ISO)"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              placeholder="2026-02-26T12:00:00.000Z"
              hint="Leave blank if not needed"
              disabled={hardDisabled || !canAssign}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              disabled={hardDisabled || !canAssign}
              loading={submittingAction === "assign"}
              onClick={() =>
                void run("assign", async () => {
                  await stepInstances.assign(stepInstance.id, {
                    assignedToUserId: assignedToUserId.trim() || null,
                    dueAt: dueAt.trim() || null,
                  });

                  toast.success("Step assigned");
                  setAssignOpen(false);
                  setAssignedToUserId("");
                  setDueAt("");
                })
              }
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COMPLETE */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="sm:max-w-[860px]">
          <DialogHeader>
            <DialogTitle>Complete Step</DialogTitle>
            <DialogDescription>
              Mark this step as completed and optionally attach notes / JSON
              data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              label="Notes (optional)"
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="Completion notes..."
              resize="y"
              size="md"
              disabled={hardDisabled || !canComplete}
            />

            <Textarea
              label="Data JSON (optional)"
              value={completeDataJson}
              onChange={(e) => setCompleteDataJson(e.target.value)}
              className="min-h-[160px] font-mono text-xs"
              resize="y"
              hint='Example: { "approved": true, "docId": "..." }'
              disabled={hardDisabled || !canComplete}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              disabled={hardDisabled || !canComplete}
              loading={submittingAction === "complete"}
              onClick={() =>
                void run("complete", async () => {
                  let data: unknown = undefined;

                  const txt = completeDataJson.trim();
                  if (txt && txt !== "{}") {
                    try {
                      data = JSON.parse(txt);
                    } catch {
                      toast.error("Data JSON is invalid");
                      return;
                    }
                  }

                  await stepInstances.complete(stepInstance.id, {
                    notes: completeNotes.trim() || null,
                    ...(typeof data !== "undefined" ? { data } : {}),
                  });

                  toast.success("Step completed");
                  setCompleteOpen(false);
                  setCompleteNotes("");
                  setCompleteDataJson("{}");
                })
              }
            >
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SKIP */}
      <Dialog open={skipOpen} onOpenChange={setSkipOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Skip Step</DialogTitle>
            <DialogDescription>
              Skip this step (optionally provide a reason for audit).
            </DialogDescription>
          </DialogHeader>

          <Textarea
            label="Reason (optional)"
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            placeholder="Reason..."
            resize="y"
            size="md"
            disabled={hardDisabled || !canSkip}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSkipOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              disabled={hardDisabled || !canSkip}
              loading={submittingAction === "skip"}
              onClick={() =>
                void run("skip", async () => {
                  await stepInstances.skip(stepInstance.id, {
                    reason: skipReason.trim() || null,
                  });
                  toast.success("Step skipped");
                  setSkipOpen(false);
                  setSkipReason("");
                })
              }
            >
              Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BLOCK */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Block Step</DialogTitle>
            <DialogDescription>
              Block this step (must provide a reason).
            </DialogDescription>
          </DialogHeader>

          <Textarea
            label="Reason (required)"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Why is this blocked?"
            resize="y"
            size="md"
            disabled={hardDisabled || !canBlock}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlockOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={hardDisabled || !canBlock}
              loading={submittingAction === "block"}
              onClick={() =>
                void run("block", async () => {
                  if (!blockReason.trim()) {
                    toast.error("Reason is required");
                    return;
                  }
                  await stepInstances.block(stepInstance.id, {
                    reason: blockReason.trim(),
                  });
                  toast.success("Step blocked");
                  setBlockOpen(false);
                  setBlockReason("");
                })
              }
            >
              Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UPLOAD DOC */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Attach Step Document</DialogTitle>
            <DialogDescription>
              Choose a PDF or image to attach to this onboarding task. Maximum
              size: 10 MB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              label="Document"
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
                setFileId("");
              }}
              disabled={hardDisabled || !canAttachDoc}
            />
            <Input
              label="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Passport / ID Card..."
              disabled={hardDisabled || !canAttachDoc}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              disabled={hardDisabled || !canAttachDoc}
              loading={submittingAction === "upload"}
              onClick={() =>
                void run("upload", async () => {
                  let attachmentId = fileId;
                  if (!attachmentId && selectedFile) {
                    if (
                      selectedFile.size > 10 * 1024 * 1024 ||
                      !["application/pdf", "image/png", "image/jpeg"].includes(
                        selectedFile.type,
                      )
                    )
                      throw new Error(
                        "Choose a PDF, PNG or JPEG no larger than 10 MB.",
                      );
                    const form = new FormData(); form.append('file', selectedFile);
                    const registered = unwrapApi<{ id: string }>((await api.post('/files/private', form, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    })).data);
                    if (!registered?.id)
                      throw new Error(
                        "The file could not be saved. Please try again.",
                      );
                    attachmentId = registered.id;
                    setFileId(attachmentId);
                  }
                  if (!attachmentId) {
                    toast.error("Choose a document first.");
                    return;
                  }
                  await stepInstances.upload(stepInstance.id, {
                    fileId: attachmentId,
                    title: title.trim() || null,
                  });
                  toast.success("Document attached to step");
                  setUploadOpen(false);
                  setFileId("");
                  setSelectedFile(null);
                  setTitle("");
                })
              }
            >
              Attach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
