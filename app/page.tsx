import { ApplicationsList } from "@/components/applications-list";
import { Toolbar } from "@/components/toolbar";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Toolbar />
      
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
          <ApplicationsList />
        </Suspense>
      </div>
    </div>
  );
}
