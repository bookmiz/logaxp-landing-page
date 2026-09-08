import { OrgUnitDetailManager } from "@/logaxp/components/orgStructure/orgUnits/OrgUnitDetailManager";

export default async function OrgUnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrgUnitDetailManager orgUnitId={id} />;
}
