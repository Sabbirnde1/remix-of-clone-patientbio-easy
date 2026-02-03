import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthView = "login" | "signup" | "forgot-password";

export default function HospitalAuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading } = useAuth();

  // Redirect if already logged in - fetch hospitals directly
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!loading && user) {
        try {
          // Fetch user's hospitals directly
          const { data: staffRecords, error } = await supabase
            .from("hospital_staff")
            .select("hospital_id")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .limit(1);

          if (error) throw error;

          if (staffRecords && staffRecords.length > 0) {
            // Redirect to first hospital dashboard
            navigate(`/hospital/${staffRecords[0].hospital_id}`, { replace: true });
          } else {
            // No hospitals - redirect to registration
            navigate("/hospitals/register", { replace: true });
          }
        } catch (err) {
          console.error("Error checking hospitals:", err);
          navigate("/hospitals", { replace: true });
        }
      }
    };

    checkAndRedirect();
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email
    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) {
      toast({
        title: "Invalid Email",
        description: emailResult.error.errors[0].message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Handle forgot password
    if (view === "forgot-password") {
      try {
        const { error } = await resetPassword(formData.email);
        if (error) {
          toast({
            title: "Reset Failed",
            description: error.message || "Failed to send reset email. Please try again.",
            variant: "destructive",
          });
        } else {
          setResetEmailSent(true);
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
      return;
    }

    // Validate password for login/signup
    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) {
      toast({
        title: "Invalid Password",
        description: passwordResult.error.errors[0].message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (view === "signup" && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (view === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          let message = "An error occurred during sign in.";
          
          if (error.message.includes("Invalid login credentials")) {
            message = "Invalid email or password. Please try again.";
          } else if (error.message.includes("Email not confirmed")) {
            message = "Please verify your email address before signing in.";
          }
          
          toast({
            title: "Sign In Failed",
            description: message,
            variant: "destructive",
          });
          setIsLoading(false);
        }
        // Don't set isLoading to false on success - let useEffect handle redirect
      } else {
        const { error } = await signUp(formData.email, formData.password);
        if (error) {
          let message = "An error occurred during sign up.";
          if (error.message.includes("User already registered")) {
            message = "This email is already registered. Please sign in instead.";
          }
          toast({
            title: "Sign Up Failed",
            description: message,
            variant: "destructive",
          });
          setIsLoading(false);
        } else {
          navigate("/verify-email");
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while checking hospitals for logged-in user
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Hospital Portal</span>
          </Link>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-4">
            Manage Your
            <br />
            Healthcare Facility
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Access your hospital dashboard to manage staff, view patient records, and streamline operations.
          </p>
        </div>

        <div className="relative flex gap-8 text-white/80 text-sm">
          <div>
            <div className="text-3xl font-bold text-white">500+</div>
            <div>Hospitals</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">10K+</div>
            <div>Doctors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">1M+</div>
            <div>Patients Served</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-6 sm:mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Hospital Portal</span>
            </Link>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8 shadow-xl">
            {/* Forgot Password View */}
            {view === "forgot-password" ? (
              <>
                {resetEmailSent ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Check your email</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6">
                      We've sent a password reset link to <strong>{formData.email}</strong>
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => { setView("login"); setResetEmailSent(false); }}
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </button>
                    
                    <div className="text-center mb-6 sm:mb-8">
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">Forgot your password?</h2>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Enter your email and we'll send you a reset link
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="admin@hospital.com"
                            className="pl-10 h-11"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  </>
                )}
              </>
            ) : (
              /* Login / Signup View */
              <>
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    {view === "login" ? "Hospital Sign In" : "Create Hospital Account"}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {view === "login"
                      ? "Access your hospital dashboard"
                      : "Register to manage your healthcare facility"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@hospital.com"
                        className="pl-10 h-11"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {view === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 h-11"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {view === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setView("forgot-password")}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Please wait..."
                    ) : view === "login" ? (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    {view === "login" ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => setView(view === "login" ? "signup" : "login")}
                    className="text-primary font-medium hover:underline"
                  >
                    {view === "login" ? "Sign up" : "Sign in"}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Don't have a hospital registered yet?
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/hospitals/register">
                      <Building2 className="mr-2 h-4 w-4" />
                      Register Your Hospital
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
