
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, Building2, FileText, Home, Menu, X, FormInput } from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home
  }, 
  {
    title: "Alumni",
    href: "/alumni",
    icon: Users
  }, 
  {
    title: "Organizations",
    href: "/organizations",
    icon: Building2
  },
  {
    title: "Forms",
    href: "/forms",
    icon: FormInput
  },
  {
    title: "Form Submissions",
    href: "/form-submissions",
    icon: FileText
  }
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button - only visible on mobile */}
      {isMobile && (
        <button 
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 bg-uvu-green text-white p-2 rounded-md shadow-md"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "bg-uvu-green text-white flex flex-col transition-all duration-300 fixed top-0 left-0 h-screen z-40",
          isCollapsed ? "w-[70px]" : "w-[250px]",
          isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0",
          "shadow-lg"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-uvu-green-medium">
          {!isCollapsed && <h1 className="font-bold text-2xl animate-fade-in">FACET</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-uvu-green-medium" 
            onClick={() => {
              if (isMobile) {
                setIsMobileMenuOpen(false);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
          >
            {isMobile ? <X size={20} /> : (isCollapsed ? <Menu size={20} /> : <X size={20} />)}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.href}>
                <NavLink 
                  to={item.href} 
                  className={({isActive}) => cn(
                    "flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-uvu-green-medium",
                    isActive ? "bg-uvu-green-medium" : "transparent",
                    isCollapsed ? "justify-center" : ""
                  )}
                  onClick={closeMobileMenu}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-uvu-green-medium flex items-center">
          {/* Footer content if needed */}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
