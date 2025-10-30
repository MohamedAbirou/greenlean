import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import React from 'react';

const StatCard: React.FC<{ icon: LucideIcon; label: string; value: number | string; change?: string; trend?: "up" | "down"; color?: string; subtext?: string }> = ({ icon: Icon, label, value, change, trend, color, subtext }) => (
  <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color || "bg-accent"}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {change && (
        <span
          className={`flex items-center text-sm font-medium ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
              ? "text-red-600"
              : "text-muted-foreground"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          {change}
        </span>
      )}
    </div>
    <p className="text-sm text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-bold mb-1">{value}</p>
    {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
  </div>
);

export default StatCard;