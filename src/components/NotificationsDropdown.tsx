import type { Notification } from "@/types/notification";
import classNames from "classnames";
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "./ui/UserAvatar";

interface NotificationsDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onNotificationClick,
}) => {
  const navigate = useNavigate();

  const goToEntity = (notification: Notification) => {
    let url = "/";
    // Simple logic. Expand for your routes as needed
    if (notification.entity_type === "post")
      url = `/community#${notification.entity_id}`;
    else if (notification.entity_type === "comment")
      url = `/community#${notification.entity_id}`;
    else if (notification.entity_type === "challenge")
      url = `/challenges#${notification.entity_id}`;
    onNotificationClick(notification);
    navigate(url);
  };

  return (
    <div className="absolute mt-2 right-0 sm:w-96 max-w-[95vw] rounded-t-xl sm:rounded-xl shadow-lg z-50 bg-background overflow-hidden">
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 && (
          <div className="px-6 py-8 text-center text-foreground/80">
            No notifications yet.
          </div>
        )}
        {notifications.slice(0, 15).map((n) => (
          <button
            key={n.id}
            className={classNames(
              "w-full flex gap-3 py-3 px-4 border-b border-border text-left focus:outline-none transition-colors cursor-pointer",
              {
                "bg-card font-semibold": !n.read,
                "hover:bg-card/80": true,
              }
            )}
            onClick={() => goToEntity(n)}
          >
            <UserAvatar avatarUrl={null} username={n.sender_id} size="sm" />
            <div className="flex-1">
              <div className=" text-sm text-wrap text-foreground">
                {n.message}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(n.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {!n.read && (
              <span className="w-2 h-2 bg-primary rounded-full self-center"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
