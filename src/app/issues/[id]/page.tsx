import { getIssues } from '@/lib/data';
import IssueDetails from '@/components/issue-details';
import { notFound } from 'next/navigation';

export default function IssuePage({ params }: { params: { id: string } }) {
  const issues = getIssues();
  const issue = issues.find((i) => i.id === params.id);

  if (!issue) {
    notFound();
  }

  return (
    <div className="h-full">
         <header className="flex items-center justify-between p-4 border-b bg-card">
            <h1 className="text-2xl font-bold font-headline">Issue Details</h1>
        </header>
        <main className="p-4 md:p-8">
             <IssueDetails issue={issue} />
        </main>
    </div>
  );
}
