import { MessagesList } from "@/components/messages-list";
import { PageLayout } from "@/components/page-layout";

interface PageProps {
  searchParams: Promise<{ 
    appId?: string; 
    startDate?: string; 
    endDate?: string; 
  }>;
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const appId = params.appId;

  return (
    <PageLayout pageName="Messages" appId={appId}>
      <MessagesList appId={appId!} />
    </PageLayout>
  );
}