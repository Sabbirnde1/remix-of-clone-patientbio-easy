import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Navigation = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Features", href: "/features" },
    { name: "Demo", href: "/demo" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Investors", href: "/investors" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">Patient Bio</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-sm text-muted-foreground">
                      {user.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="hidden sm:inline-flex"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="sm" className="bg-gradient-to-r from-primary to-secondary border-0">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors text-left"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
