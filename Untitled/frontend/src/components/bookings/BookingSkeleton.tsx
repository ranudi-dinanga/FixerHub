import React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-spinner';

const BookingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-6 w-24" />
      </div>
      
      {/* Table skeleton */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        
        {/* Table rows skeleton */}
        {[...Array(5)].map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b last:border-b-0">
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, colIndex) => (
                <div key={colIndex} className="flex items-center">
                  {colIndex === 0 ? (
                    <div className="flex items-center space-x-3">
                      <LoadingSkeleton className="h-8 w-8 rounded-full" />
                      <LoadingSkeleton className="h-4 w-24" />
                    </div>
                  ) : colIndex === 5 ? (
                    <LoadingSkeleton className="h-6 w-16 rounded-full" />
                  ) : colIndex === 6 ? (
                    <div className="flex space-x-2">
                      <LoadingSkeleton className="h-8 w-16" />
                      <LoadingSkeleton className="h-8 w-16" />
                    </div>
                  ) : (
                    <LoadingSkeleton className="h-4 w-20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingSkeleton;
