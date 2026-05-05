import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        console.log("Auth Debug - User Data:", userData);
        console.log("Auth Debug - Role Check:", {
          userRole: userData.role,
          allowedRoles,
          mappedRoles: allowedRoles?.map(r => r.toUpperCase())
        });
        setUser(userData);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const token = localStorage.getItem("token");
  if (!token) {
    const loginPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (token && user && !user.is_verified && user.role.toUpperCase() !== "ADMIN" && location.pathname !== "/pending-verification") {
    return <Navigate to="/pending-verification" replace />;
  }

  if (user && allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(user.role.toUpperCase())) {
    // Redirect to their appropriate dashboard if they have the wrong role
    const defaultPath = 
      user.role.toUpperCase() === "ADMIN" ? "/admin" : 
      user.role.toUpperCase() === "FARMER" ? "/farmer" : 
      "/buyer";
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
}
