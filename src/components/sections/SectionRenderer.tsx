import React from "react";
import type { PageBlock } from "@/admin/api/lead-pages";
import { BlockRenderer } from "@/admin/components/BlockRenderer";

// Home Sections
import { HomeHeroSection } from "./home/HomeHeroSection";
import { HomeFeaturesSection } from "./home/HomeFeaturesSection";
import { HomeAboutSection } from "./home/HomeAboutSection";
import { HomeProjectsSection } from "./home/HomeProjectsSection";
import { HomeTestimonialsSection } from "./home/HomeTestimonialsSection";
import { HomeStatsSection } from "./home/HomeStatsSection";
import { HomeBlogSection } from "./home/HomeBlogSection";

// About Sections
import { AboutHeroSection } from "./about/AboutHeroSection";
import { AboutIntroSection } from "./about/AboutIntroSection";
import { AboutStorySection } from "./about/AboutStorySection";
import { AboutMissionVisionSection } from "./about/AboutMissionVisionSection";

// Property Sections
import { PropertyHeroSection } from "./property/PropertyHeroSection";
import { PropertyContentSection } from "./property/PropertyContentSection";

// Blog Sections
import { BlogHeroSection } from "./blog/BlogHeroSection";
import { BlogContentSection } from "./blog/BlogContentSection";

// FAQ Sections
import { FaqHeroSection } from "./faq/FaqHeroSection";
import { FaqContentSection } from "./faq/FaqContentSection";

// Contact Sections
import { ContactHeroSection } from "./contact/ContactHeroSection";
import { ContactContentSection } from "./contact/ContactContentSection";

export interface SectionRendererProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
  onOpenMedia?: (field: string) => void;
  containerWidth?: number;
  pageFormId?: string | null;
}

export function SectionRenderer({
  block,
  isEditable = false,
  onUpdateField,
  onOpenMedia,
  containerWidth = 1200,
  pageFormId,
}: SectionRendererProps) {
  const blockKey = (block.data?.key as string) || "";
  const data = (block.data ?? {}) as Record<string, any>;

  // 1. Check for built-in section keys
  switch (blockKey) {
    // HOME SECTIONS
    case "home.hero":
      return (
        <HomeHeroSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
          onOpenMedia={onOpenMedia}
        />
      );
    case "home.features":
      return (
        <HomeFeaturesSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "home.about":
      return (
        <HomeAboutSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
          onOpenMedia={onOpenMedia}
        />
      );
    case "home.projects":
      return (
        <HomeProjectsSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "home.testimonials":
      return (
        <HomeTestimonialsSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "home.stats":
      return (
        <HomeStatsSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "home.blog":
      return (
        <HomeBlogSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );

    // ABOUT SECTIONS
    case "about.hero":
      return (
        <AboutHeroSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "about.intro":
    case "about.features":
      return (
        <AboutIntroSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "about.story":
      return (
        <AboutStorySection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
          onOpenMedia={onOpenMedia}
        />
      );
    case "about.mission":
      return (
        <AboutMissionVisionSection
          missionData={data}
          visionData={{}}
          isEditable={isEditable}
          onUpdateField={(_target, field, val) => onUpdateField?.(field, val)}
        />
      );
    case "about.vision":
      return (
        <AboutMissionVisionSection
          missionData={{}}
          visionData={data}
          isEditable={isEditable}
          onUpdateField={(_target, field, val) => onUpdateField?.(field, val)}
        />
      );

    // PROPERTY SECTIONS
    case "property.hero":
      return (
        <PropertyHeroSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "property.grid":
      return (
        <PropertyContentSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );

    // BLOG SECTIONS
    case "blog.hero":
      return (
        <BlogHeroSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "blog.grid":
      return (
        <BlogContentSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );

    // FAQ SECTIONS
    case "faq.hero":
      return (
        <FaqHeroSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "faq.content":
      return (
        <FaqContentSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );

    // CONTACT SECTIONS
    case "contact.hero":
      return (
        <ContactHeroSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );
    case "contact.info":
      return (
        <ContactContentSection
          data={data}
          isEditable={isEditable}
          onUpdateField={onUpdateField}
        />
      );

    // 2. Generic blocks: render via BlockRenderer
    default:
      return (
        <BlockRenderer
          block={block}
          containerWidth={containerWidth}
          pageFormId={pageFormId ?? null}
        />
      );
  }
}
