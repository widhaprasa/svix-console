"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface MessageActionsProps {
  messageId: string;
  appId: string;
}

export function MessageActions({ messageId, appId }: MessageActionsProps) {
  const handleView = () => {
    console.log(`View message: ${messageId}`);
    // Implement view message logic here
  };

  const handleAttempts = () => {
    console.log(`View attempts for message: ${messageId}`);
    // Implement view attempts logic here
  };

  const handleResend = () => {
    console.log(`Resend message: ${messageId}`);
    // Implement resend logic here
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
          <DropdownMenuItem onClick={handleView}>
            View Payload
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAttempts}>
            View Attempts
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleResend}>
            Resend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}