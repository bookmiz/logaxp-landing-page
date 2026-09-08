import ChangePasswordPage from "@/logaxp/components/auth/ChangePasswordPage";

export default function SiteAdminChangePasswordRoute() {
  return (
    <ChangePasswordPage
      areaLabel="Site Admin"
      title="Change Password"
      subtitle="Update your site admin password to secure platform-level access."
      backHref="/site-admin/security"
      cancelHref="/site-admin/security"
      successRedirectHref="/site-admin/security"
    />
  );
}