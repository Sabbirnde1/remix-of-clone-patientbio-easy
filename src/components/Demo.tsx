import { Button } from "@/components/ui/button";
import { Play, CheckCircle2 } from "lucide-react";

const Demo = () => {
  const demoFeatures = [
    "Unified health passport dashboard",
    "Secure document upload & storage",
    "Provider sharing with one click",
    "Real-time health insights",
    "Family member management",
    "Emergency access controls",
  ];

  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[var(--gradient-mesh)] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
              🎬 See It In Action
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Experience the{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                future of health data
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Watch how Patient Bio transforms the way you manage, access, and share your medical records. See our intuitive interface in action.
            </p>

            <ul className="space-y-3 mb-8">
              {demoFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary border-0">
                <Play className="mr-2 h-5 w-5" />
                Watch Full Demo
              </Button>
              <Button size="lg" variant="outline">
                Request Live Demo
              </Button>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card">
              {/* Browser Chrome */}
              <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 ml-4">
                  <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground max-w-xs">
                    app.patientbio.com/dashboard
                  </div>
                </div>
              </div>
              
              {/* Mock Dashboard */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-32 bg-gradient-to-r from-primary to-secondary rounded" />
                    <div className="h-3 w-24 bg-muted rounded mt-2" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary" />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 mb-2" />
                      <div className="h-4 w-16 bg-muted rounded mb-1" />
                      <div className="h-3 w-12 bg-muted-foreground/20 rounded" />
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                    <div className="flex-1">
                      <div className="h-4 w-40 bg-muted rounded mb-1" />
                      <div className="h-3 w-56 bg-muted-foreground/20 rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="h-20 w-full bg-gradient-to-t from-primary/20 to-transparent rounded-lg" />
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="h-20 w-full bg-gradient-to-t from-secondary/20 to-transparent rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
