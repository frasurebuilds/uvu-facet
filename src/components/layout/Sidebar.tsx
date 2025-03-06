
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  FileText, 
  Home,
  Menu,
  X
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Alumni",
    href: "/alumni",
    icon: Users,
  },
  {
    title: "Organizations",
    href: "/organizations",
    icon: Building2,
  },
  {
    title: "Form Submissions",
    href: "/form-submissions",
    icon: FileText,
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-uvu-green text-white h-screen flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-uvu-green-medium">
        {!isCollapsed && (
          <h1 className="font-bold text-2xl animate-fade-in">FACET</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-uvu-green-medium"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-uvu-green-medium",
                    isActive ? "bg-uvu-green-medium" : "transparent",
                    isCollapsed ? "justify-center" : ""
                  )
                }
              >
                <item.icon size={20} />
                {!isCollapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-uvu-green-medium flex items-center">
        <img
          src="/lovable-uploads/9f7e0c80-4ba0-4e4b-a293-620fa15d35f0.png"
          alt="UVU Logo"
          className={cn(
            "transition-all duration-300",
            isCollapsed ? "w-8" : "w-full max-w-[160px]"
          )}
        />
      </div>
    </div>
  );
};

export default Sidebar;
