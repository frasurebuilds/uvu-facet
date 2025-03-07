
import { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import FormBuilder from "@/components/forms/FormBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const FormCreatePage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <PageLayout
      title="Create Form"
      subtitle="Build a new form for alumni and organizations"
    >
      <FormBuilder />
    </PageLayout>
  );
};

export default FormCreatePage;
