import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export interface MealTabsProps {
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

export const MealTabs: React.FC<MealTabsProps> = ({
  currentTab,
  onTabChange,
  tabs,
  tabPanels,
}) => {
  const activeIndex = tabs.findIndex((t) => t.name === currentTab);

  return (
    <>
      <nav
        className="flex overflow-auto gap-2 bg-background p-2 rounded-md backdrop-blur-sm border border-border mb-4"
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={currentTab === tab.name}
            tabIndex={currentTab === tab.name ? 0 : -1}
            onClick={() => onTabChange(tab.name)}
            className={`flex-1 px-4 py-3 cursor-pointer rounded-lg font-semibold transition-all outline-none focus:ring-2 ${
              tab.ringColor
            } ${
              currentTab === tab.name
                ? `bg-gradient-to-r ${tab.bg} text-white shadow-lg`
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
          </button>
        ))}
      </nav>
      <AnimatePresence mode="wait">
          <motion.div
            key={`${currentTab}-${activeIndex}`} // animate when tab changes
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Panel */}
            {tabPanels[activeIndex]}
          </motion.div>
      </AnimatePresence>
    </>
  );
};
