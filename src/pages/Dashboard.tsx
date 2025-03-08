import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAlumni, mockOrganizations, mockFormSubmissions } from "@/data/mockData";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Users, Building2, FileText, Mail } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalOrganizations: 0,
    pendingSubmissions: 0,
    recentContacts: 0,
  });
  
  const [graduationData, setGraduationData] = useState<{ year: number; count: number }[]>([]);

  useEffect(() => {
    // Calculate stats
    const pendingSubmissions = mockFormSubmissions.filter(
      (submission) => submission.status === "pending"
    ).length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentContacts = mockAlumni.filter((alumni) => {
      if (!alumni.lastContactDate) return false;
      const contactDate = new Date(alumni.lastContactDate);
      return contactDate >= thirtyDaysAgo;
    }).length;
    
    setStats({
      totalAlumni: mockAlumni.length,
      totalOrganizations: mockOrganizations.length,
      pendingSubmissions,
      recentContacts,
    });
    
    // Prepare graduation year data
    const graduationYears = mockAlumni.map((alumni) => alumni.graduationYear);
    const yearsCount = graduationYears.reduce((acc, year) => {
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const chartData = Object.entries(yearsCount)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
    
    setGraduationData(chartData);
  }, []);

  return (
    <PageLayout 
      title="Dashboard" 
      subtitle="Welcome to FACET - Utah Valley University Alumni CRM"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="uvu-card card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alumni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-uvu-green mr-3" />
              <span className="text-3xl font-bold">{stats.totalAlumni}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="uvu-card card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-uvu-green mr-3" />
              <span className="text-3xl font-bold">{stats.totalOrganizations}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="uvu-card card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-uvu-green mr-3" />
              <span className="text-3xl font-bold">{stats.pendingSubmissions}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="uvu-card card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Contacts (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-uvu-green mr-3" />
              <span className="text-3xl font-bold">{stats.recentContacts}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="uvu-card">
          <CardHeader>
            <CardTitle>Alumni by Graduation Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graduationData}>
                  <XAxis 
                    dataKey="year" 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value} Alumni`, "Count"]}
                    labelFormatter={(label) => `Class of ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#176D38" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="uvu-card">
          <CardHeader>
            <CardTitle>Recent Form Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockFormSubmissions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((submission) => (
                  <div 
                    key={submission.id}
                    className="flex items-start p-3 rounded-md border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{submission.submittedByName}</span>
                        <span className="bg-uvu-green text-white text-xs px-2 py-0.5 rounded-full">
                          {submission.type.replace("-", " ")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full ${
                          submission.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : submission.status === "reviewed"
                            ? "bg-blue-100 text-blue-800"
                            : submission.status === "processed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
