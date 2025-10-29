import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useMemo } from "react";

export interface WorkoutTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  tabs: {
    name: string;
    bg: string;
    color: string;
    ringColor: string;
  }[];
  tabPanels: React.ReactNode[];
}

const TabButton = React.memo<{
  tab: { name: string; bg: string; color: string; ringColor: string };
  isActive: boolean;
  onClick: () => void;
}>(({ tab, isActive, onClick }) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    tabIndex={isActive ? 0 : -1}
    onClick={onClick}
    className={`flex-1 px-4 py-3 cursor-pointer rounded-lg font-semibold transition-all outline-none focus:ring-2 ${
      tab.ringColor
    } ${
      isActive
        ? `bg-gradient-to-r ${tab.bg} text-white shadow-lg`
        : "text-muted-foreground hover:bg-secondary"
    }`}
  >
    {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
  </button>
));

TabButton.displayName = "TabButton";

export const WorkoutTabs: React.FC<WorkoutTabsProps> = React.memo(
  ({ currentTab, onTabChange, tabs, tabPanels }) => {
    const activeIndex = useMemo(
      () => tabs.findIndex((t) => t.name === currentTab),
      [tabs, currentTab]
    );

    const handleTabClick = useCallback(
      (tabName: string) => () => onTabChange(tabName),
      [onTabChange]
    );

    return (
      <>
        <nav
          className="flex overflow-auto gap-2 bg-background p-2 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 mb-4"
          role="tablist"
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.name}
              tab={tab}
              isActive={currentTab === tab.name}
              onClick={handleTabClick(tab.name)}
            />
          ))}
        </nav>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {tabPanels[activeIndex]}
          </motion.div>
        </AnimatePresence>
      </>
    );
  }
);

WorkoutTabs.displayName = "WorkoutTabs";
