"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import { useOnboarding } from "@/logaxp/hooks/useOnboarding";
import type { OnboardingTemplate } from "@/logaxp/lib/onboarding/onboarding.types";
import { unwrapApi } from "@/logaxp/components/onboarding/onboarding.utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Button } from "@/logaxp/components/ui/button";
import { toast } from "@/logaxp/components/ui/toast";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Badge } from "@/logaxp/components/ui/badge";

import { TemplateStepsManager } from "@/logaxp/components/onboarding/templates/TemplateStepsManager";

export default function OnboardingTemplateDetailPage() {
  const router = useRouter();
  const params = useParams<{ templateId: string }>();
  const templateId = params?.templateId;

  const { templates, loading } = useOnboarding();

  const [tpl, setTpl] = React.useState<OnboardingTemplate | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const load = React.useCallback(async (opts?: { silent?: boolean }) => {
    if (!templateId) return;

    try {
      const res = await templates.get(templateId);
      const data = unwrapApi(res);
      setTpl(data);
    } catch (e) {
      console.error(e);
      if (!opts?.silent) toast.error("Failed to load template");
    } finally {
      setInitialLoading(false);
    }
  }, [templates, templateId]);

  React.useEffect(() => {
    void load({ silent: true });
  }, [load]);

  if (initialLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">Loading template...</CardContent>
        </Card>
      </div>
    );
  }

  if (!tpl) {
    return (
      <div className="p-6">
        <EmptyState
          title="Template not found"
          description="This template might have been deleted or you don’t have access."
          action={<Button onClick={() => router.push("/portal/onboarding/templates")}>Back</Button>}
        />
      </div>
    );
  }

  const isActive = Boolean(tpl.isActive ?? true);

  return (
    <div className="space-y-4 p-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => router.push("/portal/onboarding/templates")}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                <Badge variant={isActive ? "success" : "muted"}>{isActive ? "ACTIVE" : "INACTIVE"}</Badge>
                {tpl.version ? (
                  <Badge variant="muted">v{String(tpl.version)}</Badge>
                ) : null}
              </div>

              <CardTitle className="text-xl">{tpl.name}</CardTitle>
              <CardDescription>
                {tpl.description ?? "Manage steps and structure for this onboarding template."}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void load()} disabled={loading}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <TemplateStepsManager templateId={tpl.id} />
    </div>
  );
}