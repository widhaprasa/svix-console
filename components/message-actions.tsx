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

interface MessageActionsProps {
  messageId: string;
  appId: string;
}

export function MessageActions({ messageId, appId }: MessageActionsProps) {
  const router = useRouter();
  
  const handleDetail = () => {
    router.push(`/messages/${messageId}?appId=${appId}`);
  };

  const handleSearch = () => {
    console.log(`Search for message: ${messageId}`);
    // Implement search logic here
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
          <DropdownMenuItem onClick={handleDetail}>
            Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSearch}>
            Search
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}