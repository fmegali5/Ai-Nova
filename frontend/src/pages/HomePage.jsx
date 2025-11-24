import Navbar from "../components/Navbar";
import TopNoticeBar from "../components/TopNoticeBar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import AIChatBot from "../components/AIChatBot"; // NEW

function HomePage() {
  return (
    <>
      <TopNoticeBar />
      <div className="min-h-screen bg-slate-900 home-page-wrapper">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <Footer />
        <AIChatBot /> {/* NEW - AI Chat Assistant */}
      </div>
    </>
  );
}

export default HomePage;
