import React from "react";

export const CommentSkeleton: React.FC = () => (
  <div className="flex items-start space-x-3 animate-pulse">
    <div className="w-7 h-7 rounded-full bg-card flex-shrink-0" />
    <div className="flex-grow space-y-2">
      <div className="h-12 bg-card rounded-lg w-full" />
      <div className="h-3 bg-button rounded w-24" />
    </div>
  </div>
);

export const ReplySkeleton: React.FC = () => (
  <div className="ml-11 flex items-start space-x-3 animate-pulse">
    <div className="w-7 h-7 rounded-full bg-card flex-shrink-0" />
    <div className="flex-grow">
      <div className="h-10 bg-card rounded-lg w-full" />
    </div>
  </div>
);

export const PhotoCardSkeleton: React.FC = () => (
  <div className="bg-background rounded-lg shadow-sm overflow-hidden max-w-sm mx-auto animate-pulse">
    <div className="p-4 flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-card flex-shrink-0" />
      <div className="flex-grow space-y-2">
        <div className="h-4 bg-card rounded w-32" />
        <div className="h-3 bg-button rounded w-24" />
      </div>
    </div>

    <div className="w-full aspect-square bg-card" />

    <div className="p-4 space-y-3">
      <div className="flex items-center space-x-4">
        <div className="h-6 w-16 bg-card rounded" />
        <div className="h-6 w-16 bg-card rounded" />
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-button rounded w-3/4" />
        <div className="h-3 bg-button rounded w-24" />
      </div>
    </div>
  </div>
);
