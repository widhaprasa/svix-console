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
import { EndpointRow } from "./endpoint-row";
import { Input } from "./ui/input";

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

const ITEMS_PER_PAGE = 25;

async function fetchEndpoints(appId: string): Promise<Endpoint[]> {
  try {
    const response = await fetch(`/api/endpoints?appId=${appId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return [];
  }
}

interface EndpointsListProps {
  appId: string;
  endpoints?: Endpoint[];
}

export function EndpointsList({ appId, endpoints: initialEndpoints }: EndpointsListProps) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(!initialEndpoints);

  // Fetch endpoints on mount if not provided
  useEffect(() => {
    if (!initialEndpoints) {
      fetchEndpoints(appId).then(eps => {
        setEndpoints(eps);
        setLoading(false);
      });
    }
  }, [initialEndpoints, appId]);

  const filteredEndpoints = useMemo(() => {
    if (!searchQuery) return endpoints;
    
    const query = searchQuery.toLowerCase();
    return endpoints.filter(endpoint => 
      endpoint.url.toLowerCase().includes(query) ||
      (endpoint.uid && endpoint.uid.toLowerCase().includes(query)) ||
      (endpoint.description && endpoint.description.toLowerCase().includes(query))
    );
  }, [endpoints, searchQuery]);

  const totalPages = Math.ceil(filteredEndpoints.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEndpoints = filteredEndpoints.slice(startIndex, endIndex);

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
          <h1 className="text-2xl font-semibold tracking-tight">
            Endpoints
          </h1>
        </div>
        <div className="text-center py-8">Loading endpoints...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Endpoints
        </h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4/5">Endpoint URL</TableHead>
              <TableHead className="w-1/6">Status</TableHead>
              <TableHead className="w-1/6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEndpoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {searchQuery ? 'No endpoints found matching your search.' : 'No endpoints found.'}
                </TableCell>
              </TableRow>
            ) : (
              currentEndpoints.map((endpoint) => (
                <EndpointRow key={endpoint.id} endpoint={endpoint} />
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