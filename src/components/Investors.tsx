import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Globe, Shield, ArrowRight } from "lucide-react";

const Investors = () => {
  const metrics = [
    { value: "1M+", label: "Active Users", icon: Users },
    { value: "50+", label: "Countries", icon: Globe },
    { value: "99.9%", label: "Uptime", icon: Shield },
    { value: "200%", label: "YoY Growth", icon: TrendingUp },
  ];

  const investors = [
    { name: "Andreessen Horowitz", tier: "Lead Investor" },
    { name: "Sequoia Capital", tier: "Series A" },
    { name: "General Catalyst", tier: "Series A" },
    { name: "Rock Health", tier: "Seed" },
    { name: "GV (Google Ventures)", tier: "Series A" },
    { name: "Founders Fund", tier: "Series A" },
  ];

  const press = [
    { outlet: "TechCrunch", quote: "Patient Bio is revolutionizing how we think about health data ownership." },
    { outlet: "Forbes", quote: "One of the most promising healthcare startups of the decade." },
    { outlet: "WIRED", quote: "The future of patient-controlled health records." },
  ];

  return (
    <section id="investors" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--gradient-mesh)] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
            📈 Investor Relations
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Backed by{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              world-class investors
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We're proud to be supported by leading investors who share our vision of patient-controlled healthcare data.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border/50 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                <metric.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Investors Grid */}
        <div className="bg-card rounded-2xl border border-border/50 p-8 mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Our Investors</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {investors.map((investor, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold">
                  {investor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold">{investor.name}</div>
                  <div className="text-sm text-muted-foreground">{investor.tier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Press */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">In the Press</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {press.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
              >
                <div className="text-primary font-bold mb-3">{item.outlet}</div>
                <p className="text-muted-foreground italic">"{item.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Interested in investing?</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            We're always looking to connect with investors who share our vision for the future of healthcare.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Contact Investor Relations
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Investors;
