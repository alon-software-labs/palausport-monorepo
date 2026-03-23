import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface ClientRouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Guards reservation app routes: employees see an error (this app is for clients only).
 * Optionally requires auth for protected content.
 */
export function ClientRouteGuard({ children, requireAuth = true }: ClientRouteGuardProps) {
  const { currentUser, userRole, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // Require auth for protected content
    if (requireAuth && !currentUser && userRole !== "employee") {
      navigate("/login", { replace: true });
    }
  }, [isLoading, userRole, currentUser, requireAuth, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (userRole === "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-4">
          <div className="space-y-2">
            <p className="text-destructive font-medium">Access denied</p>
            <p className="text-muted-foreground text-sm">
              This app is for clients only. Your account has an employee role. Please use your employee credentials in the appropriate system.
            </p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </div>
    );
  }

  if (requireAuth && !currentUser) {
    return null;
  }

  return <>{children}</>;
}
