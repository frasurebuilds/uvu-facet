
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AlumniPage from "./pages/AlumniPage";
import AlumniDetailPage from "./pages/AlumniDetailPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import OrganizationDetailPage from "./pages/OrganizationDetailPage";
import FormSubmissionsPage from "./pages/FormSubmissionsPage";
import FormsPage from "./pages/FormsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alumni" element={<AlumniPage />} />
          <Route path="/alumni/:id" element={<AlumniDetailPage />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/form-submissions" element={<FormSubmissionsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
