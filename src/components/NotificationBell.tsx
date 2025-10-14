import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import React from "react";

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="View notifications"
    >
      <motion.span
        initial={{ rotate: 0 }}
        animate={unreadCount > 0 ? { rotate: [-10, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="inline-block px-1 rounded-full text-gray-700 dark:text-gray-300"
      >
        <Bell size={17}  />
      </motion.span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1 min-w-[16px] h-4 text-[0.6rem] font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
