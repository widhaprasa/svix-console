"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface EndpointActionsProps {
  endpointId: string;
  applicationId: string;
}

export function EndpointActions({ endpointId, applicationId }: EndpointActionsProps) {
  const router = useRouter();
  
  const handleAllAttempts = () => {
    router.push(`/attempts?endpointId=${endpointId}&appId=${applicationId}`);
  };

  const handleSuccessAttempts = () => {
    router.push(`/attempts?endpointId=${endpointId}&appId=${applicationId}&status=success`);
  };

  const handleFailedAttempts = () => {
    router.push(`/attempts?endpointId=${endpointId}&appId=${applicationId}&status=failed`);
  };

  const handleDetail = () => {
    router.push(`/endpoints/${endpointId}?appId=${applicationId}`);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when dropdown is clicked
  };

  return (
    <div onClick={handleDropdownClick}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleAllAttempts}>
            All Attempts
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSuccessAttempts}>
            Success Attempts
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFailedAttempts}>
            Failed Attempts
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDetail}>
            Detail
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}