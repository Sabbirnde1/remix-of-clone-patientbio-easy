import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
const Hero = () => {
  return <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-[var(--gradient-mesh)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{
      animationDelay: "1s"
    }} />
      
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16 animate-fade-in">
          {/* Trust Badge */}
          

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tight">
            Your Health Data.
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your Control.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Secure, patient-owned health records built on blockchain technology. 
            Access your complete medical history anytime, anywhere.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button size="lg" className="group bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-2">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[{
          value: "195+",
          label: "Countries",
          color: "from-primary to-accent"
        }, {
          value: "100%",
          label: "Patient Owned",
          color: "from-secondary to-primary"
        }, {
          value: "24/7",
          label: "Instant Access",
          color: "from-accent to-secondary"
        }].map((stat, index) => <div key={index} className="group relative bg-card rounded-3xl p-8 text-center shadow-[var(--card-shadow-lg)] hover:shadow-[var(--card-shadow-xl)] transition-all duration-300 border border-border/50 hover:border-primary/30 backdrop-blur-sm" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity from-primary/5 to-secondary/5" />
              <div className="relative">
                <div className={`text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default Hero;