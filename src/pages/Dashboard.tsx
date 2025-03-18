
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, Building2, FileText, Mail, GraduationCap, Calendar, Briefcase, Award } from "lucide-react";
import { mockAlumni, mockOrganizations, mockFormSubmissions } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Link } from "react-router-dom";

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

    // Prepare employment sector data
    const sectors = mockAlumni.reduce((acc, alumni) => {
      const sector = alumni.currentEmployer?.industry || "Unknown";
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sectorData = Object.entries(sectors)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    setEmploymentData(sectorData);

    // Prepare recent activity
    const allActivity = [
      ...mockFormSubmissions.map(submission => ({
        type: 'form',
        date: new Date(submission.createdAt),
        title: `${submission.submittedByName} submitted a ${submission.type.replace('-', ' ')} form`,
        status: submission.status,
        id: submission.id
      })),
      ...mockAlumni
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
  }, []);

  const COLORS = ['#176D38', '#3F9A52', '#6ABE7A', '#97E1A2', '#C4F5C8'];

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
            <CardTitle>Alumni by Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
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
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
