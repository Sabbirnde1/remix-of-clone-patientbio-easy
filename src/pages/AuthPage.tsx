import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthView = "login" | "signup" | "forgot-password";

const AuthPage = () => {
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message || "An error occurred during Google sign in.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    setIsGoogleLoading(false);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      // Check for redirect URL in query params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirect");
      const action = urlParams.get("action");
      
      if (redirectTo) {
        // Build redirect URL with action if present
        const finalRedirect = action ? `${redirectTo}?action=${action}` : redirectTo;
        navigate(finalRedirect);
      } else {
        navigate("/dashboard");
      }
    }
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
          let showEmailNotConfirmed = false;
          
          if (error.message.includes("Invalid login credentials")) {
            message = "Invalid email or password. Please try again.";
          } else if (error.message.includes("Email not confirmed")) {
            showEmailNotConfirmed = true;
            message = "Please verify your email address before signing in. Check your inbox for a verification link.";
          }
          
          if (showEmailNotConfirmed) {
            toast({
              title: "Email Not Verified",
              description: (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive-foreground mt-0.5 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              ),
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign In Failed",
              description: message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(formData.email, formData.password);
        if (error) {
          let message = "An error occurred during sign up.";
          if (error.message.includes("User already registered")) {
            message = "This email is already registered. Please sign in instead.";
          } else if (error.message.includes("Password")) {
            message = error.message;
          }
          toast({
            title: "Sign Up Failed",
            description: message,
            variant: "destructive",
          });
        } else {
          // Redirect to verify email page instead of switching to login
          navigate("/verify-email");
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const switchToForgotPassword = () => {
    setView("forgot-password");
    setResetEmailSent(false);
  };

  const switchToLogin = () => {
    setView("login");
    setResetEmailSent(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-secondary to-accent p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Patient Bio</span>
          </Link>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-4">
            Your Health Data.
            <br />
            Your Control.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Join thousands of patients who have taken control of their health records with Patient Bio.
          </p>
        </div>

        <div className="relative flex gap-8 text-white/80 text-sm">
          <div>
            <div className="text-3xl font-bold text-white">1M+</div>
            <div>Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">50+</div>
            <div>Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">99.9%</div>
            <div>Uptime</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-6 sm:mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Patient Bio</span>
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
                    <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                      Didn't receive the email? Check your spam folder or{" "}
                      <button
                        type="button"
                        onClick={() => setResetEmailSent(false)}
                        className="text-primary hover:underline"
                      >
                        try again
                      </button>
                    </p>
                    <Button
                      variant="outline"
                      onClick={switchToLogin}
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
                      onClick={switchToLogin}
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
                            placeholder="john@example.com"
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
                        className="w-full bg-gradient-to-r from-primary to-secondary border-0"
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
                    {view === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {view === "login"
                      ? "Sign in to access your health records"
                      : "Start managing your health data today"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          className="pl-10 h-11"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
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
                          required={view === "signup"}
                        />
                      </div>
                    </div>
                  )}

                  {view === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={switchToForgotPassword}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Please wait..."
                    ) : (
                      <>
                        {view === "login" ? "Sign In" : "Create Account"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    "Connecting..."
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

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
              </>
            )}
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
