
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Building2, LayoutDashboard, FileText, ClipboardList, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "/lovable-uploads/9f7e0c80-4ba0-4e4b-a293-620fa15d35f0.png";

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const {
    signOut,
    user
  } = useAuth();
  const {
    toast
  } = useToast();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar when ESC key is pressed
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Prevent scrolling when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out"
    });
  };
  
  const navItems = [{
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    href: "/"
  }, {
    name: "Alumni",
    icon: <Users size={20} />,
    href: "/alumni"
  }, {
    name: "Organizations",
    icon: <Building2 size={20} />,
    href: "/organizations"
  }, {
    name: "Forms",
    icon: <ClipboardList size={20} />,
    href: "/forms"
  }, {
    name: "Form Submissions",
    icon: <FileText size={20} />,
    href: "/form-submissions"
  }];

  // Generate NavLink components
  const NavLink = ({
    item
  }: {
    item: typeof navItems[0];
  }) => {
    const isActive = location.pathname === item.href;
    return <Tooltip>
        <TooltipTrigger asChild>
          <Link to={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md transition-colors", 
            "hover:bg-accent dark:hover:bg-gray-800", 
            isActive ? "bg-accent dark:bg-gray-800 text-uvu-green dark:text-uvu-green-light font-medium" : 
            "text-gray-700 dark:text-gray-200")}>
            <span className="text-uvu-green dark:text-uvu-green-light">{item.icon}</span>
            <span className={cn("lg:block", isMobile ? "block" : "hidden")}>
              {item.name}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="lg:hidden">
          {item.name}
        </TooltipContent>
      </Tooltip>;
  };
  
  return <>
      {/* Mobile Menu Button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-3 md:hidden">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </Button>
          <img src={logo} alt="UVU Logo" className="h-8" />
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut size={20} />
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r dark:border-gray-800 z-50", 
        "transition-all duration-300 ease-in-out", 
        "md:w-[70px] md:translate-x-0 md:block", 
        "lg:w-[250px]", 
        isMobile ? isOpen ? "w-[250px] translate-x-0" : "w-[250px] -translate-x-full" : "")}>
        {/* Close button for mobile */}
        {isMobile && <Button variant="ghost" size="icon" className="absolute top-4 right-4 md:hidden" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </Button>}

        {/* Logo and Branding */}
        <div className="p-4 flex flex-col items-center lg:items-start">
          <div className="text-center lg:text-left">
            <h2 className="font-bold text-uvu-green dark:text-uvu-green-light text-lg">FACET</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden lg:block">
              UVU Alumni CRM
            </p>
          </div>
        </div>

        {/* Nav Items */}
        <div className="px-3 py-4 space-y-1">
          {navItems.map(item => <NavLink key={item.name} item={item} />)}
        </div>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-800">
          {/* Theme Toggle */}
          <div className="mb-4 flex justify-center lg:justify-start">
            <ThemeToggle />
          </div>
          
          <div className="flex items-center gap-3 mb-3 hidden lg:flex">
            <div className="w-8 h-8 rounded-full bg-uvu-green dark:bg-uvu-green-light text-white flex items-center justify-center text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate dark:text-gray-200">{user?.email}</p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleSignOut} className={cn("w-full flex items-center justify-center gap-2", "lg:justify-start")}>
                <LogOut size={18} />
                <span className={cn("lg:block", isMobile ? "block" : "hidden")}>
                  Sign Out
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              Sign Out
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </>;
};

export default Sidebar;
