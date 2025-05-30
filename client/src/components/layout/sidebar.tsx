import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  GitBranch, 
  Bot, 
  Settings, 
  BarChart3,
  Book
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Repositories", href: "/repositories", icon: GitBranch },
  { name: "AI Analysis", href: "/analysis", icon: Bot },
  { name: "Workflows", href: "/workflows", icon: Settings },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();

  const { data: repositories } = useQuery({
    queryKey: ["/api/repositories"],
  });

  const { data: workflows } = useQuery({
    queryKey: ["/api/workflows"],
  });

  const recentRepos = (repositories as any[])?.slice(0, 3) || [];

  return (
    <aside className="w-60 bg-white border-r border-github-border">
      <div className="p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-github-blue text-white"
                      : "text-github-text hover:bg-github-bg hover:text-github-dark"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.name === "Repositories" && repositories && (
                    <Badge variant="secondary" className="ml-auto">
                      {(repositories as any[]).length}
                    </Badge>
                  )}
                  {item.name === "Workflows" && workflows && (
                    <Badge 
                      className="ml-auto bg-green-100 text-green-800"
                    >
                      {(workflows as any[]).filter((w: any) => w.isActive).length}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {recentRepos.length > 0 && (
        <div className="p-4 border-t border-github-border">
          <h3 className="text-sm font-semibold text-github-text mb-2">
            Recent Repositories
          </h3>
          <div className="space-y-2">
            {recentRepos.map((repo: any) => (
              <div
                key={repo.id}
                className="flex items-center space-x-2 p-2 rounded hover:bg-github-bg cursor-pointer"
              >
                <Book className="h-4 w-4 text-github-text" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{repo.name}</div>
                  <div className="text-xs text-github-text">
                    Updated {new Date(repo.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
