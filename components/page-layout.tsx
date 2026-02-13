import { ReactNode } from "react";
import { Toolbar } from "./toolbar";

interface PageLayoutProps {
  pageName: string;
  appId?: string;
  id?: string;
  parentPath?: string;
  children: ReactNode;
}

export function PageLayout({ pageName, appId, id, parentPath, children }: PageLayoutProps) {
  if (!appId) {
    return (
      <div className="min-h-screen bg-background">
        <Toolbar currentPage={pageName} id={id} parentPath={parentPath} />
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
      <Toolbar currentPage={pageName} id={id} parentPath={parentPath} />
      <div className="container mx-auto py-8 px-4">
        {children}
      </div>
    </div>
  );
}