
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Header } from '@/components/dashboard/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/50">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
