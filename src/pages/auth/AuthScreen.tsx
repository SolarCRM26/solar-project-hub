import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Sun,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  deriveRolesFromMetadata,
  normalizeRoles,
  resolveRoleHomeRoute,
  type AppRole,
} from "@/lib/auth-routing";

type AuthMode = "login" | "signup";

interface AuthScreenProps {
  mode: AuthMode;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const lifecycleHighlights = [
  "Pipeline-to-closeout visibility for every solar project",
  "Faster team coordination across sales, design, and field delivery",
  "Client-ready updates, documents, and execution tracking in one place",
];

const roleOptions: { value: AppRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "sales", label: "Sales" },
  { value: "engineering", label: "Engineering" },
  { value: "procurement", label: "Procurement" },
  { value: "execution", label: "Execution" },
  { value: "client", label: "Client" },
];

export const AuthScreen = ({ mode }: AuthScreenProps) => {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("sales");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ctaText = useMemo(() => {
    return isSignup ? "Create Account" : "Sign In";
  }, [isSignup]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (isSignup && !fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (isSignup && password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (isSignup) {
      if (!selectedRole) {
        nextErrors.role = "Please select a role.";
      }

      if (!confirmPassword) {
        nextErrors.confirmPassword = "Please confirm your password.";
      } else if (confirmPassword !== password) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
      return;
    }

    const authUser = data.user;
    const roles = await resolveRolesForRouting(authUser.id, {
      ...(authUser.user_metadata ?? {}),
      ...(authUser.app_metadata ?? {}),
    });

    navigate(resolveRoleHomeRoute(roles as AppRole[]), { replace: true });
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: selectedRole,
          },
        },
      });

      if (error) {
        setErrors({ form: error.message });
        setLoading(false);
        return;
      }

      if (!data.user) {
        setErrors({ form: "Could not create account. Please try again." });
        setLoading(false);
        return;
      }

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          toast({
            title: "Signup complete",
            description: "Please sign in to continue.",
          });
          navigate("/login", { replace: true });
          setLoading(false);
          return;
        }
      }

      const { error: roleError, status } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user.id, role: selectedRole });

      if (roleError && roleError.code !== "23505" && status !== 409) {
        setErrors({ form: roleError.message });
        setLoading(false);
        return;
      }

      toast({ title: "Account created successfully" });
      navigate(resolveRoleHomeRoute([selectedRole]), { replace: true });
    } catch (_error) {
      setErrors({ form: "An unexpected error occurred. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#e2e3ea]">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#1f2f3d] p-10 text-white">
        <img
          src="/image.png"
          alt="Rooftop solar installation"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0c1620]/80" />
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-[#4CAF50]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#66bb6a]/20 blur-3xl" />
        <div className="absolute -right-28 top-0 h-full w-[260px] bg-[#4CAF50]/26 -skew-x-[28deg]" />
        <div className="absolute -right-10 top-0 h-full w-[160px] bg-[#388E3C]/24 -skew-x-[28deg]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,199,132,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(102,187,106,0.18),transparent_35%)]" />

        <div className="relative z-10 flex items-center gap-3 rounded-xl border border-white/20 bg-black/30 px-3 py-2 backdrop-blur-sm w-fit">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
            <Sun className="h-6 w-6 text-[#81C784]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              SPD NEXUS
            </p>
            <p className="text-[11px] text-white/75 mt-1">
              Powered by Solar Power Depot
            </p>
          </div>
        </div>
        <div className="mt-10"></div>

        <div className="relative z-10 max-w-lg space-y-6 rounded-2xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm shadow-2xl shadow-black/20">
          <h2 className="text-4xl font-bold leading-tight">
            Scale your solar business from lead to energized system.
          </h2>
          <p className="text-white/75 text-base leading-relaxed">
            A professional workspace for managing opportunities, projects, field
            execution, and customer delivery.
          </p>

          <div className="space-y-3">
            {lifecycleHighlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-white/25 bg-black/20 px-4 py-3"
              >
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/80 rounded-lg bg-black/30 border border-white/15 px-3 py-2 w-fit">
          Built for high-performance solar EPC and project operations teams.
        </div>
      </aside>

      <main className="relative flex items-center justify-center overflow-hidden bg-[#e2e3ea] p-6 sm:p-10 lg:p-12">
        <img
          src="/image.png"
          alt="Solar panel field background"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(76,175,80,0.1),transparent_28%),radial-gradient(circle_at_85%_90%,rgba(56,142,60,0.12),transparent_32%)]" />
        <div className="relative w-full max-w-lg space-y-4 animate-slide-in">
          <div className="lg:hidden flex items-center justify-center gap-2 text-center">
            <div className="p-2 rounded-lg bg-gradient-solar">
              <Sun className="h-4 w-4 text-solar-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                SPD NEXUS
              </p>
              <p className="text-[11px] text-muted-foreground/90 mt-1">
                Powered by Solar Power Depot
              </p>
              <p className="font-semibold">Solar Business Platform</p>
            </div>
          </div>

          <Card className="w-full shadow-2xl border border-[#d2d6df] backdrop-blur-sm bg-[#eef1f6]/95 transition-all duration-300 rounded-3xl">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center gap-2 text-[#2E7D32]">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Secure Workspace Access
                </span>
              </div>
              <CardTitle className="text-3xl tracking-tight text-[#131b2e]">
                {isSignup ? "Create your account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-[#5f6779]">
                {isSignup
                  ? "Create your account and start managing solar workflows with your team."
                  : "Sign in to continue managing projects, tasks, and client delivery."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={isSignup ? handleSignup : handleLogin}
                className="space-y-4"
              >
                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Solar"
                      className="h-11 transition-all duration-200 bg-[#d9e0ec]/65 border-[#c5cfdd] focus-visible:ring-[#4CAF50]/50"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-11 transition-all duration-200 bg-[#d9e0ec]/65 border-[#c5cfdd] focus-visible:ring-[#4CAF50]/50"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 pr-10 transition-all duration-200 bg-[#d9e0ec]/65 border-[#c5cfdd] focus-visible:ring-[#4CAF50]/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => {
                        setSelectedRole(value as AppRole);
                        if (errors.role) {
                          setErrors((prev) => {
                            const { role, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                    >
                      <SelectTrigger
                        id="role"
                        className="h-11 transition-all duration-200 bg-[#d9e0ec]/65 border-[#c5cfdd] focus-visible:ring-[#4CAF50]/50"
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-destructive">{errors.role}</p>
                    )}
                  </div>
                )}

                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 pr-10 transition-all duration-200 bg-[#d9e0ec]/65 border-[#c5cfdd] focus-visible:ring-[#4CAF50]/50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {errors.form && (
                  <p className="text-sm text-destructive">{errors.form}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-medium bg-[#4CAF50] text-white hover:bg-[#429c46]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isSignup ? "Creating account..." : "Signing in..."}
                    </>
                  ) : (
                    <>
                      {ctaText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="h-px w-full bg-border/70" />

                <p className="text-sm text-[#6a7282] text-center">
                  {isSignup
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <Link
                    to={isSignup ? "/login" : "/signup"}
                    className="text-[#2E7D32] font-semibold hover:text-[#256b29] transition-colors"
                  >
                    {isSignup ? "Sign in" : "Create one"}
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-[#6f7685]">
            Trusted workspace for modern solar operations teams.
          </p>
        </div>
      </main>
    </div>
  );
};
