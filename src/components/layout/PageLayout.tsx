import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
interface PageLayoutProps {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: string;
  actionButton?: ReactNode;
}
const PageLayout = ({
  children,
  title,
  subtitle,
  actionButton
}: PageLayoutProps) => {
  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto md:ml-[70px] lg:ml-[250px]">
        <div className="uvu-container py-6 px-4 md:px-6 mt-14 md:mt-0">
          {(title || actionButton) && <div className={cn("flex items-center justify-between pb-6 mb-6 border-b dark:border-gray-800", subtitle ? "flex-col sm:flex-row items-start sm:items-center gap-2" : "")}>
              <div>
                {title && <h1 className="text-2xl md:text-3xl font-bold text-uvu-green dark:text-uvu-green-light animate-slide-up">
                    {title}
                  </h1>}
                {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1 animate-slide-up px-[48px]">
                    {subtitle}
                  </p>}
              </div>
              {actionButton && <div className="animate-fade-in mt-4 sm:mt-0">
                  {actionButton}
                </div>}
            </div>}
          
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>;
};
export default PageLayout;