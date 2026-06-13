import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  deriveRolesFromMetadata,
  normalizeRoles,
  resolveRoleHomeRoute,
  type AppRole,
} from "@/lib/auth-routing";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const resolveRolesForRouting = async (
    userId: string,
    metadata: Record<string, unknown> | undefined,
  ) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) return deriveRolesFromMetadata(metadata);

    const dbRoles = normalizeRoles((data || []).map((item) => item.role));
    if (dbRoles.length > 0) return dbRoles;

    return deriveRolesFromMetadata(metadata);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          pending_password_setup: false
        }
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      toast({ title: "Password updated successfully" });

      const authUser = data.user;
      if (authUser) {
        const roles = await resolveRolesForRouting(authUser.id, {
          ...(authUser.user_metadata ?? {}),
          ...(authUser.app_metadata ?? {}),
        });
        navigate(resolveRoleHomeRoute(roles as AppRole[]), { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 sm:p-10 lg:p-12 relative overflow-hidden">
      <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-[#f4c742]/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#7ccf8f]/8 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6 animate-slide-in">
        <div className="flex flex-col items-center justify-center gap-2 text-center mb-2">
          <img
            src="/transparent%20logo.png"
            alt="SPD Nexus"
            className="h-32 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
          />
          <div>
            <p className="text-[11px] text-slate-500 mt-1">
              Solar Project Intelligence Platform - Designed by Solar Power Depot
            </p>
          </div>
        </div>

        <Card className="w-full shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-200 bg-white transition-all duration-300 rounded-[24px] text-slate-900">
          <CardHeader className="space-y-2 pb-4">
            <div className="flex items-center gap-2 text-[#ca8a04]">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">Set Password</span>
            </div>
            <CardTitle className="text-3xl tracking-tight text-slate-900">
              Create a new password
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-slate-500">
              Please enter your new password to secure your account and gain access to the platform.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 pr-10 transition-all duration-200 bg-slate-50 border-slate-200 focus-visible:ring-[#ca8a04]/50 text-slate-900 placeholder-slate-400 focus:border-[#ca8a04]/40 focus:bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-slate-700">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 pr-10 transition-all duration-200 bg-slate-50 border-slate-200 focus-visible:ring-[#ca8a04]/50 text-slate-900 placeholder-slate-400 focus:border-[#ca8a04]/40 focus:bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold bg-[#ca8a04] hover:bg-[#b45309] text-white transition-all duration-300 shadow-md shadow-[#ca8a04]/10 hover:shadow-[#ca8a04]/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving password...
                  </>
                ) : (
                  <>
                    Save Password & Log In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
