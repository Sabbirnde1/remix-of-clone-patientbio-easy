import { Sparkles, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Features", href: "/features" },
      { name: "Demo", href: "/demo" },
      { name: "Pricing", href: "#pricing" },
      { name: "Security", href: "#security" },
    ],
    Company: [
      { name: "About", href: "/about" },
      { name: "Team", href: "/team" },
      { name: "Investors", href: "/investors" },
      { name: "Careers", href: "#careers" },
    ],
    Resources: [
      { name: "Documentation", href: "#docs" },
      { name: "Support", href: "#support" },
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
    ],
    Connect: [
      { name: "Contact", href: "/contact" },
      { name: "Twitter", href: "#twitter" },
      { name: "LinkedIn", href: "#linkedin" },
      { name: "Blog", href: "#blog" },
    ],
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Patient Bio</span>
            </div>
            <p className="text-background/70 text-sm mb-4">
              Empowering patients with control over their health data.
            </p>
            <div className="space-y-2 text-sm text-background/70">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@patientbio.app</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        className="text-sm text-background/70 hover:text-background transition-colors"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-background/70 hover:text-background transition-colors"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/70">
            © {new Date().getFullYear()} Patient Bio. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-background/70">
            <a href="#privacy" className="hover:text-background transition-colors">
              Privacy
            </a>
            <a href="#terms" className="hover:text-background transition-colors">
              Terms
            </a>
            <a href="#cookies" className="hover:text-background transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
