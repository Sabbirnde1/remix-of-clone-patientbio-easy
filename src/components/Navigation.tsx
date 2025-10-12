import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Navigation = () => {
  const menuItems = ["Home", "Features", "Demo", "About", "Impact", "Team", "Investors", "Contact"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Heart className="h-7 w-7 text-secondary fill-secondary" />
              <div>
                <div className="text-lg font-bold text-foreground">Patient Bio</div>
                <div className="text-xs text-muted-foreground -mt-1">Health Passport</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
