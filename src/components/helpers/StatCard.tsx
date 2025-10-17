import React from 'react';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="bg-card rounded-xl p-6 shadow-md">
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <p className="text-sm text-foreground/80">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;