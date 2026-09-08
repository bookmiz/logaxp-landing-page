"use client";

import * as React from "react";
import {
  Save,
  X,
  Code2,
  Eye,
  Settings2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  FileJson,
  LayoutTemplate,
  ArrowLeftRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/logaxp/components/ui/dialog"; // ← shadcn dialog

import { Button } from "@/logaxp/components/ui/button";
import { Input } from "@/logaxp/components/ui/input";
import { Label } from "@/logaxp/components/ui/label";
import { Badge } from "@/logaxp/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/logaxp/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";
import { Switch } from "@/logaxp/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/logaxp/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/logaxp/components/ui/tooltip";

import type {
  ScheduleTemplate,
  CreateScheduleTemplateDto,
  UpdateScheduleTemplateDto,
  ScheduleTemplateType,
} from "@/logaxp/lib/scheduling/scheduleManagement.types";

import { WeeklyTemplateBuilder, type WeeklyTemplateRules } from "./WeeklyTemplateBuilder";
import { TemplatePreviewCard } from "./TemplatePreviewCard";
import { cn } from "@/logaxp/lib/cn"; 

type Mode = "create" | "edit";

export function TemplateCreateEditDialog({
  open,
  onOpenChange,
  mode,
  template,
  busy,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  template?: ScheduleTemplate | null;
  busy?: boolean;
  onCreate: (dto: CreateScheduleTemplateDto) => void | Promise<void>;
  onUpdate: (id: string, dto: UpdateScheduleTemplateDto) => void | Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<ScheduleTemplateType>("WEEKLY");
  const [isActive, setIsActive] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"builder" | "json">("builder");
  const [rules, setRules] = React.useState<WeeklyTemplateRules>({
    timezone: "America/Chicago",
    week: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
  });
  const [rulesJson, setRulesJson] = React.useState("");
  const [jsonError, setJsonError] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;
    setErrors({});
    setJsonError("");
    setActiveTab("builder");

    if (mode === "edit" && template) {
      setName(template.name ?? "");
      setType(template.type ?? "WEEKLY");
      setIsActive(!!template.isActive);

      const tz = (template.rules as any)?.timezone ?? "America/Chicago";
      const week = (template.rules as any)?.week ?? { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
      const newRules = { timezone: tz, week };
      setRules(newRules);
      setRulesJson(JSON.stringify({ timezone: tz, week }, null, 2));
    } else {
      setName("");
      setType("WEEKLY");
      setIsActive(true);
      const def = {
        timezone: "America/Chicago",
        week: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      };
      setRules(def);
      setRulesJson(JSON.stringify(def, null, 2));
    }
  }, [open, mode, template]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name required";
    if (activeTab === "json") {
      try { JSON.parse(rulesJson); } catch { errs.json = "Invalid JSON"; }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleJsonChange = (v: string) => {
    setRulesJson(v);
    try { JSON.parse(v); setJsonError(""); } catch { setJsonError("Invalid JSON"); }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    let finalRules = rules;
    if (activeTab === "json") {
      try { finalRules = rulesJson ? JSON.parse(rulesJson) : {}; } catch { return; }
    }

    if (mode === "create") {
      await onCreate({ name: name.trim(), type, isActive, rules: finalRules });
    } else if (template?.id) {
      await onUpdate(template.id, { name: name.trim(), type, isActive, rules: finalRules });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <LayoutTemplate className="size-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold leading-tight">
                {mode === "create" ? "Create Template" : "Edit Template"}
              </DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                {mode === "create"
                  ? "Define a reusable schedule pattern"
                  : template?.name ?? "Untitled"}
              </DialogDescription>
            </div>
            {mode === "edit" && template?.id && (
              <Badge variant="secondary" className="text-xs">
                ID: {template.id.slice(0, 8)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Basic Info */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="size-4 text-muted-foreground" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-sm">Name <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <LayoutTemplate className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Standard Work Week"
                    className={cn("pl-9", errors.name && "border-destructive")}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <Label className="text-sm">Type</Label>
                <Select value={type} onValueChange={v => setType(v as ScheduleTemplateType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" /> Weekly
                      </div>
                    </SelectItem>
                    <SelectItem value="ROTATING">
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className="size-4" /> Rotating
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label className="text-sm">Status</Label>
                <div className="flex h-10 items-center justify-between rounded-md border px-3 text-sm">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <Clock className="size-4 text-muted-foreground" />
                    )}
                    <span>{isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Rules</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs gap-1">
                <Globe className="size-3" /> {rules.timezone}
              </Badge>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="space-y-3">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="builder" className="text-sm">Builder</TabsTrigger>
                  <TabsTrigger value="json" className="text-sm">JSON</TabsTrigger>
                </TabsList>

                <TabsContent value="builder" className="mt-0">
                  <WeeklyTemplateBuilder value={rules} onChange={setRules} />
                </TabsContent>

                <TabsContent value="json" className="mt-0 space-y-3">
                  <div className="relative">
                    <div className="absolute right-2 top-2 z-10">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                try {
                                  const p = JSON.parse(rulesJson);
                                  setRulesJson(JSON.stringify(p, null, 2));
                                } catch {}
                              }}
                            >
                              Format
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Pretty print</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <textarea
                      value={rulesJson}
                      onChange={e => handleJsonChange(e.target.value)}
                      rows={12}
                      className={cn(
                        "w-full h-64 rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm resize-none",
                        jsonError && "border-destructive"
                      )}
                      placeholder={`{\n  "timezone": "America/Chicago",\n  "week": {\n    "mon": [...],\n    ...\n  }\n}`}
                    />
                  </div>
                  {jsonError && <p className="text-sm text-destructive">{jsonError}</p>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Optional: Preview – consider collapsible if too tall */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="size-4 text-muted-foreground" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TemplatePreviewCard rules={rules} />
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={busy || (activeTab === "json" && !!jsonError)}
            className="bg-emerald-600 hover:bg-emerald-700 min-w-32"
          >
            {busy ? (
              <>
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {mode === "create" ? "Creating…" : "Saving…"}
              </>
            ) : mode === "create" ? (
              "Create"
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}