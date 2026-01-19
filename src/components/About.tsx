import { Target, Eye, Heart, TrendingUp } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Patient First",
      description: "Every decision we make starts with one question: How does this benefit patients?",
    },
    {
      icon: Target,
      title: "Transparency",
      description: "We believe in radical transparency in how we handle and protect your health data.",
    },
    {
      icon: Eye,
      title: "Privacy by Design",
      description: "Security and privacy aren't afterthoughts—they're built into everything we create.",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "We constantly push boundaries to deliver cutting-edge healthcare technology.",
    },
  ];

  const milestones = [
    { year: "2021", event: "Founded in San Francisco" },
    { year: "2022", event: "Launched beta with 10,000 users" },
    { year: "2023", event: "Series A funding - $25M" },
    { year: "2024", event: "Expanded to 50+ countries" },
    { year: "2025", event: "1 million+ active users" },
  ];

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            🎯 Our Mission
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering patients through{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              data ownership
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            We believe that health data belongs to the patient. Our mission is to create a world where every person has complete control over their medical information—accessible anywhere, anytime, and shared only with their consent.
          </p>
        </div>

        {/* Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold mb-6">Our Story</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Patient Bio was born from a deeply personal experience. Our founder, Dr. Sarah Chen, watched her father struggle to access his own medical records across multiple healthcare systems during a critical illness.
              </p>
              <p>
                The fragmented healthcare data landscape caused delays in treatment and unnecessary stress during an already difficult time. Sarah knew there had to be a better way.
              </p>
              <p>
                In 2021, she partnered with technologist Michael Rodriguez to build what would become Patient Bio—a platform that puts patients back in control of their health data.
              </p>
              <p>
                Today, we're a team of 50+ passionate individuals working to transform healthcare data management for millions of patients worldwide.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/50">
                    <span className="text-primary font-bold">{milestone.year}</span>
                    <p className="text-foreground">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Our Values</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These core principles guide everything we do at Patient Bio.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                <value.icon className="h-7 w-7 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">{value.title}</h4>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
