"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={currentPage === 1}
        >
          {currentPage === 1 ? (
            <span>Previous</span>
          ) : (
            <Link href={createPageURL(currentPage - 1)}>Previous</Link>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={currentPage === totalPages}
        >
          {currentPage === totalPages ? (
            <span>Next</span>
          ) : (
            <Link href={createPageURL(currentPage + 1)}>Next</Link>
          )}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  );
}