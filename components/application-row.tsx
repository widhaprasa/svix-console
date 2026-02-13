"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { ApplicationActions } from "./application-actions";

type Application = {
  uid: string;
  name: string;
  rateLimit: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
};

interface ApplicationRowProps {
  application: Application;
}

export function ApplicationRow({ application }: ApplicationRowProps) {
  const handleRowClick = () => {
    // Navigate to endpoints page for this application
    window.location.href = `/endpoints?appId=${application.uid}`;
  };

  return (
    <TableRow 
      key={application.id} 
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-muted/50"
    >
      <TableCell className="text-sm">{application.uid}</TableCell>
      <TableCell className="text-sm">{application.name}</TableCell>
      <TableCell className="text-right">
        <ApplicationActions applicationId={application.uid} applicationName={application.name} />
      </TableCell>
    </TableRow>
  );
}