import React, { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldAlert, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user for subscription check", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // Mock subscription call
      const updatedUser = await authApi.subscribe();
      setUser(updatedUser);
      toast({
        title: "Subscription Successful",
        description: "You now have full access for 30 days!",
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Could not process mock payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return null;

  // Admin and Superusers bypass
  if (user?.role === "admin" || user?.is_superuser) return <>{children}</>;

  // Calculate trial expiration (7 days)
  const trialStart = new Date(user?.trial_start_date || new Date());
  const trialExpiry = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isTrialActive = new Date() < trialExpiry;
  const isSubscribed = user?.is_subscribed;

  // If trial is over and not subscribed, block content
  if (!isTrialActive && !isSubscribed) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Trial Expired</h2>
            <p className="text-muted-foreground">
              Your 7-day free trial has come to an end. To continue using AgroLink features, please subscribe.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between border">
            <div className="flex items-center gap-3">
              <CreditCard className="text-primary w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-semibold">Monthly Plan</p>
                <p className="text-xs text-muted-foreground">Unlimited access</p>
              </div>
            </div>
            <p className="text-lg font-bold text-primary">₦2,000</p>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold" 
            onClick={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Subscribe Now"}
          </Button>
          
          <p className="text-[10px] text-muted-foreground italic">
            Secure payment via mock gateway. No real card details required.
          </p>
        </div>
      </div>
    );
  }

  // If trial is still active, show a small countdown badge in the corner
  const daysLeft = Math.ceil((trialExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      {!isSubscribed && isTrialActive && (
        <div className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-bounce">
          <Clock className="w-4 h-4" />
          {daysLeft} days left in free trial
        </div>
      )}
      {children}
    </>
  );
};
