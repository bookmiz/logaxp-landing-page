import { EmployeeAccessManager } from "@/logaxp/components/employees/EmployeeAccessManager";

export default async function EmployeeAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EmployeeAccessManager employeeId={id} />;
}
