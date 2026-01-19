import { X, Check, FileX, Lock, Database, Globe, Shield, Zap, TrendingUp, Users, Award } from "lucide-react";
const ProblemSolution = () => {
  const problems = [{
    icon: FileX,
    title: "Fragmented Records",
    description: "Patients lose medical history when switching providers, leading to repeated tests and delayed care."
  }, {
    icon: Lock,
    title: "Limited Access",
    description: "Critical health information unavailable during emergencies or when traveling internationally."
  }, {
    icon: Database,
    title: "Data Silos",
    description: "Healthcare systems can't communicate, creating inefficiencies and potential medical errors."
  }];
  const solutions = [{
    icon: CheckCircle,
    title: "Unified Health Passport",
    description: "Complete medical history accessible from any healthcare provider worldwide in seconds.",
    gradient: "from-primary to-accent"
  }, {
    icon: Globe,
    title: "Global Interoperability",
    description: "Seamless data sharing across 195+ countries with instant provider verification.",
    gradient: "from-secondary to-primary"
  }, {
    icon: Shield,
    title: "Patient Sovereignty",
    description: "You control who accesses your data and when, with blockchain-secured permissions.",
    gradient: "from-accent to-secondary"
  }];
  const stats = [{
    icon: TrendingUp,
    value: "$666.8B",
    label: "Market Opportunity",
    subtext: "Global healthcare data management market size",
    gradient: "from-primary to-secondary"
  }, {
    icon: Users,
    value: "1B+",
    label: "Underserved Patients",
    subtext: "People without proper access to their health data",
    gradient: "from-secondary to-accent"
  }, {
    icon: Award,
    value: "0",
    label: "Data Breaches",
    subtext: "Perfect security record with blockchain technology",
    gradient: "from-accent to-primary"
  }];
  return <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-7xl relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            The Healthcare Data{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Revolution
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Current healthcare systems create barriers between patients and their own health data. We're changing that.
          </p>
        </div>

        {/* Problem vs Solution Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          {/* Problems */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 mb-8 px-5 py-2.5 rounded-full bg-destructive/10 border border-destructive/30">
              <X className="h-5 w-5 text-destructive" />
              <span className="text-sm font-bold text-destructive">Current Problems</span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-10 leading-tight">Healthcare Data is Broken</h3>
            <div className="space-y-4">
              {problems.map((problem, index) => <div key={index} className="group flex gap-5 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-destructive/50 transition-all duration-300 hover:shadow-lg">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                    <problem.icon className="h-7 w-7 text-destructive" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2 text-foreground">{problem.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                  </div>
                </div>)}
            </div>
          </div>

          {/* Solutions */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 mb-8 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Solution</span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-10 leading-tight">Patient Bio Changes Everything</h3>
            <div className="space-y-4">
              {solutions.map((solution, index) => <div key={index} className="group relative flex gap-5 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className={`relative flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center shadow-lg`}>
                    <solution.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="relative">
                    <h4 className="text-lg font-bold mb-2 text-foreground">{solution.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{solution.description}</p>
                  </div>
                </div>)}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => <div key={index} className="group relative text-center p-10 rounded-3xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <div className={`inline-flex w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${stat.gradient} items-center justify-center shadow-lg`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className={`text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-xl font-bold mb-3 text-foreground">{stat.label}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{stat.subtext}</div>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};

// CheckCircle component
const CheckCircle = ({
  className
}: {
  className?: string;
}) => <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>;
export default ProblemSolution;