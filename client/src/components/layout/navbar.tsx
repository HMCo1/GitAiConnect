import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Search, ChevronDown, Github } from "lucide-react";
import { ActivityFeed } from "@/components/activity/activity-feed";

export function Navbar() {
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/activities", { limit: 10 }],
  });

  const unreadCount = 3; // This would come from actual notification system

  return (
    <nav className="bg-white border-b border-github-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Github className="h-6 w-6" />
          <span className="text-xl font-semibold">AI Code Intelligence</span>
        </div>
        <div className="hidden md:flex items-center space-x-1 bg-github-bg rounded-md px-3 py-1">
          <Search className="h-4 w-4 text-github-text" />
          <Input
            type="text"
            placeholder="Search repositories, code, users..."
            className="bg-transparent border-0 outline-0 text-sm w-80 focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80">
            <div className="space-y-4">
              <h3 className="font-semibold text-github-dark">Notifications</h3>
              <ActivityFeed activities={activities?.slice(0, 5) || []} />
            </div>
          </SheetContent>
        </Sheet>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.username?.slice(0, 2).toUpperCase() || "JD"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:block">
                {user?.username || "Loading..."}
              </span>
              <ChevronDown className="h-3 w-3 text-github-text" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>GitHub Integration</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
