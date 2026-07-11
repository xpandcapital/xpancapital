import { SideAnchorNav } from "@/components/ui/SideAnchorNav"
import {
  HeroSection,
  AuthorityBar,
  Ecosystem,
  InstructorProfile,
  SocialProof,
  MasterclassCTA,
  XpandFooter,
} from "@/components/sections/xpand"

export default function Home() {
  return (
    <main className="bg-[#050505] text-white min-h-screen relative">
      <SideAnchorNav />
      <HeroSection />
      <AuthorityBar />
      <Ecosystem />
      <InstructorProfile />
      <SocialProof />
      <MasterclassCTA />
      <XpandFooter />
    </main>
  )
}
