"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Menu, Bell, UserRound, X } from "lucide-react";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { useAuth } from "@/logaxp/hooks/useAuth";
import { api } from "@/logaxp/lib/api/apiClient";
import { unwrapList } from "@/logaxp/lib/api/unwrap";
type Notification = {
  id: string;
  title: string;
  body?: string;
  status: string;
};
type HeaderProps = {
  title?: string;
  subtitle?: string;
  onOpenSidebar?: () => void;
};
export default function Header({
  title = "Dashboard",
  onOpenSidebar,
}: HeaderProps) {
  const [panel, setPanel] = useState<"notifications" | "account" | null>(null);
  const user = useAuthStore((s) => s.user);
  const employee = useAuthStore((s) => s.employee);
  const tenant = useAuthStore((s) => s.tenant);
  const membership = useAuthStore((s) => s.membership);
  const { logout, loading } = useAuth();
  const router = useRouter();
  const canRead = Boolean(
    user?.isSiteAdmin || membership?.permissions.includes("notifications.read"),
  );
  const notifications = useQuery({
    queryKey: ["header-notifications", tenant?.id, membership?.id],
    enabled: canRead && panel === "notifications",
    queryFn: async () =>
      unwrapList<Notification>(
        (await api.get("/notifications")).data,
      ).items.filter((n) => n.status !== "ARCHIVED"),
  });
  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => notifications.refetch(),
  });
  return (
    <header
      className="relative border-b bg-white px-4 py-3 text-slate-900"
      onKeyDown={(event) => {
        if (event.key === "Escape") setPanel(null);
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border p-2 md:hidden"
          aria-label="Open sidebar"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/portal" className="font-black">
          Loga<span className="text-lime-600">XP</span>
        </Link>
        <div className="min-w-0 flex-1 border-l pl-3">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-slate-500">{tenant?.name}</p>
        </div>
        {canRead && (
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={panel === "notifications"}
            onClick={() =>
              setPanel(panel === "notifications" ? null : "notifications")
            }
            className="rounded-lg border p-2"
          >
            <Bell className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          aria-label="User menu"
          aria-expanded={panel === "account"}
          onClick={() => setPanel(panel === "account" ? null : "account")}
          className="rounded-lg border p-2"
        >
          <UserRound className="h-5 w-5" />
        </button>
      </div>
      {panel && (
        <section
          aria-label={panel === "account" ? "Your account" : "Notifications"}
          className="absolute right-3 top-full z-50 mt-2 max-h-[70vh] w-[min(24rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border bg-white p-4 shadow-xl"
        >
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => setPanel(null)}
            className="float-right rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
          {panel === "account" ? (
            <>
              <h2 className="font-semibold">
                {employee?.firstName
                  ? `${employee.firstName} ${employee.lastName ?? ""}`
                  : "Your account"}
              </h2>
              <p className="break-all text-sm text-slate-500">{user?.email}</p>
              <Link
                className="my-4 block underline"
                href="/portal/settings/security/change-password"
                onClick={() => setPanel(null)}
              >
                Change password
              </Link>
              <button
                disabled={loading}
                onClick={async () => {
                  await logout();
                  router.replace("/admin/login");
                }}
                className="rounded-lg border px-3 py-2 disabled:opacity-50"
              >
                {loading ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <h2 className="font-semibold">Notifications</h2>
              {notifications.isPending && (
                <p role="status" className="mt-3 text-sm">
                  Loading notifications…
                </p>
              )}
              {notifications.isError && (
                <div role="alert" className="mt-3 text-sm">
                  Unable to load notifications.{" "}
                  <button
                    className="underline"
                    onClick={() => void notifications.refetch()}
                  >
                    Retry
                  </button>
                </div>
              )}
              {notifications.data?.length === 0 && (
                <p className="mt-3 text-sm text-slate-500">
                  You have no notifications.
                </p>
              )}
              {markRead.isError && (
                <p role="alert" className="text-sm text-red-700">
                  Could not mark this notification as read. Please try again.
                </p>
              )}
              <ul className="divide-y">
                {notifications.data?.map((n) => (
                  <li key={n.id} className="py-3">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-slate-500">{n.body}</p>
                    {n.status === "UNREAD" && (
                      <button
                        disabled={markRead.isPending}
                        onClick={() => markRead.mutate(n.id)}
                        className="mt-2 text-xs underline disabled:opacity-50"
                      >
                        Mark as read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </header>
  );
}
