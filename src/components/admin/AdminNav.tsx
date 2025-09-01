import { Award, BarChart2, Settings, Trophy, Users } from 'lucide-react';
import React from 'react';
import { ColorTheme } from '../../utils/colorUtils';

interface AdminNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  colorTheme: ColorTheme;
}

const AdminNav: React.FC<AdminNavProps> = ({ activeTab, setActiveTab, colorTheme }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-8">
      <div className="flex overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-4 border-b-2 transition-colors ${
              activeTab === tab.id
                ? `${colorTheme.primaryBorder} ${colorTheme.primaryText}`
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="h-5 w-5 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminNav;