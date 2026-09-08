import ChangePasswordPage from "@/logaxp/components/auth/ChangePasswordPage";

export default function SiteAdminChangePasswordRoute() {
  return (
    <ChangePasswordPage
      areaLabel="Site Admin"
      title="Change Password"
      subtitle="Update your site admin password to secure platform-level access."
      backHref="/site-admin/settings/security"
      cancelHref="/site-admin/settings/security"
      successRedirectHref="/site-admin/settings/security"
    />
  );
}