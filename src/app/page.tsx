import Navbar from "@/components/marketing/Navbar"
import HeroSection from "@/components/marketing/HeroSection"
import FeaturesSection from "@/components/marketing/FeaturesSection"
import HowItWorksSection from "@/components/marketing/HowItWorksSection"
import CtaBanner from "@/components/marketing/CtaBanner"
import Footer from "@/components/marketing/Footer"

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaBanner />
      <Footer />
    </div>
  )
}
