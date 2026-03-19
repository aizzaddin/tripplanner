import AnnouncementBar from "@/components/marketing/AnnouncementBar"
import Navbar from "@/components/marketing/Navbar"
import HeroSection from "@/components/marketing/HeroSection"
import FeaturesSection from "@/components/marketing/FeaturesSection"
import TextCycleSection from "@/components/marketing/TextCycleSection"
import HowItWorksSection from "@/components/marketing/HowItWorksSection"
import ComparisonSection from "@/components/marketing/ComparisonSection"
import TestimonialsSection from "@/components/marketing/TestimonialsSection"
import PricingSection from "@/components/marketing/PricingSection"
import Footer from "@/components/marketing/Footer"

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TextCycleSection />
      <HowItWorksSection />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </div>
  )
}
