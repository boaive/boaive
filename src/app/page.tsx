import { Backdrop } from "@/components/layout/Backdrop";
import { DepthGauge } from "@/components/layout/DepthGauge";
import { JumpVeil } from "@/components/layout/JumpVeil";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StageLoader } from "@/components/layout/StageLoader";
import { ScrollDirector } from "@/components/motion/ScrollDirector";
import { CapabilitiesSection } from "@/components/sections/CapabilitiesSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { DiveSection } from "@/components/sections/DiveSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { OutcomeSection } from "@/components/sections/OutcomeSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { StudioSection } from "@/components/sections/StudioSection";
import { WorkSection } from "@/components/sections/WorkSection";
import { ProjectDialog } from "@/components/work/ProjectDialog";
import { Experience } from "@/experience/Experience";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

/**
 * The home page is the story. Every chapter is real, semantic content;
 * the 3D stage behind it (Experience) is a progressive enhancement.
 */
export default function HomePage() {
  return (
    <>
      <Backdrop />
      <Experience />
      <StageLoader />
      <JumpVeil />
      <DepthGauge />

      <main id="main">
        <HeroSection />
        <DiveSection />
        <ProblemSection />
        <CapabilitiesSection />
        <ProcessSection />
        <WorkSection />
        <OutcomeSection />
        <StudioSection />
        <ContactSection />
      </main>

      <SiteFooter />
      <ProjectDialog />
      <ScrollDirector />
      <OrganizationJsonLd />
    </>
  );
}
