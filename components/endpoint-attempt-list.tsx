"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DateTimeRangePicker } from "@/components/date-time-range-picker";

type MessageAttempt = {
  id: string;
  msgId: string;
  endpointId: string;
  response: any;
  responseStatusCode: number;
  responseDurationMs?: number;
  status: string | number;
  timestamp: string;
  triggerType: string;
  url: string;
};

type MessageAttemptsResponse = {
  data: MessageAttempt[];
  iterator: string | null;
  done: boolean;
  count: number;
  error?: string;
};

async function fetchMessageAttempts(
  endpointId?: string, 
  appId?: string, 
  status?: string, 
  iterator?: string,
  startDate?: Date,
  endDate?: Date
): Promise<MessageAttemptsResponse> {
  try {
    const params = new URLSearchParams({
      limit: '50'
    });
    
    if (appId) {
      params.append('appId', appId);
    }
    
    if (endpointId) {
      params.append('endpointId', endpointId);
    }
    
    if (status) {
      params.append('status', status);
    }
    
    if (iterator) {
      params.append('iterator', iterator);
    }
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }

    const response = await fetch(`/api/attempts?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      data: result.data || [],
      iterator: result.iterator,
      done: result.done,
      count: result.count || 0
    };
  } catch (error) {
    console.error('Error fetching message attempts:', error);
    return {
      data: [],
      iterator: null,
      done: true,
      count: 0,
      error: 'Failed to fetch message attempts'
    };
  }
}

async function resendAttempt(msgId: string, appId: string, endpointId: string): Promise<{success: boolean, error?: string}> {
  try {
    const response = await fetch(`/api/messages/${msgId}/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appId, endpointId }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error resending message:', error);
    return {
      success: false,
      error: 'Failed to resend message'
    };
  }
}

interface EndpointAttemptListProps {
  endpointId: string;
  appId: string;
  statusFilter?: string;
}

