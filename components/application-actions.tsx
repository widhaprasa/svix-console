"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ApplicationActionsProps {
  applicationId: string;
  applicationName: string;
}

export function ApplicationActions({ applicationId, applicationName }: ApplicationActionsProps) {
  const handleMessage = (applicationId: string) => {
    console.log(`Message for application: ${applicationId}`);
    // Navigate to messages page for this application
    window.location.href = `/messages?appId=${applicationId}`;
  };

  const handleEndpoint = (applicationId: string) => {
    console.log(`Endpoint for application: ${applicationId}`);
    // Navigate to endpoints page for this application
    window.location.href = `/endpoints?appId=${applicationId}`;
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
          <DropdownMenuItem onClick={() => handleMessage(applicationId)}>
            Messages
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEndpoint(applicationId)}>
            Endpoints
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}