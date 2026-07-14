import { SideAnchorNav } from "@/components/ui/SideAnchorNav"
import {
  HeroSection,
  PromoVideo,
  AuthorityBar,
  Ecosystem,
  TrackRecord,
  Roadmap,
  InstructorProfile,
  SocialProof,
  Pricing,
  Tools,
  VideoPreviews,
  FaqSection,
  MasterclassCTA,
  XpandFooter,
  WhatsAppFAB,
} from "@/components/sections/xpand"

export default function Home() {
  return (
    <main className="bg-[#050505] text-white min-h-screen relative">
      <SideAnchorNav />
      <HeroSection />
      <PromoVideo />
      <AuthorityBar />
      <Ecosystem />
      <TrackRecord />
      <Roadmap />
      <InstructorProfile />
      <SocialProof />
      <Pricing />
      <Tools />
      <VideoPreviews />
      <FaqSection />
      <MasterclassCTA />
      <XpandFooter />
      <WhatsAppFAB />
    </main>
  )
}
