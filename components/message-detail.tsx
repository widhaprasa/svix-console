"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

type MessageDetail = {
  id: string;
  eventType: string;
  eventId?: string;
  payload: any;
  channels?: string[];
  tags?: Record<string, string>;
  timestamp: string;
  uid?: string;
};

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

type MessageDetailResponse = {
  data: MessageDetail | null;
  notFound?: boolean;
  error?: string;
};

type MessageAttemptsResponse = {
  data: MessageAttempt[];
  iterator: string | null;
  done: boolean;
  count: number;
  error?: string;
};

async function fetchMessageDetail(msgId: string, appId: string): Promise<MessageDetailResponse> {
  try {
    const response = await fetch(`/api/messages/${msgId}?appId=${appId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.notFound) {
      return { data: null, notFound: true };
    }
    
    return { data: result.data };
  } catch (error) {
    console.error('Error fetching message detail:', error);
    return {
      data: null,
      error: 'Failed to fetch message detail'
    };
  }
}

async function fetchMessageAttempts(msgId: string, appId: string, iterator?: string): Promise<MessageAttemptsResponse> {
  try {
    const params = new URLSearchParams({
      appId,
      limit: '10'
    });
    
    if (iterator) {
      params.append('iterator', iterator);
    }

    const response = await fetch(`/api/messages/${msgId}/attempts?${params.toString()}`, {
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

async function resendMessage(msgId: string, appId: string, endpointId: string): Promise<{success: boolean, error?: string}> {
  try {
    const response = await fetch(`/api/messages/${msgId}/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appId, endpointId }),
    });
    console.log('Resend response status:', response.status);

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

interface MessageDetailProps {
  msgId: string;
  appId: string;
  onClose?: () => void;
}

