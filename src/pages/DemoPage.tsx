import Navigation from "@/components/Navigation";
import Demo from "@/components/Demo";
import Footer from "@/components/Footer";

const DemoPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Demo />
      </div>
      <Footer />
    </div>
  );
};

export default DemoPage;
