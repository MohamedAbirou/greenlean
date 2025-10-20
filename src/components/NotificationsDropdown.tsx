import type { Notification, NotificationType } from "@/types/notification";
import { motion } from "framer-motion";
import {
  Bell,
  Binoculars,
  BrushCleaning,
  EllipsisVertical,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { UserAvatar } from "./ui/UserAvatar";

const FILTERS: { label: string; value: NotificationType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Challenges", value: "challenge" },
  { label: "Rewards", value: "reward" },
];

interface NotificationsDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onNotificationClick,
  markAllAsRead,
  clearAll,
  unreadCount,
}) => {
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const navigate = useNavigate();

  const filtered = notifications.filter(
    (n) => filter === "all" || n.type === filter
  );

  const goToEntity = (notification: Notification) => {
    let url = "/";
    if (
      notification.entity_type === "challenge" ||
      notification.entity_type === "reward"
    )
      url = `/challenges#${notification.entity_id}`;

    onNotificationClick(notification);
    navigate(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="relative rounded-full p-2"
          aria-label="View notifications"
        >
          <motion.span
            animate={
              unreadCount > 0
                ? { rotate: [0, 10, -10, 10, -10, 0] }
                : { rotate: 0 }
            }
            transition={
              unreadCount > 0
                ? {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }
                : {}
            }
          >
            <Bell size={20} />
          </motion.span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 inline-flex items-center justify-center px-1 min-w-[16px] h-4 text-[0.6rem] font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-h-96 max-w-80 w-80" align="start">
        <DropdownMenuLabel className="flex items-center justify-between p-1">
          <span className="font-semibold text-sm">Notifications</span>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={markAllAsRead}
                  className="underline cursor-pointer"
                >
                  <Binoculars size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark All as Read</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAll}
                  className="underline px-2 cursor-pointer"
                >
                  <BrushCleaning size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear All</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-sm">
                  <EllipsisVertical size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 bg-background">
                {FILTERS.map((f) => (
                  <DropdownMenuItem
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={` ${
                      filter === f.value ? "font-semibold text-primary" : ""
                    } cursor-pointer`}
                  >
                    {f.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {filtered.length === 0 ? (
          <DropdownMenuItem>No notifications yet.</DropdownMenuItem>
        ) : (
          filtered.slice(0, 15).map((n) => (
            <DropdownMenuGroup key={n.id}>
              <span
                key={n.id}
                className={`w-full flex p-1 my-1 space-x-1 hover:bg-primary/10 rounded-sm border-b border-border text-left focus:outline-none transition-colors cursor-pointer ${
                  !n.read
                    ? "bg-background font-semibold"
                    : "hover:bg-background/80"
                }`}
                onClick={() => goToEntity(n)}
              >
                {n.sender_id && (
                  <UserAvatar
                    avatarUrl={null}
                    username={n.sender_id}
                    size="sm"
                  />
                )}
                <div className="flex-1">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="text-sm text-foreground truncate max-w-64">
                        {n.message}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">{n.message}</TooltipContent>
                  </Tooltip>
                  <div className="text-xs text-foreground/80 mt-1 ms-1">
                    {new Date(n.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {!n.read && (
                  <span className="ml-2 w-2 h-2 bg-primary rounded-full self-center"></span>
                )}
              </span>
            </DropdownMenuGroup>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
