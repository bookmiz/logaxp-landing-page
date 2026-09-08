import { CostCenterDetailManager } from "@/logaxp/components/orgStructure/costCenters/CostCenterDetailManager";

export default async function CostCenterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CostCenterDetailManager costCenterId={id} />;
}
