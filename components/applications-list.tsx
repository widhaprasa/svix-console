"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicationRow } from "./application-row";

type Application = {
  uid: string;
  name: string;
  rateLimit: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
};

const ITEMS_PER_PAGE = 25;

async function fetchApplications(): Promise<Application[]> {
  try {
    const response = await fetch('/api/applications', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

interface ApplicationsListProps {
  applications?: Application[];
}

export function ApplicationsList({ applications: initialApplications }: ApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(!initialApplications);

  // Fetch applications on mount if not provided
  useEffect(() => {
    if (!initialApplications) {
      fetchApplications().then(apps => {
        setApplications(apps);
        setLoading(false);
      });
    }
  }, [initialApplications]);

  const filteredApplications = useMemo(() => {
    if (!searchQuery) return applications;
    
    const query = searchQuery.toLowerCase();
    return applications.filter(app => 
      app.name.toLowerCase().includes(query) ||
      app.uid.toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        </div>
        <div className="text-center py-8">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5">Application Id</TableHead>
              <TableHead className="w-2/5">Application Name</TableHead>
              <TableHead className="w-1/5 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {searchQuery ? 'No applications found matching your search.' : 'No applications found.'}
                </TableCell>
              </TableRow>
            ) : (
              currentApplications.map((app) => (
                <ApplicationRow key={app.id} application={app} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}