export function EndpointAttemptList({ endpointId, appId, statusFilter }: EndpointAttemptListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get dates from URL params or use defaults - memoized to prevent infinite loops
  const startDate = useMemo(() => {
    const paramStart = searchParams.get('startDate');
    if (paramStart) {
      return new Date(paramStart);
    }
    // Create default start date (15 minutes ago) only once
    const date = new Date();
    date.setMinutes(date.getMinutes() - 15);
    return date;
  }, [searchParams]);
  
  const endDate = useMemo(() => {
    const paramEnd = searchParams.get('endDate');
    if (paramEnd) {
      return new Date(paramEnd);
    }
    // Create default end date (now) only once
    return new Date();
  }, [searchParams]);
  
  const [attempts, setAttempts] = useState<MessageAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsIterator, setAttemptsIterator] = useState<string | null>(null);
  const [hasMoreAttempts, setHasMoreAttempts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAttemptResponses, setExpandedAttemptResponses] = useState<Set<string>>(new Set());
  const [resendingAttempts, setResendingAttempts] = useState<Set<string>>(new Set());
  const [showResendModal, setShowResendModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<{msgId: string, endpointId: string} | null>(null);

  useEffect(() => {
    const loadAttempts = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchMessageAttempts(
          endpointId, 
          appId, 
          statusFilter, 
          undefined,
          startDate,
          endDate
        );
        
        if (result.error) {
          setError(result.error);
        } else {
          setAttempts(result.data);
          setAttemptsIterator(result.iterator);
          setHasMoreAttempts(!result.done && result.data.length > 0);
        }
      } catch (err) {
        setError('Failed to load attempts');
        console.error('Error loading attempts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, [endpointId, appId, statusFilter, startDate.toISOString(), endDate.toISOString()]);

  // Refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  // Load more attempts using iterator
  const loadMoreAttempts = async () => {
    if (!attemptsIterator || attemptsLoading || !hasMoreAttempts) return;
    
    setAttemptsLoading(true);
    
    try {
      const result = await fetchMessageAttempts(
        endpointId, 
        appId, 
        statusFilter, 
        attemptsIterator,
        startDate,
        endDate
      );
      
      if (result.error) {
        setError(result.error);
        return;
      }

      setAttempts(prev => [...prev, ...result.data]);
      setAttemptsIterator(result.iterator);
      setHasMoreAttempts(!result.done && result.data.length > 0);
    } catch (err) {
      setError('Failed to load more attempts');
      console.error('Error loading more attempts:', err);
    } finally {
      setAttemptsLoading(false);
    }
  };

  // Update URL with new dates and reload
  const updateUrlAndReload = (newStartDate: Date, newEndDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('startDate', newStartDate.toISOString());
    params.set('endDate', newEndDate.toISOString());
    
    // Keep the existing parameters
    if (appId) params.set('appId', appId);
    if (endpointId) params.set('endpointId', endpointId);
    if (statusFilter) params.set('status', statusFilter);
    
    // Navigate to the new URL with replace to avoid adding to history
    router.replace(`?${params.toString()}`);
  };

  // Handle date changes - update URL to trigger reload
  const handleDateTimeRangeUpdate = (values: { range: { from: Date | undefined; to: Date | undefined } }) => {
    if (values.range.from && values.range.to) {
      updateUrlAndReload(values.range.from, values.range.to);
    }
  };

  const handleResend = async (msgId: string, endpointId: string) => {
    setResendingAttempts(prev => new Set([...prev, `${msgId}-${endpointId}`]));
    
    try {
      const result = await resendAttempt(msgId, appId, endpointId);
      
      if (result.success) {
        setShowResendModal(false);
        setSelectedAttempt(null);
        // Refresh the attempts to show the new attempt
        const attemptsResult = await fetchMessageAttempts(
          endpointId, 
          appId, 
          statusFilter, 
          undefined,
          startDate,
          endDate
        );
        if (!attemptsResult.error) {
          setAttempts(attemptsResult.data);
          setAttemptsIterator(attemptsResult.iterator);
          setHasMoreAttempts(!attemptsResult.done && attemptsResult.data.length > 0);
        }
      } else {
        setError(result.error || 'Failed to resend message');
      }
    } catch (err) {
      setError('Failed to resend message');
      console.error('Error resending message:', err);
    } finally {
      setResendingAttempts(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${msgId}-${endpointId}`);
        return newSet;
      });
    }
  };

  const showResendConfirmation = (msgId: string, endpointId: string) => {
    setSelectedAttempt({ msgId, endpointId });
    setShowResendModal(true);
  };

  const toggleAttemptExpansion = (attemptId: string) => {
    setExpandedAttemptResponses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(attemptId)) {
        newSet.delete(attemptId);
      } else {
        newSet.add(attemptId);
      }
      return newSet;
    });
  };

  const formatPayload = (payload: any) => {
    try {
      if (typeof payload === 'string') {
        try {
          const parsed = JSON.parse(payload);
          return JSON.stringify(parsed, null, 2);
        } catch {
          if (payload.startsWith('"') && payload.endsWith('"')) {
            try {
              const unescaped = JSON.parse(payload);
              const parsed = JSON.parse(unescaped);
              return JSON.stringify(parsed, null, 2);
            } catch {
              return JSON.parse(payload);
            }
          }
          return payload;
        }
      }
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      return String(payload);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "dd-MMM-yyyy HH:mm:ss.SSS");
  };

  const formatTriggerType = (triggerType: string | number) => {
    const numericType = typeof triggerType === 'string' ? parseInt(triggerType) : triggerType;
    switch (numericType) {
      case 0:
        return 'Scheduled';
      case 1:
        return 'Manual';
      default:
        return typeof triggerType === 'string' ? triggerType : 'Unknown';
    }
  };

  const getStatusCodeColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-50 border-green-200';
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (statusCode >= 500) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusInfo = (status: string | number) => {
    const numericStatus = typeof status === 'string' ? parseInt(status) : status;
    
    switch (numericStatus) {
      case 0:
        return {
          text: 'Success',
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 1:
        return {
          text: 'Pending',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 2:
        return {
          text: 'Fail',
          color: 'text-red-600 bg-red-50 border-red-200'
        };
      case 3:
        return {
          text: 'Sending',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      default:
        const statusText = typeof status === 'string' ? status : 'Unknown';
        return {
          text: statusText,
          color: statusText === 'Success' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
        };
    }
  };

  const getPageTitle = () => {
    if (statusFilter === 'success') return 'Success Attempts';
    if (statusFilter === 'failed') return 'Failed Attempts';
    return 'All Attempts';
  };

  if (loading) {
    return (
      <div className="text-center py-8">Loading attempts...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {getPageTitle()} ({attempts.length})
        </h1>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>
      
      <DateTimeRangePicker
        onUpdate={handleDateTimeRangeUpdate}
        initialDateFrom={startDate}
        initialDateTo={endDate}
      />

      <div className="space-y-4">
        {attempts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No attempts found
          </div>
        ) : (
          <div className="space-y-2">
            {attempts.map((attempt) => {
              const statusInfo = getStatusInfo(attempt.status);
              const isExpanded = expandedAttemptResponses.has(attempt.id);
              
              return (
                <div key={attempt.id} className="bg-gray-50 p-3 rounded-md border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusCodeColor(attempt.responseStatusCode)}`}>
                        {attempt.responseStatusCode}
                      </span>
                      <span className="text-xs text-gray-600">{formatTriggerType(attempt.triggerType)}</span>
                      {attempt.responseDurationMs && (
                        <span className="text-xs text-gray-600">
                          {attempt.responseDurationMs}ms
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-600">
                        {formatTimestamp(attempt.timestamp)}
                      </div>
                      <Link
                        href={`/messages/${attempt.msgId}?appId=${appId}`}
                        className="flex items-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-800 px-2 py-1 rounded border border-gray-200 transition-colors"
                      >
                        <span>↗</span>
                        Message
                      </Link>
                      <button
                        type="button"
                        onClick={() => showResendConfirmation(attempt.msgId, attempt.endpointId)}
                        disabled={resendingAttempts.has(`${attempt.msgId}-${attempt.endpointId}`)}
                        className="flex items-center gap-1 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-800 px-2 py-1 rounded border border-violet-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>↻</span>
                        {resendingAttempts.has(`${attempt.msgId}-${attempt.endpointId}`) ? 'Resending...' : 'Resend'}
                      </button>
                      {attempt.response && (
                        <button
                          onClick={() => toggleAttemptExpansion(attempt.id)}
                          className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 transition-colors"
                        >
                          <span>{isExpanded ? '▼' : '▶'}</span>
                          {isExpanded ? 'Hide' : 'Show'} Response
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 font-mono break-all">
                    {attempt.url}
                  </div>
                  {attempt.response && isExpanded && (
                    <div className="mt-2">
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-64">
                        <code>{formatPayload(attempt.response)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {hasMoreAttempts && (
          <div className="flex items-center justify-center">
            <button
              disabled={attemptsLoading}
              onClick={loadMoreAttempts}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {attemptsLoading ? 'Loading...' : 'Load More Attempts'}
            </button>
          </div>
        )}
      </div>

      {/* Resend Confirmation Modal */}
      {showResendModal && selectedAttempt && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setShowResendModal(false);
            setSelectedAttempt(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Confirm Resend</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to resend this message to this endpoint? This will trigger a new attempt.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResendModal(false);
                  setSelectedAttempt(null);
                }}
                disabled={selectedAttempt ? resendingAttempts.has(`${selectedAttempt.msgId}-${selectedAttempt.endpointId}`) : false}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedAttempt && handleResend(selectedAttempt.msgId, selectedAttempt.endpointId)}
                disabled={selectedAttempt ? resendingAttempts.has(`${selectedAttempt.msgId}-${selectedAttempt.endpointId}`) : false}
              >
                {selectedAttempt && resendingAttempts.has(`${selectedAttempt.msgId}-${selectedAttempt.endpointId}`) ? 'Resending...' : 'Resend Message'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}