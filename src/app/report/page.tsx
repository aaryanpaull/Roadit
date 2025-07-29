import ReportIssueForm from '@/components/report-issue-form';

export default function ReportPage() {
  return (
    <div className="h-full">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <h1 className="text-2xl font-bold font-headline">Report a Road Issue</h1>
      </header>
      <main className="p-4 md:p-8">
        <ReportIssueForm />
      </main>
    </div>
  );
}
