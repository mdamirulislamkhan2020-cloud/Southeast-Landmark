import { blockData, CmsAssignedLeadForm, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { AboutHeroSection } from "@/components/sections/about/AboutHeroSection";
import { AboutIntroSection } from "@/components/sections/about/AboutIntroSection";
import { AboutStorySection } from "@/components/sections/about/AboutStorySection";
import { AboutMissionVisionSection } from "@/components/sections/about/AboutMissionVisionSection";

export function AboutPage() {
  const blocks = useCmsPageBlocks("/about");
  const heroBlock = blockData(blocks, "about.hero");
  const introBlock = blockData(blocks, "about.intro") || blockData(blocks, "about.features");
  const storyBlock = blockData(blocks, "about.story");
  const missionBlock = blockData(blocks, "about.mission");
  const visionBlock = blockData(blocks, "about.vision");

  return (
    <div className="w-full">
      <AboutHeroSection data={heroBlock} />
      <AboutIntroSection data={introBlock} />
      <AboutStorySection data={storyBlock} />
      <AboutMissionVisionSection missionData={missionBlock} visionData={visionBlock} />
      <CmsAssignedLeadForm pageSlug="/about" />
    </div>
  );
}
