import Link from "next/link";

interface ToolbarProps {
  currentPage: string;
  id?: string;
  parentPath?: string;
}

export function Toolbar({ currentPage, id, parentPath }: ToolbarProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-14 items-center px-4 space-x-4">
          <Link href="/" className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer">
            SVIX Console
          </Link>
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
        </div>
      </div>
    </div>
  );
}