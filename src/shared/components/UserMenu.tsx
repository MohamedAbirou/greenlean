import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { UserMenuItem } from "@/shared/utils/userMenuConfig";
import { userMenuGroups } from "@/shared/utils/userMenuConfig";
import { useHotkeys } from "react-hotkeys-hook";
import { Link, useNavigate } from "react-router-dom";

interface UserMenuProps {
  renderAvatar: () => React.ReactNode;
  renderUserMenu: () => React.ReactNode;
  handleSignOut: () => void;
  isAdmin: boolean;
}

export function UserMenu({ renderAvatar, renderUserMenu, handleSignOut, isAdmin }: UserMenuProps) {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  const handleMenuAction = (item: UserMenuItem) => {
    if ("action" in item && item.action === "signout") {
      handleSignOut();
    }
  };

  // Keyboard shortcuts
  useHotkeys("ctrl+alt+d", () => navigate("/dashboard"));
  useHotkeys("ctrl+alt+a", () => navigate("/admin"));
  useHotkeys("ctrl+alt+p", () => navigate("/profile/settings"));
  useHotkeys("ctrl+alt+q", () => navigate("/quiz-history"));
  useHotkeys("ctrl+alt+c", () => navigate("/challenges"));
  useHotkeys("ctrl+alt+l", handleSignOut);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-0 cursor-pointer rounded-full max-w-none dark:hover:bg-transparent hover:bg-transparent"
        >
          {renderAvatar()}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>{renderUserMenu()}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {userMenuGroups.map((group, index) => (
          <DropdownMenuGroup key={group.label}>
            {group.items
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => {
                const Icon = item.icon;
                const isLink = "to" in item;

                return (
                  <DropdownMenuItem
                    key={item.label}
                    className="hover:bg-background cursor-pointer"
                    onClick={() => handleMenuAction(item)}
                    asChild={isLink}
                  >
                    {isLink ? (
                      <Link to={item.to} className="flex items-center justify-between w-full ">
                        <div className="flex items-center gap-2">
                          <Icon size={18} />
                          {item.label}
                        </div>
                        {/* don't show shortcut when on mobile */}
                        {!isMobile && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between w-full cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Icon size={18} />
                          {item.label}
                        </div>
                        {/* don't show shortcut when on mobile */}
                        {!isMobile && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
                      </div>
                    )}
                  </DropdownMenuItem>
                );
              })}

            {index < userMenuGroups.length - 1 && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
