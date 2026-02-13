import { ApplicationsList } from "@/components/applications-list";
import { Suspense } from "react";
import Link from "next/link";

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default function Home({ searchParams }: HomeProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto">
          <div className="flex h-14 items-center px-4">
            <Link href="/" className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer">
              SVIX Console
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <Suspense fallback={
          <div className="w-full space-y-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
            </div>
            <div className="h-24 flex items-center justify-center">
              Loading applications...
            </div>
          </div>
        }>
          <ApplicationsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