export function MessageDetail({ msgId, appId, onClose }: MessageDetailProps) {
  const [messageDetail, setMessageDetail] = useState<MessageDetail | null>(null);
  const [attempts, setAttempts] = useState<MessageAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsIterator, setAttemptsIterator] = useState<string | null>(null);
  const [hasMoreAttempts, setHasMoreAttempts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPayloadExpanded, setIsPayloadExpanded] = useState(false);
  const [expandedAttemptResponses, setExpandedAttemptResponses] = useState<Set<string>>(new Set());
  const [resendingAttempts, setResendingAttempts] = useState<Set<string>>(new Set());
  const [showResendModal, setShowResendModal] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        // Load both detail and attempts in parallel
        const [detailResult, attemptsResult] = await Promise.all([
          fetchMessageDetail(msgId, appId),
          fetchMessageAttempts(msgId, appId)
        ]);

        if (detailResult.notFound) {
          setNotFound(true);
          setMessageDetail(null);
        } else if (detailResult.error) {
          setError(detailResult.error);
        } else {
          setMessageDetail(detailResult.data);
        }

        if (attemptsResult.error) {
          setError(prev => prev ? `${prev}; ${attemptsResult.error}` : attemptsResult.error);
        } else {
          setAttempts(attemptsResult.data);
          setAttemptsIterator(attemptsResult.iterator);
          setHasMoreAttempts(!attemptsResult.done && attemptsResult.data.length > 0);
        }
      } catch (err) {
        setError('Failed to load message data');
        console.error('Error loading message data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (msgId && appId) {
      loadData();
    }
  }, [msgId, appId]);

  // Refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  // Load more attempts using iterator
  const loadMoreAttempts = async () => {
    if (!attemptsIterator || attemptsLoading || !hasMoreAttempts) return;
    
    setAttemptsLoading(true);
    
    try {
      const result = await fetchMessageAttempts(msgId, appId, attemptsIterator);
      
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

  const handleResend = async (endpointId: string) => {
    setResendingAttempts(prev => new Set([...prev, endpointId]));
    
    try {
      const result = await resendMessage(msgId, appId, endpointId);
      
      if (result.success) {
        setShowResendModal(false);
        setSelectedEndpointId(null);
        // Refresh the attempts to show the new attempt
        const attemptsResult = await fetchMessageAttempts(msgId, appId);
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
        newSet.delete(endpointId);
        return newSet;
      });
    }
  };

  const showResendConfirmation = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
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

  const togglePayloadExpansion = () => {
    setIsPayloadExpanded(prev => !prev);
  };

  const formatPayload = (payload: any) => {
    try {
      // If payload is a string, try to parse it as JSON first
      if (typeof payload === 'string') {
        try {
          // Try to parse the string directly as JSON
          const parsed = JSON.parse(payload);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // If it's an escaped string like "{ \"success\": true }", try double parsing
          if (payload.startsWith('"') && payload.endsWith('"')) {
            try {
              const unescaped = JSON.parse(payload);
              const parsed = JSON.parse(unescaped);
              return JSON.stringify(parsed, null, 2);
            } catch {
              // Return the unescaped string if inner parsing fails
              return JSON.parse(payload);
            }
          }
          // Return original string if not JSON
          return payload;
        }
      }
      // For objects/arrays, stringify normally
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
        // Fallback for string statuses or unknown numeric codes
        const statusText = typeof status === 'string' ? status : 'Unknown';
        return {
          text: statusText,
          color: statusText === 'Success' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
        };
    }
  };
  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Message Detail</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
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
        <div className="text-center py-8">Loading message details...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Message Detail</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
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
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">Message ID not found</div>
          <div className="text-gray-400 text-sm mt-2">The message with ID "{msgId}" could not be found.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Message Detail</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
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

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Message Detail</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
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

      {/* Message Detail Section */}
      {messageDetail && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Message Information</h3>
          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Message Id:</span>
                <p className="text-sm font-mono">{messageDetail.uid || messageDetail.id}</p>
              </div>
              <div>
                <span className="font-medium">Event Id:</span>
                <p className="text-sm font-mono">{messageDetail.eventId || messageDetail.id}</p>
              </div>
              <div>
                <span className="font-medium">Event Type:</span>
                <p className="text-sm">{messageDetail.eventType}</p>
              </div>
              <div>
                <span className="font-medium">Time:</span>
                <p className="text-sm">{formatTimestamp(messageDetail.timestamp)}</p>
              </div>
            </div>
            
            {messageDetail.channels && messageDetail.channels.length > 0 && (
              <div>
                <span className="font-medium">Channels:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {messageDetail.channels.map((channel, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {messageDetail.tags && Object.keys(messageDetail.tags).length > 0 && (
              <div>
                <span className="font-medium">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(messageDetail.tags).map(([key, value]) => (
                    <span key={key} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Payload:</span>
                <button
                  onClick={togglePayloadExpansion}
                  className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 transition-colors"
                >
                  <span>{isPayloadExpanded ? '▼' : '▶'}</span>
                  {isPayloadExpanded ? 'Hide' : 'Show'} Payload
                </button>
              </div>
              {isPayloadExpanded && (
                <pre className="text-xs bg-white p-3 rounded-md overflow-x-auto border mt-2">
                  <code>{formatPayload(messageDetail.payload)}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attempts Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Delivery Attempts ({attempts.length})</h3>
        {attempts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No delivery attempts found
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
                      <button
                        type="button"
                        onClick={() => showResendConfirmation(attempt.endpointId)}
                        disabled={resendingAttempts.has(attempt.endpointId)}
                        className="flex items-center gap-1 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-800 px-2 py-1 rounded border border-violet-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>↻</span>
                        {resendingAttempts.has(attempt.endpointId) ? 'Resending...' : 'Resend'}
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
      {showResendModal && selectedEndpointId && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setShowResendModal(false);
            setSelectedEndpointId(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Confirm Resend</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to resend this message to this endpoint? This will trigger a new delivery attempt.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResendModal(false);
                  setSelectedEndpointId(null);
                }}
                disabled={selectedEndpointId ? resendingAttempts.has(selectedEndpointId) : false}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedEndpointId && handleResend(selectedEndpointId)}
                disabled={selectedEndpointId ? resendingAttempts.has(selectedEndpointId) : false}
              >
                {selectedEndpointId && resendingAttempts.has(selectedEndpointId) ? 'Resending...' : 'Resend Message'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}