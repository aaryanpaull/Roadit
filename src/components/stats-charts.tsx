'use client';
import type { Issue, IssueType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { differenceInDays } from 'date-fns';

type IssueTypeStats = {
  type: IssueType;
  registered: number;
  resolved: number;
};

type ResolutionTimeByType = {
    type: IssueType;
    'Average Time (Days)': number;
}

export default function StatsCharts({ allIssues }: { allIssues: Issue[] }) {
  const issueTypes: IssueType[] = ['Pothole', 'Waterlogging', 'Broken Road', 'Other'];

  const issueTypeData = issueTypes.map((type) => {
    const issuesOfType = allIssues.filter(i => i.type === type);
    const resolvedIssuesOfType = issuesOfType.filter(i => i.status === 'Resolved');
    return {
      type: type,
      registered: issuesOfType.length,
      resolved: resolvedIssuesOfType.length,
    };
  }) as IssueTypeStats[];

  const resolutionTimeData = issueTypes.map((type) => {
    const resolvedIssuesOfType = allIssues.filter(i => i.type === type && i.status === 'Resolved' && i.resolvedAt);
    if (resolvedIssuesOfType.length === 0) {
        return { type, 'Average Time (Days)': 0 };
    }
    const totalDays = resolvedIssuesOfType.reduce((acc, issue) => {
        return acc + differenceInDays(new Date(issue.resolvedAt!), new Date(issue.submittedAt));
    }, 0);
    return {
        type,
        'Average Time (Days)': Math.round(totalDays / resolvedIssuesOfType.length),
    };
  }) as ResolutionTimeByType[];


  const barChartConfig = {
    registered: { label: "Registered", color: "hsl(var(--chart-1))" },
    resolved: { label: "Resolved", color: "hsl(var(--chart-2))" },
  } satisfies import('./ui/chart').ChartConfig;

  const lineChartConfig = {
    "Average Time (Days)": { label: "Avg. Resolution Time", color: "hsl(var(--chart-3))" },
  } satisfies import('./ui/chart').ChartConfig;


  return (
    <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Registered vs. Resolved Issues</CardTitle>
          <CardDescription>Breakdown by issue type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <BarChart data={issueTypeData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="registered" fill="var(--color-registered)" radius={4} />
                <Bar dataKey="resolved" fill="var(--color-resolved)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Resolution Time by Type</CardTitle>
          <CardDescription>Average time in days to resolve an issue, by type.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
            <BarChart data={resolutionTimeData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="Average Time (Days)" fill="var(--color-Average Time (Days))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
