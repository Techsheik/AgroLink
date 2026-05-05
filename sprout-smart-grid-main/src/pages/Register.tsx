import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, Upload, User, MapPin, Phone } from "lucide-react";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [lga, setLga] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ninFile, setNinFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"FARMER" | "BUYER" | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"trial" | "premium">("trial");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setIsLoading(true);
    try {
      let ninUrl = "";
      
      if (ninFile) {
        // Real NIN upload to Supabase bucket 'nins'
        const fileExt = ninFile.name.split('.').pop();
        const fileName = `${role}_${Date.now()}.${fileExt}`;
        const filePath = `${role}/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from('nins')
          .upload(filePath, ninFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Failed to upload NIN card: ${uploadError.message}`);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('nins')
            .getPublicUrl(filePath);
          ninUrl = publicUrl;
        }
      }

      await authApi.register({
        email,
        password,
        full_name: name,
        role,
        phone_number: phone,
        address: address,
        nin_url: ninUrl,
        state_of_origin: stateOfOrigin,
        lga: lga,
        bank_name: bankName,
        account_number: accountNumber,
        selected_plan: selectedPlan,
      });
      
      toast({
        title: "Registration submitted",
        description: "Your account has been created and is pending admin verification.",
      });
      
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 max-w-md px-12 space-y-6">
          <div className="flex items-center gap-3 text-primary-foreground">
            <span className="text-4xl">🌿</span>
            <span className="text-3xl font-bold">AgroLink</span>
          </div>
          <h2 className="text-2xl font-semibold text-primary-foreground leading-snug">
            Join the agricultural revolution
          </h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            Whether you grow it or buy it — AgroLink connects you to the right people, with the right tools.
          </p>
          <ul className="space-y-3 pt-2">
            {[
              "AI-powered crop recommendations",
              "Direct farmer-to-buyer marketplace",
              "Real-time market price intelligence",
              "Verified community of traders",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-primary-foreground/90 text-sm">
                <Check className="w-4 h-4 text-primary-foreground/60 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 text-xl font-bold text-foreground">
            <span className="text-2xl">🌿</span> AgroLink
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Start your journey with AgroLink today</p>
          </div>

          {/* Role selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: "FARMER" as const, emoji: "👨‍🌾", title: "Farmer", desc: "List crops & get AI advice" },
                { key: "BUYER" as const, emoji: "🛒", title: "Buyer", desc: "Browse & purchase crops" },
              ]).map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    role === r.key
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-foreground">{r.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                  </div>
                  {role === r.key && (
                    <div className="mt-2 flex items-center gap-1 text-primary text-xs font-medium">
                      <Check className="w-3 h-3" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground block">Choose your plan</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan("trial")}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedPlan === "trial" ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold">7-Day Trial</span>
                  {selectedPlan === "trial" && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Full access for 7 days, then pay.</p>
                <p className="text-xs font-bold text-primary mt-2">FREE</p>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan("premium")}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedPlan === "premium" ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold">Premium</span>
                  {selectedPlan === "premium" && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Immediate full access for 30 days.</p>
                <p className="text-xs font-bold text-primary mt-2">₦2,000 / mo</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Olawale Benson"
                  className="w-full h-10 pl-10 pr-3 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full h-10 pl-10 pr-3 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Verification</label>
                <label className="flex items-center justify-center w-full h-10 px-3 rounded-md border border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                  <Upload className="w-4 h-4 text-primary mr-2" />
                  <span className="text-xs font-medium text-primary truncate">
                    {ninFile ? ninFile.name : "Upload NIN Card"}
                  </span>
                  <input
                    required
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setNinFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">State of Origin</label>
                <input
                  required
                  type="text"
                  value={stateOfOrigin}
                  onChange={(e) => setStateOfOrigin(e.target.value)}
                  placeholder="e.g. Kaduna"
                  className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">LGA</label>
                <input
                  required
                  type="text"
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  placeholder="Local Govt"
                  className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {role === "FARMER" && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-4">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Payment Details (To receive payments)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground text-[11px]">Bank Name</label>
                    <input
                      required={role === "FARMER"}
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. GTBank, Zenith"
                      className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground text-[11px]">Account Number</label>
                    <input
                      required={role === "FARMER"}
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="10 Digits"
                      maxLength={10}
                      className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {role === "FARMER" ? "Farm Address" : "Business Address"}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State"
                  className="w-full min-h-[80px] pl-10 pr-3 py-2 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="w-full h-10 px-3 pr-10 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={!role || isLoading}>
              {isLoading ? "Creating Account..." : (role ? `Create ${role === "FARMER" ? "Farmer" : "Buyer"} Account` : "Select a role to continue")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
