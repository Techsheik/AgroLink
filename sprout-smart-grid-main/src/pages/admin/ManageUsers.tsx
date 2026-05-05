import { DashboardLayout } from "@/components/DashboardLayout";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { adminNavItems } from "@/constants/navigation";
import { ShieldCheck, Search, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function ManageUsers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "FARMER" | "BUYER">("All");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleExtend = async (userId: number, days: number) => {
    try {
      await adminApi.extendSubscription(userId, days);
      toast({ title: "Success", description: `Added ${days} days to user's subscription.` });
      fetchUsers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to extend subscription", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || u.role?.toUpperCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout navItems={adminNavItems} title="Manage Users">
      <div className="space-y-6">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              {(["All", "FARMER", "BUYER"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                    filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {f.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Verification</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Subscription</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Expiry</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="p-8 text-center italic text-muted-foreground">Loading users...</td></tr>
                  ) : filteredUsers.map((u) => {
                    const isTrialOver = new Date(u.trial_start_date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    const isSubscribed = u.is_subscribed;
                    const expiryDate = u.subscription_expiry ? new Date(u.subscription_expiry) : null;
                    const isExpired = expiryDate && expiryDate < new Date();

                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="font-medium text-foreground">{u.full_name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                            u.role?.toUpperCase() === "FARMER" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
                          }`}>{u.role}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-medium ${
                            u.is_verified ? "text-stat-up" : "text-amber-500"
                          }`}>{u.is_verified ? "Verified" : "Pending"}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs font-bold ${
                              isSubscribed ? "text-stat-up" : "text-muted-foreground"
                            }`}>
                              {isSubscribed ? "SUBSCRIBED" : isTrialOver ? "TRIAL EXPIRED" : "FREE TRIAL"}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              Joined {new Date(u.trial_start_date).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {expiryDate ? (
                            <div className={`text-xs font-medium ${isExpired ? "text-destructive" : "text-foreground"}`}>
                              {expiryDate.toLocaleDateString()}
                              {isExpired && " (Expired)"}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-xs gap-1.5"
                              onClick={() => handleExtend(u.id, 30)}
                            >
                              <Clock className="w-3 h-3" /> +30 Days
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-xs gap-1.5"
                              onClick={() => handleExtend(u.id, 7)}
                            >
                              <Clock className="w-3 h-3" /> +7 Days
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
