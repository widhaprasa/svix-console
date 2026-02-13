import { ReactNode } from "react";
import { Toolbar } from "./toolbar";

interface PageLayoutProps {
  pageName: string;
  appId?: string;
  children: ReactNode;
}

export function PageLayout({ pageName, appId, children }: PageLayoutProps) {
  if (!appId) {
    return (
      <div className="min-h-screen bg-background">
        <Toolbar currentPage={pageName} />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-4">{pageName}</h1>
            <p className="text-muted-foreground">Please select an application to view its {pageName.toLowerCase()}.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toolbar currentPage={pageName} />
      <div className="container mx-auto py-8 px-4">
        {children}
      </div>
    </div>
  );
}