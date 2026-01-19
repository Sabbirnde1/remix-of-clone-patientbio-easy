import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const menuItems = [
    { name: "Features", href: "/features" },
    { name: "Demo", href: "/demo" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Investors", href: "/investors" },
    { name: "Contact", href: "/contact" },
  ];

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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
