"use client";

import { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, Clock3, Layers3, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  recent_discovery_24h?: number;
}

const PAGE_SIZE = 15;

const JOB_STATUSES = ["NEW", "APPLIED", "SKIP", "INTERVIEW", "REJECTED"] as const;

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentDiscoveryCount, setRecentDiscoveryCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

  const getApiUrl = useCallback((path: string) => {
    if (apiBaseUrl) return `${apiBaseUrl}${path}`;
    return `/api/mana-uang${path}`;
  }, [apiBaseUrl]);

  const loadDashboard = useCallback(async () => {
    const offset = (page - 1) * PAGE_SIZE;
    const [jobsRes, analyticsRes] = await Promise.all([
      fetch(getApiUrl(`/api/jobs?limit=${PAGE_SIZE}&offset=${offset}`)),
      fetch(getApiUrl("/api/analytics")),
    ]);
    const jobsData = await jobsRes.json();
    const analyticsData = (await analyticsRes.json()) as Analytics;

    const list = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];
    setJobs(list);
    const total =
      typeof jobsData.total === "number" ? jobsData.total : list.length;
    setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));

    setAnalytics(analyticsData);
    setRecentDiscoveryCount(
      typeof analyticsData.recent_discovery_24h === "number"
        ? analyticsData.recent_discovery_24h
        : list.filter(
            (job: Job) =>
              new Date(job.discovered_at).getTime() >
              Date.now() - 24 * 60 * 60 * 1000,
          ).length,
    );
  }, [getApiUrl, page]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadDashboard()
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadDashboard]);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/jobs/${jobId}/status`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.job_id === jobId ? { ...job, status: newStatus } : job,
          ),
        );
        const analyticsRes = await fetch(getApiUrl("/api/analytics"));
        const analyticsData = (await analyticsRes.json()) as Analytics;
        setAnalytics(analyticsData);
        setRecentDiscoveryCount(
          typeof analyticsData.recent_discovery_24h === "number"
            ? analyticsData.recent_discovery_24h
            : 0,
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getPlatformColor = (platform: string) => {
    if (platform.toLowerCase() === "linkedin")
      return "border-0 bg-sky-100 text-sky-800";
    if (platform.toLowerCase() === "glints")
      return "border-0 bg-rose-100 text-rose-800";
    return "border-0 bg-stone-200 text-stone-700";
  };

  if (loading)
    return (
      <div className="p-8 text-center text-base text-muted-foreground">
        Loading dashboard...
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {analytics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                Platform Distribution
              </CardTitle>
              <div className="rounded-full bg-violet-100 p-2 text-violet-700">
                <BriefcaseBusiness className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {analytics.platform.labels.map((label, i) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <Badge variant="secondary" className="bg-muted text-foreground">
                    {analytics.platform.data[i]} jobs
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                Application Status
              </CardTitle>
              <div className="rounded-full bg-amber-100 p-2 text-amber-800">
                <Layers3 className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {analytics.status.labels.map((label, i) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {analytics.status.data[i]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                Recent Discovery
              </CardTitle>
              <div className="rounded-full bg-sky-100 p-2 text-sky-800">
                <Clock3 className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {recentDiscoveryCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                New jobs in the last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Job Opportunities</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border/60 hover:bg-transparent">
                  <TableHead className="px-3">Date</TableHead>
                  <TableHead className="px-3">Platform</TableHead>
                  <TableHead className="px-3">Company</TableHead>
                  <TableHead className="w-[340px] px-3">Title</TableHead>
                  <TableHead className="px-3">Status</TableHead>
                  <TableHead className="px-3 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.job_id}
                    className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/45"
                  >
                    <TableCell className="px-3">
                      {job.discovered_at.substring(0, 10)}
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge className={getPlatformColor(job.platform)}>
                        {job.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 font-medium">
                      {job.company}
                    </TableCell>
                    <TableCell className="px-3">{job.title}</TableCell>
                    <TableCell className="px-3">
                      <Select
                        value={job.status}
                        onValueChange={(val) => {
                          if (!val || val === job.status) return;
                          handleStatusChange(job.job_id, val);
                        }}
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-8 min-w-[140px] rounded-xl border-border/80 px-3 font-normal shadow-none hover:bg-muted/40"
                        >
                          <Pencil className="size-4 shrink-0 text-muted-foreground" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {(JOB_STATUSES.includes(
                            job.status as (typeof JOB_STATUSES)[number],
                          )
                            ? JOB_STATUSES
                            : [...JOB_STATUSES, job.status]
                          ).map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-border/80"
                        onClick={() =>
                          window.open(job.link, "_blank", "noopener,noreferrer")
                        }
                      >
                        View
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
  );
}
