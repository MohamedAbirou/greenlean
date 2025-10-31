import {
  Activity,
  Award,
  BarChart3,
  ChevronLeft,
  DollarSign,
  FileText,
  Gift,
  LayoutDashboard,
  Menu,
  Settings,
  Trophy,
  Users
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const navigation = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "users", name: "Users", icon: Users },
  { id: "subscriptions", name: "Subscriptions", icon: DollarSign },
  { id: "plans", name: "Plans & Quizzes", icon: FileText },
  { id: "challenges", name: "Challenges", icon: Trophy },
  { id: "badges", name: "Badges", icon: Award },
  { id: "rewards", name: "Rewards", icon: Gift },
  { id: "system", name: "System Health", icon: Activity },
  { id: "settings", name: "Settings", icon: Settings },
];

const SidebarNav = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <aside
      className={`${
        sidebarOpen ? "w-52" : "w-14"
      } bg-card border-r border-border transition-all duration-300 flex flex-col items-center shadow-lg`}
    >
      <div className="w-full px-2 py-2 border-b border-border flex items-center justify-between">
        {sidebarOpen && (
          <Link to="/" className="flex items-center gap-2">
            <img src="/leaf.svg" alt="Logo" className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold text-primary">GreenLean</span>
          </Link>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-accent rounded-sm transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 w-full flex-col items-center justify-center my-4 px-2 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-sm transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarNav;
