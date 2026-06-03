import TopNav from "../components/TopNav";
import HeroSection from "./_components/HeroSection";
import CVScoreTeaser from "./_components/CVScoreTeaser";
import HowItWorksSection from "./_components/HowItWorksSection";
import SkillRoadmapSection from "./_components/SkillRoadmapSection";
import DashboardPreviewSection from "./_components/DashboardPreviewSection";
import CTASection from "./_components/CTASection";
import Footer from "./_components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a2540]">
      <TopNav />
      <HeroSection />
      <CVScoreTeaser />
      <HowItWorksSection />
      <SkillRoadmapSection />
      <DashboardPreviewSection />
      <CTASection />
      <Footer />
    </div>
  );
}
