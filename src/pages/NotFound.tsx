
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <h1 className="text-6xl font-bold text-uvu-green mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Button asChild className="bg-uvu-green hover:bg-uvu-green-medium">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
