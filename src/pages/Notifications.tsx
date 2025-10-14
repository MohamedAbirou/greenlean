import React, { useState } from "react";
import NotificationsDropdown from "../components/NotificationsDropdown";
import { useNotifications } from "../hooks/useNotifications";
import { Notification, NotificationType } from "../types/notification";

const FILTERS: { label: string; value: NotificationType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Likes", value: "like" },
  { label: "Comments", value: "comment" },
  { label: "Replies", value: "reply" },
  { label: "Mentions", value: "mention" },
  { label: "Challenges", value: "challenge" },
];

const NotificationsPage: React.FC = () => {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  const filtered = notifications.filter((n) => filter === "all" || n.type === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="text-green-600 font-medium hover:underline"
        >
          Mark all as read
        </button>
      </div>
      <div className="flex gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`px-3 py-1 rounded-full text-sm ${filter===f.value ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            onClick={()=>setFilter(f.value)}
          >{f.label}</button>
        ))}
      </div>
      <div>
        <NotificationsDropdown
          notifications={filtered}
          onNotificationClick={(n: Notification) => markAsRead(n.id)}
        />
      </div>
    </div>
  );
};
export default NotificationsPage;
