"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ApplicationActionsProps {
  applicationId: string;
  applicationName: string;
}

export function ApplicationActions({ applicationId, applicationName }: ApplicationActionsProps) {
  const router = useRouter();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [messageId, setMessageId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearchModal && inputRef.current) {
      // Use setTimeout to ensure the modal is fully rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select(); // Also select the text if any
      }, 200);
    }
  }, [showSearchModal]);

  const handleMessage = (applicationId: string) => {
    // Navigate to messages page for this application
    window.location.href = `/messages?appId=${applicationId}`;
  };

  const handleEndpoint = (applicationId: string) => {
    // Navigate to endpoints page for this application
    window.location.href = `/endpoints?appId=${applicationId}`;
  };

  const handleSearchMessage = (applicationId: string) => {
    setShowSearchModal(true);
  };

  const handleSearchSubmit = () => {
    if (messageId.trim()) {
      router.push(`/messages/${messageId.trim()}?appId=${applicationId}`);
      setShowSearchModal(false);
      setMessageId("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when dropdown is clicked
  };

  return (
    <>
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
            <DropdownMenuItem onClick={() => handleMessage(applicationId)}>
              Messages
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSearchMessage(applicationId)}>
              Search Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEndpoint(applicationId)}>
              Endpoints
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Message Modal */}
      {showSearchModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setShowSearchModal(false);
            setMessageId("");
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-left">Search Message</h3>
            <p className="text-gray-600 mb-4 break-words whitespace-normal leading-relaxed text-left">
              Enter the Message Id to view message details for application {applicationId}
            </p>
            <div className="space-y-4">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Message Id"
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSearchModal(false);
                    setMessageId("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSearchSubmit}
                  disabled={!messageId.trim()}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}