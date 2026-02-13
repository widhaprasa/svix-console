"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { MessageActions } from "./message-actions";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { format } from "date-fns";

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

interface MessageRowProps {
  message: Message;
  appId: string;
  isExpanded: boolean;
  onToggleExpanded: (messageId: string) => void;
}

export function MessageRow({ message, appId, isExpanded, onToggleExpanded }: MessageRowProps) {
  const handleRowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleExpanded(message.id);
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "dd-MMM-yyyy HH:mm:ss.SSS");
  };

  const formatPayload = (payload: any) => {
    try {
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      return String(payload);
    }
  };

  return (
    <>
      <TableRow 
        key={message.id} 
        onClick={handleRowClick}
        className="cursor-pointer hover:bg-muted/50 border-b"
      >
        <TableCell className="text-sm">
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
            <span>{formatTimestamp(message.timestamp)}</span>
          </div>
        </TableCell>
        <TableCell className="text-sm font-medium">
          {message.eventType}
        </TableCell>
        <TableCell className="text-sm font-mono">
          <div className="truncate max-w-xs" title={message.eventId || message.id}>
            {message.eventId || message.id}
          </div>
        </TableCell>
        <TableCell className="text-sm font-mono">
          <div className="truncate max-w-xs" title={message.id}>
            {message.uid || message.id}
          </div>
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <MessageActions messageId={message.id} appId={appId} />
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={5} className="p-0 bg-muted/20">
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Payload:</h4>
                  <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto border">
                    <code>{formatPayload(message.payload)}</code>
                  </pre>
                </div>
                {message.channels && message.channels.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Channels:</h4>
                    <div className="flex flex-wrap gap-1">
                      {message.channels.map((channel, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {message.tags && Object.keys(message.tags).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(message.tags).map(([key, value]) => (
                        <span key={key} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}