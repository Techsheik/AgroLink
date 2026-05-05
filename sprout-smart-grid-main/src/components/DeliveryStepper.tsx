import React from "react";
import { Check, Truck, Package, Home, Clock } from "lucide-react";

export type DeliveryStatus = "pending" | "shipped" | "in_transit" | "delivered" | "confirmed";

interface DeliveryStepperProps {
  currentStatus: DeliveryStatus;
}

const steps: { status: DeliveryStatus; label: string; icon: React.ReactNode }[] = [
  { status: "pending", label: "Processing", icon: <Clock className="w-4 h-4" /> },
  { status: "shipped", label: "Shipped", icon: <Package className="w-4 h-4" /> },
  { status: "in_transit", label: "In Transit", icon: <Truck className="w-4 h-4" /> },
  { status: "delivered", label: "Delivered", icon: <Home className="w-4 h-4" /> },
  { status: "confirmed", label: "Received", icon: <Check className="w-4 h-4" /> },
];

export function DeliveryStepper({ currentStatus }: DeliveryStepperProps) {
  const currentIndex = steps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-muted -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500 -z-10" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "bg-background border-muted text-muted-foreground"
                } ${isCurrent ? "scale-110 ring-4 ring-primary/10" : ""}`}
              >
                {step.icon}
              </div>
              <div className="absolute mt-12 text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tighter ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
