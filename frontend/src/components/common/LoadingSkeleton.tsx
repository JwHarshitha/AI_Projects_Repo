import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 4,
  height = 'h-8',
}) => {
  return (
    <div className="space-y-3 animate-pulse w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`w-full bg-slate-800/60 rounded-lg ${height}`}
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
};
