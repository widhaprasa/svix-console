"use client";

import { useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { EndpointAttemptList } from "@/components/endpoint-attempt-list";

export default function AttemptsPage() {
  const searchParams = useSearchParams();
  const endpointId = searchParams.get('endpointId');
  const appId = searchParams.get('appId');
  const statusFilter = searchParams.get('status');

  if (!endpointId || !appId) {
    return (
      <PageLayout pageName="Endpoints" appId={appId || undefined} id={endpointId || undefined} parentPath={`/endpoints?appId=${appId}`}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">Missing required parameters: endpointId and appId</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="Endpoints" appId={appId} id={endpointId} parentPath={`/endpoints?appId=${appId}`}>
      <EndpointAttemptList 
        endpointId={endpointId} 
        appId={appId} 
        statusFilter={statusFilter || undefined}
      />
    </PageLayout>
  );
}