import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Mail, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type VerificationStatus = "verifying" | "success" | "error" | "pending";

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Handle email confirmation from URL token
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (token_hash && type === "email") {
        setStatus("verifying");
        
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });

        if (error) {
          setStatus("error");
          setErrorMessage(error.message || "Failed to verify email. The link may have expired.");
        } else {
          setStatus("success");
          // Redirect to dashboard after short delay
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  // If user is already verified and logged in, redirect
  useEffect(() => {
    if (!loading && user?.email_confirmed_at) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!resendEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address to resend the verification link.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: resendEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    setIsResending(false);

    if (error) {
      toast({
        title: "Failed to resend",
        description: error.message || "Could not resend verification email. Please try again.",
        variant: "destructive",
      });
    } else {
      setResendCooldown(60);
      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification link.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Patient Bio</span>
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-xl text-center">
          {status === "verifying" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verifying your email...</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground mb-6">
                Your email has been successfully verified. Redirecting you to the dashboard...
              </p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/auth">Back to Sign In</Link>
                </Button>
              </div>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-muted-foreground mb-6">
                We've sent a verification link to your email address. Please click the link to verify your account and continue.
              </p>
              
              {/* Resend Section */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium mb-3">Didn't receive the email?</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending || resendCooldown > 0}
                    size="sm"
                    className="shrink-0"
                  >
                    {isResending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : resendCooldown > 0 ? (
                      `${resendCooldown}s`
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resend
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Check your spam folder if you don't see it.
                </p>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link to="/auth">Back to Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
