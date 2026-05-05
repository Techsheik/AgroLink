import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { CropCard } from "@/components/CropCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { buyerNavItems } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cropsApi, messagesApi, recommendationsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function BuyerDashboard() {
  const [recentCrops, setRecentCrops] = useState<any[]>([]);
  const [recommendedCrops, setRecommendedCrops] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    available: 0,
    saved: 0,
    requests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [allCrops, saved, requests, recs] = await Promise.all([
          cropsApi.getAll(),
          cropsApi.getSavedCrops().catch(() => []),
          messagesApi.getBuyerRequests().catch(() => []),
          recommendationsApi.getBuyerRecommendations().catch(() => []),
        ]);
        
        setRecentCrops(allCrops.slice(0, 6));
        setRecommendedCrops(recs.slice(0, 3));
        
        // Filter requests that need payment
        const needsPayment = requests.filter((r: any) => r.status?.toLowerCase() === "accepted" && !r.is_paid);
        setPendingPayments(needsPayment);

        setStats({
          available: allCrops.length,
          saved: saved.length,
          requests: requests.length,
        });
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch dashboard data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout navItems={buyerNavItems} title="Buyer Dashboard">
      <div className="space-y-8">
        <ScrollReveal>
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-primary rounded-3xl p-8 mb-8 text-white shadow-xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Live Market · Nigeria 🇳🇬
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight italic">
                  Find the <span className="text-emerald-200">Best Harvests</span> <br />
                  Across All 36 States
                </h1>
                <p className="text-white/80 text-sm font-medium max-w-md">
                  Browse fresh produce directly from verified local farmers at transparent market prices.
                </p>
              </div>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full font-bold px-8 shadow-lg shadow-black/10 group" asChild>
                <Link to="/buyer/marketplace">
                  Start Trading <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
              title="Available Crops" 
              value={isLoading ? "..." : stats.available.toString()} 
              change={isLoading ? "" : "+12 new today"} 
              trend="up" 
            />
            <StatCard 
              title="Saved Listings" 
              value={isLoading ? "..." : stats.saved.toString()} 
              change={stats.saved > 0 ? "Tracked items" : "No saved items"}
            />
            <StatCard 
              title="Active Requests" 
              value={isLoading ? "..." : stats.requests.toString()} 
              change={stats.requests > 0 ? "Pending farmer response" : "No active requests"} 
              trend="neutral" 
            />
          </div>
        </ScrollReveal>

        {pendingPayments.length > 0 && (
          <ScrollReveal delay={50}>
            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/30 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">Action Required</h2>
                  <p className="text-sm text-amber-700 dark:text-amber-400">You have {pendingPayments.length} accepted requests awaiting payment.</p>
                </div>
              </div>
              <div className="space-y-3">
                {pendingPayments.map((req) => (
                  <div key={req.id} className="bg-white dark:bg-background/50 rounded-lg p-4 border flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{req.crop_name}</p>
                      <p className="text-xs text-muted-foreground">Quantity: {req.quantity} units</p>
                    </div>
                    <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                      <Link to="/buyer/requests">
                        <CreditCard className="w-4 h-4" /> Pay Now
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={100}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/buyer/marketplace">View All <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCrops.length > 0 ? recommendedCrops.map((crop) => (
                <Link key={crop.crop_id} to={`/buyer/crop/${crop.crop_id}`}>
                  <CropCard
                    id={crop.crop_id}
                    name={crop.crop_name}
                    price={crop.price}
                    quantity={crop.quantity || 1}
                    unit={crop.unit}
                    location={crop.location}
                    farmer={crop.farmer_name}
                    category={crop.category || "Crops"}
                    description={crop.description || ""}
                    is_sold={false}
                    is_verified={crop.is_verified ?? true}
                    created_at={new Date().toISOString()}
                  />
                </Link>
              )) : (
                recentCrops.slice(0, 3).map((crop) => (
                  <Link key={crop.id} to={`/buyer/crop/${crop.id}`}>
                    <CropCard
                      id={crop.id}
                      name={crop.name}
                      price={crop.price_per_unit}
                      quantity={crop.quantity_available}
                      unit={crop.unit}
                      location={crop.location}
                      farmer={crop.owner_name}
                      category={crop.category}
                      description={crop.description}
                      is_sold={crop.is_sold}
                      is_verified={crop.is_owner_verified}
                      created_at={crop.created_at}
                    />
                  </Link>
                ))
              )}
              {!isLoading && recentCrops.length === 0 && recommendedCrops.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full py-8 text-center bg-muted/30 rounded-lg">No crops available at the moment.</p>
              )}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Listings</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/buyer/marketplace">Browse <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCrops.slice(3, 6).map((crop) => (
                <Link key={crop.id} to={`/buyer/crop/${crop.id}`}>
                  <CropCard
                    id={crop.id}
                    name={crop.name}
                    price={crop.price_per_unit}
                    quantity={crop.quantity_available}
                    unit={crop.unit}
                    location={crop.location}
                    farmer={crop.owner_name}
                    category={crop.category}
                    description={crop.description}
                    is_sold={crop.is_sold}
                    is_verified={crop.is_owner_verified}
                    created_at={crop.created_at}
                  />
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
