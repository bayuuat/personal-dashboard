"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Job {
  job_id: string;
  title: string;
  company: string;
  platform: string;
  link: string;
  tags: string;
  status: string;
  discovered_at: string;
}

interface Analytics {
  platform: { labels: string[]; data: number[] };
  status: { labels: string[]; data: number[] };
  trend: { labels: string[]; data: number[] };
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper untuk mendapatkan URL API secara dinamis berdasarkan IP browser saat ini (misal localhost atau Tailscale IP)
  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `http://${window.location.hostname}:8088${path}`;
    }
    return `http://localhost:8088${path}`;
  };

  const fetchData = async () => {
    try {
      const [jobsRes, analyticsRes] = await Promise.all([
        fetch(getApiUrl("/api/jobs")),
        fetch(getApiUrl("/api/analytics")),
      ]);
      const jobsData = await jobsRes.json();
      const analyticsData = await analyticsRes.json();
      
      setJobs(jobsData.jobs || []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/jobs/${jobId}/status`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        // Update local state
        setJobs(jobs.map(job => job.job_id === jobId ? { ...job, status: newStatus } : job));
        // Refresh analytics
        const analyticsRes = await fetch(getApiUrl("/api/analytics"));
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getPlatformColor = (platform: string) => {
    if (platform.toLowerCase() === 'linkedin') return "bg-blue-600 hover:bg-blue-700";
    if (platform.toLowerCase() === 'glints') return "bg-red-600 hover:bg-red-700";
    return "bg-gray-600";
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Job Sniper Dashboard</h1>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.platform.labels.map((label, i) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="font-medium">{label}</span>
                      <Badge variant="secondary">{analytics.platform.data[i]} jobs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.status.labels.map((label, i) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="font-medium">{label}</span>
                      <span className="text-2xl font-bold">{analytics.status.data[i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Recent Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {jobs.filter(j => new Date(j.discovered_at) > new Date(Date.now() - 24*60*60*1000)).length}
                </div>
                <p className="text-xs text-slate-500 mt-1">New jobs in the last 24 hours</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Job Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.slice(0, 50).map((job) => ( // Pagination handled later or simple slice for now
                    <TableRow key={job.job_id}>
                      <TableCell className="whitespace-nowrap">{job.discovered_at.substring(0, 10)}</TableCell>
                      <TableCell>
                        <Badge className={getPlatformColor(job.platform)}>{job.platform}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{job.company}</TableCell>
                      <TableCell>{job.title}</TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={job.status} 
                          onValueChange={(val) => handleStatusChange(job.job_id, val)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">NEW</SelectItem>
                            <SelectItem value="APPLIED">APPLIED</SelectItem>
                            <SelectItem value="SKIP">SKIP</SelectItem>
                            <SelectItem value="INTERVIEW">INTERVIEW</SelectItem>
                            <SelectItem value="REJECTED">REJECTED</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild={true}>
                          <a href={job.link} target="_blank" rel="noopener noreferrer">View</a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}