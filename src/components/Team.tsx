import { Linkedin, Twitter } from "lucide-react";

const Team = () => {
  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former Chief Medical Officer at Stanford Health. 15+ years in healthcare innovation.",
      image: "SC",
      gradient: "from-primary to-secondary",
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Ex-Google engineer. Built security systems for Fortune 500 healthcare companies.",
      image: "MR",
      gradient: "from-secondary to-accent",
    },
    {
      name: "Dr. Emily Park",
      role: "Chief Medical Advisor",
      bio: "Board-certified physician with expertise in health informatics and patient advocacy.",
      image: "EP",
      gradient: "from-accent to-primary",
    },
    {
      name: "James Thompson",
      role: "VP of Engineering",
      bio: "Former Amazon engineer. Specialist in distributed systems and data security.",
      image: "JT",
      gradient: "from-primary to-secondary",
    },
    {
      name: "Lisa Wang",
      role: "Head of Product",
      bio: "Previously at Stripe and Oscar Health. Expert in healthcare UX design.",
      image: "LW",
      gradient: "from-secondary to-accent",
    },
    {
      name: "David Kim",
      role: "VP of Operations",
      bio: "10+ years scaling healthcare startups. MBA from Harvard Business School.",
      image: "DK",
      gradient: "from-accent to-primary",
    },
  ];

  const advisors = [
    { name: "Dr. Robert Lee", role: "Former FDA Commissioner" },
    { name: "Jennifer Walsh", role: "Partner at Andreessen Horowitz" },
    { name: "Dr. Priya Sharma", role: "WHO Digital Health Advisor" },
    { name: "Mark Stevens", role: "Former CEO, Anthem" },
  ];

  return (
    <section id="team" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            👥 Our Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Meet the people building the{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              future of health
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our diverse team of healthcare experts, engineers, and innovators is united by a single mission: putting patients in control of their health data.
          </p>
        </div>

        {/* Leadership Team */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {team.map((member, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {member.image}
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-primary font-medium text-sm mb-3">{member.role}</p>
              <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
              <div className="flex justify-center gap-3">
                <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Advisors */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Advisory Board</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advisors.map((advisor, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 flex items-center justify-center text-muted-foreground text-lg font-bold mx-auto mb-3">
                  {advisor.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h4 className="font-semibold">{advisor.name}</h4>
                <p className="text-sm text-muted-foreground">{advisor.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
