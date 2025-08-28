import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, Zap } from 'lucide-react';

interface PerformanceMetrics {
  fetchTime: number;
  dataSize: number;
  timestamp: Date;
}

interface PerformanceMonitorProps {
  isLoading: boolean;
  dataCount: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isLoading,
  dataCount,
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && !startTime) {
      setStartTime(performance.now());
    } else if (!isLoading && startTime) {
      const fetchTime = performance.now() - startTime;
      const newMetrics: PerformanceMetrics = {
        fetchTime,
        dataSize: dataCount,
        timestamp: new Date()
      };
      
      setMetrics(newMetrics);
      setStartTime(null);
      
      if (onMetricsUpdate) {
        onMetricsUpdate(newMetrics);
      }
    }
  }, [isLoading, startTime, dataCount, onMetricsUpdate]);

  if (!metrics) return null;

  const getPerformanceColor = (time: number) => {
    if (time < 500) return 'bg-green-100 text-green-800';
    if (time < 1000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (time: number) => {
    if (time < 500) return 'Fast';
    if (time < 1000) return 'Good';
    return 'Slow';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">Performance Metrics</h3>
        <Zap className="w-4 h-4 text-blue-500" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Fetch Time</span>
          </div>
          <Badge className={getPerformanceColor(metrics.fetchTime)}>
            {metrics.fetchTime.toFixed(0)}ms - {getPerformanceLabel(metrics.fetchTime)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Data Size</span>
          </div>
          <Badge variant="outline">
            {metrics.dataSize} items
          </Badge>
        </div>
        
        <div className="text-xs text-gray-500 text-right">
          {metrics.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
