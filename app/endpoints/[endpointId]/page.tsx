"use client";

import { use } from "react";
import { EndpointDetail } from "@/components/endpoint-detail";
import { PageLayout } from "@/components/page-layout";
import { useSearchParams } from "next/navigation";

interface EndpointDetailPageProps {
  params: Promise<{
    endpointId: string;
  }>;
}

export default function EndpointDetailPage({ params }: EndpointDetailPageProps) {
  const { endpointId } = use(params);
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId');

  if (!appId) {
    return (
      <PageLayout pageName="Endpoints" id={endpointId} parentPath="/endpoints">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Missing Application Id</h2>
            <p className="text-gray-600">Please select an application to view endpoint details.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="Endpoints" appId={appId} id={endpointId} parentPath={`/endpoints?appId=${appId}`}>
      <EndpointDetail endpointId={endpointId} appId={appId} />
    </PageLayout>
  );
}