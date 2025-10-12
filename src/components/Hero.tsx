import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--hero-gradient)] opacity-50" />
      
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-foreground">Trusted by healthcare professionals worldwide</span>
          </div>

          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
            <Heart className="h-10 w-10 text-primary fill-primary" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Your Health Data.
            <br />
            <span className="text-primary">Your Control.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Secure, patient-owned health records built on blockchain technology. 
            Access your complete medical history anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { value: "2", label: "Countries" },
            { value: "100%", label: "Patient Owned" },
            { value: "24/7", label: "Access" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 text-center shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-lg)] transition-shadow duration-300"
            >
              <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
