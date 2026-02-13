"use client";

import { useState, useEffect } from "react";
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
  response: {
    statusCode: number;
    headers: Record<string, string>;
    body?: string;
  };
  responseStatusCode: number;
  status: string;
  timestamp: string;
  triggerType: string;
  url: string;
};

type MessageDetailResponse = {
  data: MessageDetail;
  error?: string;
};

type MessageAttemptsResponse = {
  data: MessageAttempt[];
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

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Error fetching message detail:', error);
    return {
      data: {} as MessageDetail,
      error: 'Failed to fetch message detail'
    };
  }
}

async function fetchMessageAttempts(msgId: string, appId: string): Promise<MessageAttemptsResponse> {
  try {
    const response = await fetch(`/api/messages/${msgId}/attempts?appId=${appId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { data: data || [] };
  } catch (error) {
    console.error('Error fetching message attempts:', error);
    return {
      data: [],
      error: 'Failed to fetch message attempts'
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load both detail and attempts in parallel
        const [detailResult, attemptsResult] = await Promise.all([
          fetchMessageDetail(msgId, appId),
          fetchMessageAttempts(msgId, appId)
        ]);

        if (detailResult.error) {
          setError(detailResult.error);
        } else {
          setMessageDetail(detailResult.data);
        }

        if (attemptsResult.error) {
          setError(prev => prev ? `${prev}; ${attemptsResult.error}` : attemptsResult.error);
        } else {
          setAttempts(attemptsResult.data);
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

  const formatPayload = (payload: any) => {
    try {
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      return String(payload);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Message Detail</h2>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
        <div className="text-center py-8">Loading message details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Message Detail</h2>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
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
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Message Detail Section */}
      {messageDetail && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Message Information</h3>
          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Message ID:</span>
                <p className="text-sm font-mono">{messageDetail.uid || messageDetail.id}</p>
              </div>
              <div>
                <span className="font-medium">Event ID:</span>
                <p className="text-sm font-mono">{messageDetail.eventId || messageDetail.id}</p>
              </div>
              <div>
                <span className="font-medium">Event Type:</span>
                <p className="text-sm">{messageDetail.eventType}</p>
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>
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
              <span className="font-medium">Payload:</span>
              <pre className="text-xs bg-white p-3 rounded-md overflow-x-auto border mt-2">
                <code>{formatPayload(messageDetail.payload)}</code>
              </pre>
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
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className={`${
                      attempt.status === 'Success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attempt.status}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Status Code:</span>
                    <p>{attempt.responseStatusCode}</p>
                  </div>
                  <div>
                    <span className="font-medium">Trigger:</span>
                    <p>{attempt.triggerType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <p>{formatTimestamp(attempt.timestamp)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Endpoint URL:</span>
                  <p className="text-sm font-mono break-all">{attempt.url}</p>
                </div>
                {attempt.response.body && (
                  <div className="mt-2">
                    <span className="font-medium">Response:</span>
                    <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
                      <code>{attempt.response.body}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}