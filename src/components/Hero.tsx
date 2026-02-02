import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent, DEFAULT_HERO_STATS, type HeroStats } from "@/hooks/useSiteContent";

const STAT_COLORS = [
  "from-primary to-accent",
  "from-secondary to-primary",
  "from-accent to-secondary",
];

const Hero = () => {
  const { data: heroStats } = useSiteContent<HeroStats>("hero_stats", DEFAULT_HERO_STATS);

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-[var(--gradient-mesh)]" />
      
      {/* Floating Orbs - Hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="hidden sm:block absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-6 leading-[1.1] tracking-tight">
            Your Health Data.
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your Control.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-2">
            Secure, patient-owned health records built on blockchain and AI technology. Access your complete medical history anytime, anywhere.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-20 px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all text-base">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 text-base">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {heroStats.stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-[var(--card-shadow-lg)] hover:shadow-[var(--card-shadow-xl)] transition-all duration-300 border border-border/50 hover:border-primary/30 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity from-primary/5 to-secondary/5" />
              <div className="relative">
                <div className={`text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r ${STAT_COLORS[index % STAT_COLORS.length]} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
