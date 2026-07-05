import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/admin/auth/AuthContext";
import type { PermissionKey } from "@/admin/api/settings";
import type { UserRole } from "@/admin/api/settings";

interface RequireAuthProps {
  children: React.ReactNode;
  permission?: PermissionKey;
  roles?: UserRole[];
}

export function RequireAuth({ children, permission, roles }: RequireAuthProps) {
  const loc = useLocation();
  const { session, profile, loading, hasPermission, hasRole, role, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;

  // Deactivated account — force sign out and back to login with a message.
  if (profile && profile.active === false) {
    void signOut();
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname, deactivated: true }} />;
  }

  // No role assigned yet — user signed up but no admin has granted access.
  if (!role) {
    return <NoAccess reason="pending" onSignOut={() => void signOut()} />;
  }
  if (roles && !hasRole(...roles)) {
    return <NoAccess reason="role" onSignOut={() => void signOut()} />;
  }
  if (permission && !hasPermission(permission)) {
    return <NoAccess reason="permission" onSignOut={() => void signOut()} />;
  }
  return <>{children}</>;
}

function NoAccess({ reason, onSignOut }: { reason: "pending" | "role" | "permission"; onSignOut: () => void }) {
  const copy =
    reason === "pending"
      ? "Your account is awaiting role assignment by an administrator."
      : reason === "role"
      ? "Your role doesn't have access to this section."
      : "You don't have permission to view this module.";
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Access restricted</h1>
        <p className="text-sm text-muted-foreground">{copy}</p>
        <button onClick={onSignOut} className="text-sm text-primary hover:underline">Sign out</button>
      </div>
    </div>
  );
}