import ChangePasswordPage from "@/logaxp/components/auth/ChangePasswordPage";

export default function PortalChangePasswordRoute() {
  return (
    <ChangePasswordPage
      areaLabel="Portal"
      title="Change Password"
      subtitle="Update your password to keep your tenant workspace secure."
      backHref="/portal/settings/security"
      cancelHref="/portal/settings/security"
      successRedirectHref="/portal/settings/security"
    />
  );
}