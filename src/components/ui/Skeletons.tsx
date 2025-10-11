import React from "react";

export const CommentSkeleton: React.FC = () => (
  <div className="flex items-start space-x-3 animate-pulse">
    <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
    <div className="flex-grow space-y-2">
      <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-lg w-full" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
    </div>
  </div>
);

export const ReplySkeleton: React.FC = () => (
  <div className="ml-11 flex items-start space-x-3 animate-pulse">
    <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
    <div className="flex-grow">
      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg w-full" />
    </div>
  </div>
);
