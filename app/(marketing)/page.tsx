import TopNav from "../components/TopNav";
import HeroSection from "./_components/HeroSection";
import CVScoreTeaser from "./_components/CVScoreTeaser";
import HowItWorksSection from "./_components/HowItWorksSection";
import SkillAndDashboardSection from "./_components/SkillAndDashboardSection";
import CTASection from "./_components/CTASection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a2540]">
      <TopNav />
      <HeroSection />
      <CVScoreTeaser />
      <HowItWorksSection />
      <SkillAndDashboardSection />
      <CTASection />
    </div>
  );
}
