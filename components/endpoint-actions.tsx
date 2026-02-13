"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface EndpointActionsProps {
  endpointId: string;
  applicationId: string;
}

export function EndpointActions({ endpointId, applicationId }: EndpointActionsProps) {
  const handleEdit = () => {
    console.log(`Edit endpoint: ${endpointId}`);
    // Implement edit logic here
  };

  const handleTest = () => {
    console.log(`Test endpoint: ${endpointId}`);
    // Implement test webhook logic here
  };

  const handleDisable = () => {
    console.log(`Disable endpoint: ${endpointId}`);
    // Implement disable logic here
  };

  const handleDelete = () => {
    console.log(`Delete endpoint: ${endpointId}`);
    // Implement delete logic here
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
          <DropdownMenuItem onClick={handleEdit}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTest}>
            Test
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisable}>
            Disable
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}