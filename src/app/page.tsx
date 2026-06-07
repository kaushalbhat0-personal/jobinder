import Link from 'next/link';
import { Button } from '@/shared/ui/atoms';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-heading-lg">JOBinder</h1>
        <p className="text-body-md text-neutral-500">AI-powered career platform</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Button asChild size="lg" fullWidth>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild variant="outline" size="lg" fullWidth>
          <Link href="/signup">Create Account</Link>
        </Button>
      </div>
    </main>
  );
}
