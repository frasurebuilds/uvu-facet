
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, Building2, FileText, Mail, GraduationCap, Calendar, Briefcase, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAlumni, fetchOrganizations, fetchFormSubmissions, fetchJobHistoryByAlumniId } from "@/lib/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalOrganizations: 0,
    pendingSubmissions: 0,
    recentContacts: 0,
  });
  
  const [graduationData, setGraduationData] = useState<{ year: number; count: number }[]>([]);
  const [employmentData, setEmploymentData] = useState<{ name: string; value: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch data using React Query
  const { data: alumniData, isLoading: alumniLoading } = useQuery({
    queryKey: ['alumni'],
    queryFn: fetchAlumni
  });

  const { data: organizationsData, isLoading: organizationsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations
  });

  const { data: formSubmissionsData, isLoading: formSubmissionsLoading } = useQuery({
    queryKey: ['formSubmissions'],
    queryFn: fetchFormSubmissions
  });

  // We're not fetching job history for all alumni here as that would be inefficient
  // Instead, we'll fetch it on demand for the industry chart

  useEffect(() => {
    if (alumniLoading || organizationsLoading || formSubmissionsLoading) return;

    if (alumniData && organizationsData && formSubmissionsData) {
      // Calculate stats
      const pendingSubmissions = formSubmissionsData.filter(
        (submission) => submission.status === "pending"
      ).length;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentContacts = alumniData.filter((alumni) => {
        if (!alumni.lastContactDate) return false;
        const contactDate = new Date(alumni.lastContactDate);
        return contactDate >= thirtyDaysAgo;
      }).length;
      
      setStats({
        totalAlumni: alumniData.length,
        totalOrganizations: organizationsData.length,
        pendingSubmissions,
        recentContacts,
      });
      
      // Prepare graduation year data
      const graduationYears = alumniData.map((alumni) => alumni.graduationYear);
      const yearsCount = graduationYears.reduce((acc, year) => {
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      const chartData = Object.entries(yearsCount)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => a.year - b.year);
      
      setGraduationData(chartData);

      // Prepare employment sector data
      // This is more complex with real data as we need to fetch job history for each alumni
      // For now, we'll use a simplified approach
      const industryPromises = alumniData.map(async (alumni) => {
        try {
          const jobHistory = await fetchJobHistoryByAlumniId(alumni.id);
          const currentJob = jobHistory.find(job => job.isCurrent);
          if (currentJob && currentJob.organizationId) {
            const org = organizationsData.find(org => org.id === currentJob.organizationId);
            return org ? org.industry : "Unknown";
          }
          return "Unknown";
        } catch (error) {
          console.error(`Error fetching job history for alumni ${alumni.id}:`, error);
          return "Unknown";
        }
      });

      // Wait for all industry data to be fetched
      Promise.all(industryPromises).then(industries => {
        // Count industries
        const industriesCount = industries.reduce((acc, industry) => {
          acc[industry] = (acc[industry] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sectorData = Object.entries(industriesCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        
        setEmploymentData(sectorData);
      });

      // Prepare recent activity
      const allActivity = [
        ...formSubmissionsData.map(submission => ({
          type: 'form',
          date: new Date(submission.createdAt),
          title: `${submission.submittedByName} submitted a ${submission.type.replace('-', ' ')} form`,
          status: submission.status,
          id: submission.id
        })),
        ...alumniData
          .filter(alumni => alumni.lastContactDate)
          .map(alumni => ({
            type: 'contact',
            date: new Date(alumni.lastContactDate!),
            title: `Contact made with ${alumni.firstName} ${alumni.lastName}`,
            id: alumni.id
          }))
      ];

      const recentActivityData = allActivity
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10);
      
      setRecentActivity(recentActivityData);
    }
  }, [alumniData, organizationsData, formSubmissionsData, alumniLoading, organizationsLoading, formSubmissionsLoading]);

  const COLORS = ['#176D38', '#3F9A52', '#6ABE7A', '#97E1A2', '#C4F5C8'];

  // Show loading state when data is being fetched
  if (alumniLoading || organizationsLoading || formSubmissionsLoading) {
    return (
      <PageLayout 
        title="Dashboard" 
        subtitle="Loading data..."
      >
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-uvu-green"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Dashboard" 
      subtitle="Welcome to FACET - Utah Valley University Alumni CRM"
      actionButton={
        <Link to="/alumni">
          <Button className="bg-uvu-green">
            <Users className="mr-2 h-4 w-4" />
            View Alumni
          </Button>
        </Link>
      }
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
              <GraduationCap className="h-8 w-8 text-uvu-green mr-3" />
              <span className="text-3xl font-bold">{stats.totalAlumni}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Registered alumni in our database
            </p>
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
            <p className="text-xs text-muted-foreground mt-2">
              Partner organizations employing alumni
            </p>
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
            <p className="text-xs text-muted-foreground mt-2">
              Form submissions awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card className="uvu-card card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-uvu-green mr-3" />
              <span className="text-3xl font-bold">{stats.recentContacts}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Alumni contacted in the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="uvu-card">
          <CardHeader>
            <CardTitle>Alumni by Graduation Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {graduationData.length > 0 ? (
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
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No graduation data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="uvu-card">
          <CardHeader>
            <CardTitle>Alumni by Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {employmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employmentData.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {employmentData.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} Alumni`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No industry data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="uvu-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link to="/form-submissions">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={`${activity.type}-${activity.id}-${index}`}
                    className="flex items-start p-3 rounded-md border"
                  >
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {activity.type === 'form' ? (
                        <FileText className="h-5 w-5 text-uvu-green" />
                      ) : (
                        <Mail className="h-5 w-5 text-uvu-green" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{activity.title}</span>
                        {activity.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            activity.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : activity.status === "reviewed"
                              ? "bg-blue-100 text-blue-800"
                              : activity.status === "processed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activity.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
