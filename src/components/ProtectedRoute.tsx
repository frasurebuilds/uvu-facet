
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Make sure we're correctly identifying public form routes
  const isPublicFormRoute = location.pathname.startsWith('/public-form/') || 
                           location.pathname.startsWith('/form-submitted/');
                           
  console.log("ProtectedRoute checking path:", location.pathname, "isPublicFormRoute:", isPublicFormRoute);
                           
  if (isPublicFormRoute) {
    // Completely bypass authentication for public form routes
    console.log("Bypassing authentication for public form route");
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-uvu-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("User not authenticated, redirecting to auth page");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
