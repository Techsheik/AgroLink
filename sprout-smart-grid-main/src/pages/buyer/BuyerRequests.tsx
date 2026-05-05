import { DashboardLayout } from "@/components/DashboardLayout";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { buyerNavItems } from "@/constants/navigation";
import { CreditCard, MessageCircle, Clock, CheckCircle2, AlertCircle, PackageCheck, Upload, Eye } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { messagesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { DeliveryStepper, type DeliveryStatus } from "@/components/DeliveryStepper";
import { supabase } from "@/lib/supabase";

export default function BuyerRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const data = await messagesApi.getBuyerRequests();
      setRequests(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch your requests.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handlePaymentClick = (requestId: number) => {
    setIsUploading(requestId);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, requestId: number) => {
    const file = e.target.files?.[0];
    if (!file) {
      setIsUploading(null);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `payment_${requestId}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);

      await messagesApi.uploadPaymentProof(requestId, publicUrl);
      
      toast({ 
        title: "Payment Submitted", 
        description: "Your receipt has been uploaded. The farmer will verify it soon." 
      });
      fetchRequests();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ 
        title: "Upload Failed", 
        description: error.message || "Failed to upload receipt", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmReceipt = async (requestId: number) => {
    if (!confirm("Are you sure you have received this delivery? This will finalize the transaction.")) return;
    
    try {
      await messagesApi.confirmReceipt(requestId);
      toast({ title: "Delivery Confirmed", description: "Thank you for shopping with AgroLink!" });
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to confirm receipt", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout navItems={buyerNavItems} title="My Purchase Requests">
      <div className="space-y-6">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => isUploading && handleFileUpload(e, isUploading)}
        />
        <ScrollReveal>
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Track Your Orders</h2>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground italic">Loading your requests...</p>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <div key={req.id} className="p-4 rounded-lg border bg-background/50 hover:border-primary/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{req.crop_name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                            req.status?.toLowerCase() === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            req.status?.toLowerCase() === "accepted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            req.status?.toLowerCase() === "completed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                            "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          }`}>
                            {req.status?.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ordered <span className="text-foreground font-medium">{req.quantity} units</span> at 
                          <span className="text-foreground font-medium"> ₦{req.crop_price}/unit</span>
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(req.created_at).toLocaleDateString()}
                          </div>
                          {req.is_paid && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {req.payment_verified ? "Payment Verified" : "Payment Sent (Pending Verification)"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/buyer/messages?with=${req.farmer_id}`}>
                            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Chat Farmer
                          </Link>
                        </Button>
                        
                        {req.status?.toLowerCase() === "accepted" && !req.is_paid && (
                          <div className="flex flex-col gap-2">
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-2 mb-2">
                              <p className="font-bold text-primary italic">To complete this purchase, please pay to the farmer's bank account:</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-muted-foreground">Bank:</span>
                                <span className="font-semibold text-foreground uppercase tracking-tight">{req.farmer_bank_name || "N/A"}</span>
                                <span className="text-muted-foreground">Account:</span>
                                <span className="font-semibold text-foreground font-mono">{req.farmer_account_number || "N/A"}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-2 border-t pt-2">After payment, upload your receipt using the button below.</p>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 gap-1.5 w-full" 
                              onClick={() => handlePaymentClick(req.id)}
                              disabled={isUploading === req.id}
                            >
                              <CreditCard className="w-3.5 h-3.5" /> 
                              {isUploading === req.id ? "Uploading..." : "Make Payment"}
                            </Button>
                          </div>
                        )}

                        {req.status?.toLowerCase() === "accepted" && req.is_paid && (
                          <Button size="sm" variant="outline" className="gap-1.5" asChild>
                            <a href={req.payment_proof_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-3.5 h-3.5" /> View Receipt
                            </a>
                          </Button>
                        )}

                        {req.status?.toLowerCase() === "accepted" && req.is_paid && req.payment_verified && req.delivery_status?.toLowerCase() === "delivered" && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => handleConfirmReceipt(req.id)}>
                            <PackageCheck className="w-3.5 h-3.5" /> Confirm Receipt
                          </Button>
                        )}

                        {req.status?.toLowerCase() === "accepted" && req.is_paid && !req.payment_verified && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
                            <AlertCircle className="w-3.5 h-3.5" /> AWAITING VERIFICATION
                          </div>
                        )}
                      </div>
                    </div>

                    {req.payment_verified && req.status?.toLowerCase() !== "rejected" && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Delivery Tracking</h4>
                          {req.tracking_number && (
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono">ID: {req.tracking_number}</span>
                          )}
                        </div>
                        <DeliveryStepper currentStatus={req.delivery_status as DeliveryStatus} />
                        {req.delivery_notes && (
                          <p className="mt-8 text-xs text-muted-foreground bg-muted/30 p-2 rounded border-l-2 border-primary">
                            <span className="font-bold">Note from Farmer:</span> {req.delivery_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">You haven't made any purchase requests yet.</p>
                  <Button variant="link" asChild className="mt-2 text-primary">
                    <Link to="/buyer/marketplace">Go to Marketplace</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
