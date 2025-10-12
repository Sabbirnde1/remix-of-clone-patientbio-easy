import { AlertCircle, CheckCircle2, FileX, Lock, Database, Globe, Shield, Zap } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    {
      icon: FileX,
      title: "Fragmented Records",
      description: "Patients lose medical history when switching providers, leading to repeated tests and delayed care.",
    },
    {
      icon: Lock,
      title: "Limited Access",
      description: "Critical health information unavailable during emergencies or when traveling internationally.",
    },
    {
      icon: Database,
      title: "Data Silos",
      description: "Healthcare systems can't communicate, creating inefficiencies and potential medical errors.",
    },
  ];

  const solutions = [
    {
      icon: CheckCircle2,
      title: "Unified Health Passport",
      description: "Complete medical history accessible from any healthcare provider worldwide in seconds.",
    },
    {
      icon: Globe,
      title: "Global Interoperability",
      description: "Seamless data sharing across 195+ countries with instant provider verification.",
    },
    {
      icon: Shield,
      title: "Patient Sovereignty",
      description: "You control who accesses your data and when, with blockchain-secured permissions.",
    },
  ];

  const stats = [
    { value: "$666.8B", label: "Market Opportunity", subtext: "Global healthcare data management market size" },
    { value: "1B+", label: "Underserved Patients", subtext: "People without proper access to their health data" },
    { value: "0", label: "Data Breaches", subtext: "Perfect security record with blockchain technology" },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            The Healthcare Data <span className="text-primary">Challenge</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Current healthcare systems create barriers between patients and their own health data. We're changing that.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Current Problems</span>
            </div>
            <h3 className="text-3xl font-bold mb-8">Healthcare Data is Broken</h3>
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <div key={index} className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-destructive/30 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <problem.icon className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{problem.title}</h4>
                    <p className="text-muted-foreground text-sm">{problem.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
              <Zap className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Our Solution</span>
            </div>
            <h3 className="text-3xl font-bold mb-8">Patient Bio Changes Everything</h3>
            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <div key={index} className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-secondary/30 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <solution.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{solution.title}</h4>
                    <p className="text-muted-foreground text-sm">{solution.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border"
            >
              <div className="text-5xl font-bold text-primary mb-3">{stat.value}</div>
              <div className="text-lg font-semibold mb-2">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.subtext}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
