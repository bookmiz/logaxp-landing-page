import SiteAdminUsersWorkspace from "@/logaxp/components/admin/site-admin-users/SiteAdminUsersWorkspace";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function SiteAdminUserDetailsPage({ params }: PageProps) {
  const { userId } = await params;

  return (
    <div className="p-4 sm:p-6 xl:p-8">
      <SiteAdminUsersWorkspace initialSelectedUserId={userId} />
    </div>
  );
}
