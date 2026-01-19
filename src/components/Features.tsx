import { Shield, Globe, Smartphone, Lock, FileText, Users, Zap, Heart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "Your health data is protected with end-to-end encryption and advanced security protocols.",
      color: "from-primary to-secondary",
    },
    {
      icon: Globe,
      title: "Global Interoperability",
      description: "Access your records anywhere in the world with seamless healthcare provider integration.",
      color: "from-secondary to-accent",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Manage your health data on-the-go with our intuitive mobile application.",
      color: "from-accent to-primary",
    },
    {
      icon: Lock,
      title: "Patient Sovereignty",
      description: "You own your data. Control exactly who can access your health information.",
      color: "from-primary to-secondary",
    },
    {
      icon: FileText,
      title: "Complete Records",
      description: "All your medical history, prescriptions, and test results in one unified platform.",
      color: "from-secondary to-accent",
    },
    {
      icon: Users,
      title: "Family Sharing",
      description: "Manage health records for your entire family with granular access controls.",
      color: "from-accent to-primary",
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Share records instantly with healthcare providers during emergencies.",
      color: "from-primary to-secondary",
    },
    {
      icon: Heart,
      title: "Health Insights",
      description: "AI-powered insights to help you understand and improve your health journey.",
      color: "from-secondary to-accent",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            ✨ Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
            Everything you need to manage your{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              health data
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            Our comprehensive platform gives you complete control over your medical records with cutting-edge security and seamless accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
