import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "./api/client";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const session = getSession();
  if (!session) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}