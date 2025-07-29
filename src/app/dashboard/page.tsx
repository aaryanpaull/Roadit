import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardClient from '@/components/dashboard-client';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b bg-card shrink-0">
        <h1 className="text-2xl font-bold font-headline">Issues Dashboard</h1>
        <Button asChild>
          <Link href="/report">
            <PlusCircle className="w-4 h-4 mr-2" />
            Report New Issue
          </Link>
        </Button>
      </header>
      <main className="flex-1 p-4 overflow-hidden">
        <DashboardClient />
      </main>
    </div>
  );
}
