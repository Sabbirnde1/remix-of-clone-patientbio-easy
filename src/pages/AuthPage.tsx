import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
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

    // Validate password
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

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          let message = "An error occurred during sign in.";
          if (error.message.includes("Invalid login credentials")) {
            message = "Invalid email or password. Please try again.";
          } else if (error.message.includes("Email not confirmed")) {
            message = "Please confirm your email address before signing in.";
          }
          toast({
            title: "Sign In Failed",
            description: message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate("/");
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
          toast({
            title: "Account created!",
            description: "You can now sign in with your credentials.",
          });
          setIsLogin(true);
          setFormData({ name: "", email: "", password: "", confirmPassword: "" });
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Patient Bio</span>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Sign in to access your health records"
                  : "Start managing your health data today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
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
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
