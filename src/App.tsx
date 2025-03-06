
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AlumniPage from "./pages/AlumniPage";
import AlumniDetailPage from "./pages/AlumniDetailPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import OrganizationDetailPage from "./pages/OrganizationDetailPage";
import FormSubmissionsPage from "./pages/FormSubmissionsPage";
import FormsPage from "./pages/FormsPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/alumni" element={<ProtectedRoute><AlumniPage /></ProtectedRoute>} />
            <Route path="/alumni/:id" element={<ProtectedRoute><AlumniDetailPage /></ProtectedRoute>} />
            <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
            <Route path="/organizations/:id" element={<ProtectedRoute><OrganizationDetailPage /></ProtectedRoute>} />
            <Route path="/forms" element={<ProtectedRoute><FormsPage /></ProtectedRoute>} />
            <Route path="/form-submissions" element={<ProtectedRoute><FormSubmissionsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
