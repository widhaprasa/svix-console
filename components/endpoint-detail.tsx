"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type EndpointDetail = {
  id: string;
  url: string;
  uid?: string;
  description?: string;
  disabled: boolean;
  rateLimit?: number;
  createdAt: string;
  updatedAt: string;
  applicationId: string;
};

type EndpointDetailResponse = {
  data: EndpointDetail | null;
  headers?: any;
  notFound?: boolean;
  error?: string;
};

async function fetchEndpointDetail(endpointId: string, appId: string): Promise<EndpointDetailResponse> {
  try {
    const response = await fetch(`/api/endpoints/${endpointId}?appId=${appId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { data: null, notFound: true };
      }
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.notFound) {
      return { data: null, notFound: true };
    }
    
    return { data: result.data, headers: result.headers };
  } catch (error) {
    console.error('Error fetching endpoint detail:', error);
    return {
      data: null,
      error: 'Failed to fetch endpoint detail'
    };
  }
}

interface EndpointDetailProps {
  endpointId: string;
  appId: string;
  onClose?: () => void;
}

export function EndpointDetail({ endpointId, appId, onClose }: EndpointDetailProps) {
  const [endpointDetail, setEndpointDetail] = useState<EndpointDetail | null>(null);
  const [headers, setHeaders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const result = await fetchEndpointDetail(endpointId, appId);

        if (result.notFound) {
          setNotFound(true);
          setEndpointDetail(null);
        } else if (result.error) {
          setError(result.error);
        } else {
          setEndpointDetail(result.data);
          setHeaders(result.headers || null);
        }
      } catch (err) {
        setError('Failed to load endpoint data');
        console.error('Error loading endpoint data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (endpointId && appId) {
      loadData();
    }
  }, [endpointId, appId]);



  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Endpoint Detail</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Refresh
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
        <div className="text-center py-8">Loading endpoint details...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Endpoint Detail</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">Endpoint not found</div>
          <div className="text-gray-400 text-sm mt-2">The endpoint with ID "{endpointId}" could not be found.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Endpoint Detail</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!endpointDetail) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Endpoint Detail</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No Data</div>
          <div className="text-gray-400 text-sm mt-2">No endpoint data available.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Endpoint Detail</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            Refresh
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Endpoint Detail Section */}
      {endpointDetail && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Endpoint Information</h3>
          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Endpoint Id:</span>
                <p className="text-sm font-mono">{endpointDetail.uid || endpointDetail.id}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <div className="text-sm">
                  <Badge variant={endpointDetail.disabled ? "destructive" : "default"}>
                    {endpointDetail.disabled ? "Disabled" : "Active"}
                  </Badge>
                </div>
              </div>
              <div className="col-span-2">
                <span className="font-medium">URL:</span>
                <p className="text-sm font-mono break-all">{endpointDetail.url}</p>
              </div>
            </div>
            
            {endpointDetail.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-sm text-gray-600 mt-1">{endpointDetail.description}</p>
              </div>
            )}

            {endpointDetail.rateLimit && (
              <div>
                <span className="font-medium">Rate Limit:</span>
                <p className="text-sm text-gray-600 mt-1">{endpointDetail.rateLimit} requests per second</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Headers Section */}
      {headers && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Headers ({Object.keys(headers).length || 0})</h3>
          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <div>
              <span className="font-medium">Header:</span>
              <pre className="text-xs font-mono mt-1 bg-white p-3 rounded border overflow-x-auto">
                <code>{JSON.stringify(headers.headers || headers, null, 2)}</code>
              </pre>
            </div>
            <div>
              <span className="font-medium">Sensitive:</span>
              <pre className="text-xs font-mono mt-1 bg-white p-3 rounded border">
                <code>{JSON.stringify(headers.sensitive || [], null, 2)}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Actions</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => window.open(`/attempts?endpointId=${endpointId}&appId=${appId}`, '_blank')}
            >
              View All Attempts
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/attempts?endpointId=${endpointId}&appId=${appId}&status=success`, '_blank')}
            >
              View Success Attempts
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/attempts?endpointId=${endpointId}&appId=${appId}&status=failed`, '_blank')}
            >
              View Failed Attempts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}