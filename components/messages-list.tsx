"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateTimeRangePicker } from "@/components/date-time-range-picker";
import { MessageRow } from "./message-row";

type Message = {
  id: string;
  eventType: string;
  eventId?: string;
  payload: any;
  channels?: string[];
  tags?: Record<string, string>;
  timestamp: string;
  uid?: string;
};

type ApiResponse = {
  data: Message[];
  iterator: string | null;
  done: boolean;
  count: number;
  error?: string;
};

const ITEMS_PER_PAGE = 50;

// Get default start date (15 minutes ago)
const getDefaultStartDate = (): Date => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - 15);
  return date;
};

// Get default end date (now)
const getDefaultEndDate = (): Date => {
  return new Date();
};

async function fetchMessages(
  appId: string, 
  startDate?: string, 
  endDate?: string, 
  iterator?: string
): Promise<ApiResponse> {
  try {
    const params = new URLSearchParams({
      appId,
      limit: ITEMS_PER_PAGE.toString(),
    });

    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }
    if (iterator) {
      params.append('iterator', iterator);
    }

    const response = await fetch(`/api/messages?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      data: [],
      iterator: null,
      done: true,
      count: 0,
      error: 'Failed to fetch messages'
    };
  }
}

interface MessagesListProps {
  appId: string;
}

export function MessagesList({ appId }: MessagesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get dates from URL params or use defaults
  const getInitialStartDate = (): Date => {
    const paramStart = searchParams.get('startDate');
    return paramStart ? new Date(paramStart) : getDefaultStartDate();
  };
  
  const getInitialEndDate = (): Date => {
    const paramEnd = searchParams.get('endDate');
    return paramEnd ? new Date(paramEnd) : getDefaultEndDate();
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(getInitialStartDate());
  const [endDate, setEndDate] = useState<Date>(getInitialEndDate());
  const [currentIterator, setCurrentIterator] = useState<string | null>(null);
  const [nextIterator, setNextIterator] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleExpandedRow = (messageId: string) => {
    setExpandedRowId(expandedRowId === messageId ? null : messageId);
  };

  // Update URL with new dates and reload
  const updateUrlAndReload = (newStartDate: Date, newEndDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('startDate', newStartDate.toISOString());
    params.set('endDate', newEndDate.toISOString());
    
    // Keep the existing appId
    if (appId) params.set('appId', appId);
    
    // Navigate to the new URL which will trigger a reload
    router.push(`?${params.toString()}`);
  };

  // Load more messages using iterator (for pagination)
  const loadMoreMessages = async (iterator: string) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await fetchMessages(appId, startDate.toISOString(), endDate.toISOString(), iterator);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      setMessages(prev => [...prev, ...result.data]);
      setNextIterator(result.iterator);
      setHasMore(!result.done && result.data.length > 0);
    } catch (err) {
      setError('Failed to load more messages');
      console.error('Error loading more messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages when component mounts or URL params change
  useEffect(() => {
    const urlStartDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : getDefaultStartDate();
    const urlEndDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : getDefaultEndDate();
    
    setStartDate(urlStartDate);
    setEndDate(urlEndDate);
    setMessages([]);
    setCurrentIterator(null);
    setNextIterator(null);
    
    // Load messages with the URL parameters
    const loadInitialMessages = async () => {
      if (loading) return;
      
      setLoading(true);
      setError(null);

      try {
        const result = await fetchMessages(appId, urlStartDate.toISOString(), urlEndDate.toISOString());
        
        if (result.error) {
          setError(result.error);
          return;
        }

        setMessages(result.data);
        setNextIterator(result.iterator);
        setHasMore(!result.done && result.data.length > 0);
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialMessages();
  }, [appId, searchParams]);

  // Handle date changes - update URL to trigger reload
  const handleDateTimeRangeUpdate = (values: { range: { from: Date | undefined; to: Date | undefined } }) => {
    if (values.range.from && values.range.to) {
      updateUrlAndReload(values.range.from, values.range.to);
    }
  };

  // Handle next page
  const handleNext = () => {
    if (nextIterator && !loading && hasMore) {
      setCurrentIterator(nextIterator);
      loadMoreMessages(nextIterator);
    }
  };

  // Handle refresh - reload current date range from URL
  const handleRefresh = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Messages
          </h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <DateTimeRangePicker
          onUpdate={handleDateTimeRangeUpdate}
          initialDateFrom={startDate}
          initialDateTo={endDate}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5">Time</TableHead>
              <TableHead className="w-1/5">Event Type</TableHead>
              <TableHead className="w-1/5">Event Id</TableHead>
              <TableHead className="w-1/5">Message Id</TableHead>
              <TableHead className="w-1/5 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading messages...
                </TableCell>
              </TableRow>
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No messages found for the selected date range.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <MessageRow 
                  key={message.id} 
                  message={message} 
                  appId={appId} 
                  isExpanded={expandedRowId === message.id}
                  onToggleExpanded={toggleExpandedRow}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex items-center justify-center">
          <button
            disabled={loading}
            onClick={handleNext}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}