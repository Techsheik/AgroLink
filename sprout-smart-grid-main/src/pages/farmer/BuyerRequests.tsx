import { DashboardLayout } from "@/components/DashboardLayout";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { farmerNavItems } from "@/constants/navigation";
import { Check, X, MessageCircle, CreditCard, ShieldCheck, Eye, Truck, Package, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { messagesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function BuyerRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const data = await messagesApi.getFarmerRequests();
      setRequests(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch buyer requests.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await messagesApi.updateRequestStatus(id, status);
      toast({ title: "Success", description: `Request ${status} successfully.` });
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update status", variant: "destructive" });
    }
  };

  const handleVerifyPayment = async (id: number) => {
    try {
      await messagesApi.verifyPayment(id);
      toast({ title: "Success", description: "Payment verified! You can now start delivery." });
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to verify payment", variant: "destructive" });
    }
  };

  const handleDeliveryUpdate = async (id: number, status: string) => {
    try {
      await messagesApi.updateDelivery(id, { status });
      toast({ title: "Status Updated", description: `Order status set to ${status}.` });
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update delivery", variant: "destructive" });
    }
  };

  if (isLoading && requests.length === 0) {
    return (
      <DashboardLayout navItems={farmerNavItems} title="Buyer Requests">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={farmerNavItems} title="Buyer Requests">
      <div className="space-y-6">
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border p-5">
              <div className="text-xs text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{requests.filter(r => r.status?.toLowerCase() === "pending").length}</div>
            </div>
            <div className="bg-card rounded-lg border p-5">
              <div className="text-xs text-muted-foreground mb-1">Accepted</div>
              <div className="text-2xl font-bold text-stat-up tabular-nums">{requests.filter(r => r.status?.toLowerCase() === "accepted").length}</div>
            </div>
            <div className="bg-card rounded-lg border p-5">
              <div className="text-xs text-muted-foreground mb-1">Declined</div>
              <div className="text-2xl font-bold text-muted-foreground tabular-nums">{requests.filter(r => r.status?.toLowerCase() === "rejected" || r.status?.toLowerCase() === "declined").length}</div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {req.buyer_name ? req.buyer_name.split(" ").map((n: string) => n[0]).join("") : "B"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{req.buyer_name || "Buyer"}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          req.status?.toLowerCase() === "pending" ? "bg-accent/20 text-accent-foreground" :
                          req.status?.toLowerCase() === "accepted" ? "bg-stat-up/10 text-stat-up" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {(req.status || "pending").charAt(0).toUpperCase() + (req.status || "pending").slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Wants <span className="font-medium text-foreground">{req.quantity} units</span> of{" "}
                        <span className="font-medium text-foreground">{req.crop_name}</span>
                      </p>
                      {req.message && <p className="text-sm text-muted-foreground mt-2 leading-relaxed italic">"{req.message}"</p>}
                      
                      {req.status?.toLowerCase() === "accepted" && req.is_paid && !req.payment_verified && (
                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-bold">PAYMENT RECEIVED</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">Buyer has uploaded proof of payment. Please verify it before completing the order.</p>
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => handleVerifyPayment(req.id)}>
                              <ShieldCheck className="w-3.5 h-3.5" /> Verify Now
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 gap-1.5" asChild>
                              <a href={req.payment_proof_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-3.5 h-3.5" /> View Proof
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      {req.status?.toLowerCase() === "accepted" && req.payment_verified && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                            <Truck className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Delivery Logistics</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs text-muted-foreground">Current Status:</span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 capitalize">
                              {req.delivery_status?.toLowerCase().replace("_", " ") || "Processing"}
                            </span>
                          </div>

                          {req.delivery_status?.toLowerCase() !== "confirmed" ? (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-[10px] sm:text-xs gap-1"
                                disabled={req.delivery_status?.toLowerCase() === "shipped"}
                                onClick={() => handleDeliveryUpdate(req.id, "shipped")}
                              >
                                <Package className="w-3 h-3" /> Mark Shipped
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-[10px] sm:text-xs gap-1"
                                disabled={req.delivery_status?.toLowerCase() === "in_transit"}
                                onClick={() => handleDeliveryUpdate(req.id, "in_transit")}
                              >
                                <Truck className="w-3 h-3" /> In Transit
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8 text-[10px] sm:text-xs gap-1 bg-blue-600 hover:bg-blue-700 col-span-2"
                                disabled={req.delivery_status?.toLowerCase() === "delivered"}
                                onClick={() => handleDeliveryUpdate(req.id, "delivered")}
                              >
                                <CheckCircle className="w-3 h-3" /> Mark Delivered
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold py-1 mt-1 border-t border-emerald-100 dark:border-emerald-900/30 pt-3">
                              <ShieldCheck className="w-4 h-4" /> TRANSACTION COMPLETED & CONFIRMED
                            </div>
                          )}
                        </div>
                      )}

                      <span className="text-xs text-muted-foreground mt-2 block">{req.created_at ? new Date(req.created_at).toLocaleString() : "N/A"}</span>
                    </div>
                  </div>

                  {req.status?.toLowerCase() === "pending" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-stat-up border-stat-up/30 hover:bg-stat-up/10"
                        onClick={() => handleStatusUpdate(req.id, "accepted")}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleStatusUpdate(req.id, "rejected")}
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Decline
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/farmer/messages?with=${req.buyer_id}`}>
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                        req.status?.toLowerCase() === "accepted" 
                          ? "text-stat-up border-stat-up/20 bg-stat-up/5" 
                          : "text-destructive border-destructive/20 bg-destructive/5"
                      }`}>
                        {req.status?.toLowerCase()}
                      </span>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/farmer/messages?with=${req.buyer_id}`}>
                          <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Chat
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No purchase requests yet.</p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
