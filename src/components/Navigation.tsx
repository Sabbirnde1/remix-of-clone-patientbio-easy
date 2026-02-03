import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, LogOut, Menu, User, ChevronRight, Shield, LayoutDashboard, Building2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";

const Navigation = () => {
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Features", href: "/features", sectionId: "features" },
    { name: "Demo", href: "/demo", sectionId: "demo" },
    { name: "For Hospitals", href: "/hospitals", sectionId: "" },
    { name: "About", href: "/about", sectionId: "about" },
    { name: "Team", href: "/team", sectionId: "team" },
    { name: "Contact", href: "/contact", sectionId: "contact" },
  ];

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Height of the fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth"
      });
    }
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent, item: { href: string; sectionId: string }) => {
    // For Hospitals page, navigate directly
    if (item.href === "/hospitals") {
      return; // Let the default Link behavior handle it
    }
    
    // If we're on the homepage, scroll to section
    if (location.pathname === "/") {
      e.preventDefault();
      scrollToSection(item.sectionId);
    } else {
      // Navigate to homepage with hash, then scroll
      e.preventDefault();
      navigate("/");
      // Wait for navigation, then scroll
      setTimeout(() => {
        scrollToSection(item.sectionId);
      }, 100);
    }
  }, [location.pathname, navigate, scrollToSection]);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight hidden xs:inline">Patient Bio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {user.email}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="sm" className="bg-gradient-to-r from-primary to-secondary border-0 shadow-lg shadow-primary/25">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            {!loading && !user && (
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary border-0 text-xs px-3">
                  Get Started
                </Button>
              </Link>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-6 border-b border-border/50">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold">Patient Bio</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col h-[calc(100%-81px)]">
                  {/* User Info */}
                  {user && (
                    <div className="p-4 border-b border-border/50 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">Signed in</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-1">
                      {menuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={(e) => {
                            handleNavClick(e, item);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive(item.href)
                              ? "text-primary bg-primary/10"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          {item.name}
                          <ChevronRight className={`h-4 w-4 transition-colors ${
                            isActive(item.href) ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </Link>
                      ))}
                      
                      {/* Dashboard link in mobile menu */}
                      {user && (
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 text-foreground hover:bg-muted/50"
                        >
                          <span className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                      
                      {/* Admin link in mobile menu */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 text-foreground hover:bg-muted/50"
                        >
                          <span className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin Panel
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                    </div>
                  </nav>

                  {/* Bottom Actions */}
                  <div className="p-4 border-t border-border/50 space-y-3">
                    {!loading && (
                      <>
                        {user ? (
                          <Button
                            variant="outline"
                            className="w-full justify-center gap-2 h-12"
                            onClick={handleSignOut}
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </Button>
                        ) : (
                          <>
                            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block">
                              <Button className="w-full h-12 bg-gradient-to-r from-primary to-secondary border-0">
                                Get Started
                              </Button>
                            </Link>
                            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block">
                              <Button variant="outline" className="w-full h-12">
                                Sign In
                              </Button>
                            </Link>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
