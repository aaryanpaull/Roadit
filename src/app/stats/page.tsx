import StatsCharts from '@/components/stats-charts';
import { getIssues } from '@/lib/data';

export default function StatsPage() {
  const issues = getIssues();
  return (
    <div className="h-full">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <h1 className="text-2xl font-bold font-headline">Performance Metrics</h1>
      </header>
      <main className="p-4 md:p-8">
        <StatsCharts allIssues={issues} />
      </main>
    </div>
  );
}
