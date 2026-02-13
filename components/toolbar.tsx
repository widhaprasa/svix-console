"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ToolbarProps {
  currentPage?: string;
  id?: string;
  parentPath?: string;
  showLogout?: boolean;
}

export function Toolbar({ currentPage, id, parentPath, showLogout = true }: ToolbarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/login');
        router.refresh(); // Refresh to update auth state
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer">
              SVIX Console
            </Link>
            {currentPage && (
              <>
                <span className="text-gray-400">/</span>
                {id && parentPath ? (
                  <Link href={parentPath} className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                    {currentPage}
                  </Link>
                ) : (
                  <span className="text-gray-600">{currentPage}</span>
                )}
                {id && (
                  <>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">
                      {id.length > 32 ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}` : id}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
          
          {showLogout && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? 'Signing out...' : 'Sign out'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}