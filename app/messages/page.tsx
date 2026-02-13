import { MessagesList } from "@/components/messages-list";
import Link from "next/link";

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

  if (!appId) {
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
        
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-4">Messages</h1>
            <p className="text-muted-foreground">Please select an application to view its messages.</p>
          </div>
        </div>
      </div>
    );
  }

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
        <MessagesList appId={appId} />
      </div>
    </div>
  );
}