import { blockData, CmsAssignedLeadForm, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { HomeHeroSection } from "@/components/sections/home/HomeHeroSection";
import { HomeFeaturesSection } from "@/components/sections/home/HomeFeaturesSection";
import { HomeAboutSection } from "@/components/sections/home/HomeAboutSection";
import { HomeProjectsSection } from "@/components/sections/home/HomeProjectsSection";
import { HomeTestimonialsSection } from "@/components/sections/home/HomeTestimonialsSection";
import { HomeStatsSection } from "@/components/sections/home/HomeStatsSection";
import { HomeBlogSection } from "@/components/sections/home/HomeBlogSection";

export function HomePage() {
  const blocks = useCmsPageBlocks("/");
  const heroBlock = blockData(blocks, "home.hero");
  const featuresBlock = blockData(blocks, "home.features");
  const aboutBlock = blockData(blocks, "home.about");
  const projectsBlock = blockData(blocks, "home.projects");
  const testimonialsBlock = blockData(blocks, "home.testimonials");
  const statsBlock = blockData(blocks, "home.stats");
  const blogBlock = blockData(blocks, "home.blog");

  return (
    <div className="w-full">
      <HomeHeroSection data={heroBlock} />
      <HomeFeaturesSection data={featuresBlock} />
      <HomeAboutSection data={aboutBlock} />
      <HomeProjectsSection data={projectsBlock} />
      <HomeTestimonialsSection data={testimonialsBlock} />
      <HomeStatsSection data={statsBlock} />
      <HomeBlogSection data={blogBlock} />
      <CmsAssignedLeadForm pageSlug="/" />
    </div>
  );
}
