import React from 'react';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;
