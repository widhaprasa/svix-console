"use client";

import { use } from "react";
import { MessageDetail } from "@/components/message-detail";
import { PageLayout } from "@/components/page-layout";
import { useSearchParams } from "next/navigation";

interface MessageDetailPageProps {
  params: Promise<{
    messageId: string;
  }>;
}

export default function MessageDetailPage({ params }: MessageDetailPageProps) {
  const { messageId } = use(params);
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId');

  if (!appId) {
    return (
      <PageLayout pageName="Messages" id={messageId} parentPath="/messages">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Missing Application Id</h2>
            <p className="text-gray-600">Please select an application to view message details.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="Messages" appId={appId} id={messageId} parentPath={`/messages?appId=${appId}`}>
      <MessageDetail msgId={messageId} appId={appId} />
    </PageLayout>
  );
}