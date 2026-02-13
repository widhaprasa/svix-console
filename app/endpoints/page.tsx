import { EndpointsList } from "@/components/endpoints-list";
import { PageLayout } from "@/components/page-layout";

interface PageProps {
  searchParams: Promise<{ appId?: string }>;
}

export default async function EndpointsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const appId = params.appId;

  return (
    <PageLayout pageName="Endpoints" appId={appId}>
      <EndpointsList appId={appId!} />
    </PageLayout>
  );
}