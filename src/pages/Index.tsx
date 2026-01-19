import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import Demo from "@/components/Demo";
import About from "@/components/About";
import Team from "@/components/Team";
import Investors from "@/components/Investors";
import Contact from "@/components/Contact";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <ProblemSolution />
      <Features />
      <Demo />
      <About />
      <Team />
      <Investors />
      <Contact />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
