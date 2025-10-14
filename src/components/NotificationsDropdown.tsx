import classNames from "classnames";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from "../types/notification";
import { UserAvatar } from "./ui/UserAvatar";

interface NotificationsDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ notifications, onNotificationClick }) => {
  const navigate = useNavigate();

  const goToEntity = (notification: Notification) => {
    let url = "/";
    // Simple logic. Expand for your routes as needed
    if (notification.entity_type === "post") url = `/community#${notification.entity_id}`;
    else if (notification.entity_type === "comment") url = `/community#${notification.entity_id}`;
    else if (notification.entity_type === "challenge") url = `/challenges#${notification.entity_id}`;
    onNotificationClick(notification);
    navigate(url);
  };

  return (
    <div className="absolute right-0 mt-3 w-96 rounded-xl shadow-lg z-99 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
            No notifications yet.
          </div>
        )}
        {notifications.slice(0, 15).map((n) => (
          <button
            key={n.id}
            className={classNames(
              "w-full flex gap-3 py-3 px-4 border-b border-gray-100 dark:border-gray-700 text-left focus:outline-none transition-colors",
              {
                "bg-gray-50 dark:bg-gray-800 font-semibold": !n.read,
                "hover:bg-gray-100 dark:hover:bg-gray-700": true,
              }
            )}
            onClick={() => goToEntity(n)}
          >
            <UserAvatar avatarUrl={null} username={n.sender_id} size="sm" />
            <div className="flex-1">
              <div className=" text-sm text-wrap dark:text-gray-100">{n.message}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            {!n.read && <span className="w-2 h-2 bg-green-500 rounded-full self-center"></span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
