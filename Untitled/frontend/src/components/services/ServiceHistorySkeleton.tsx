import React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-spinner';

const ServiceHistorySkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-6 w-24" />
      </div>
      
      {/* Service history items skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="space-y-3">
              {/* Service title and status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <LoadingSkeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <LoadingSkeleton className="h-4 w-32" />
                    <LoadingSkeleton className="h-3 w-24" />
                  </div>
                </div>
                <LoadingSkeleton className="h-6 w-20 rounded-full" />
              </div>
              
              {/* Service details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <LoadingSkeleton className="h-3 w-16" />
                  <LoadingSkeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <LoadingSkeleton className="h-3 w-16" />
                  <LoadingSkeleton className="h-4 w-20" />
                </div>
                <div className="space-y-2">
                  <LoadingSkeleton className="h-3 w-16" />
                  <LoadingSkeleton className="h-4 w-28" />
                </div>
                <div className="space-y-2">
                  <LoadingSkeleton className="h-3 w-16" />
                  <LoadingSkeleton className="h-4 w-20" />
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2 pt-2">
                <LoadingSkeleton className="h-8 w-20" />
                <LoadingSkeleton className="h-8 w-24" />
                <LoadingSkeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceHistorySkeleton;
