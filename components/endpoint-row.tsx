"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { EndpointActions } from "./endpoint-actions";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

type Endpoint = {
  id: string;
  url: string;
  uid?: string;
  description?: string;
  disabled: boolean;
  rateLimit?: number;
  createdAt: string;
  updatedAt: string;
  applicationId: string;
  applicationUid: string;
  applicationName: string;
};

interface EndpointRowProps {
  endpoint: Endpoint;
}

export function EndpointRow({ endpoint }: EndpointRowProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams.get('appId');
  
  const handleRowClick = () => {
    if (applicationId) {
      router.push(`/endpoints/${endpoint.id}?appId=${applicationId}`);
    }
  };

  return (
    <TableRow 
      key={endpoint.id} 
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-muted/50"
    >
      <TableCell className="text-sm">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-gray-900 font-mono break-all" title={endpoint.url}>
            {endpoint.url}
          </div>
          {endpoint.description && (
            <div className="text-xs text-gray-600 italic">
              {endpoint.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm">
        <Badge variant={endpoint.disabled ? "destructive" : "default"}>
          {endpoint.disabled ? 'Disabled' : 'Active'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <EndpointActions endpointId={endpoint.id} applicationId={applicationId || ''} />
      </TableCell>
    </TableRow>
  );
}