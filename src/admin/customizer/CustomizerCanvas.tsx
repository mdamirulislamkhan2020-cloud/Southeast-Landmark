import React from "react";
import type { CustomizerState, ViewportMode, CustomizerSection } from "./types";
import { PreviewHeader } from "./PreviewHeader";
import { PreviewFooter } from "./PreviewFooter";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { PropertyPage } from "@/pages/PropertyPage";
import { BlogPage } from "@/pages/BlogPage";
import { FAQPage } from "@/pages/FAQPage";
import { ContactPage } from "@/pages/ContactPage";

interface CustomizerCanvasProps {
  state: CustomizerState;
  viewport: ViewportMode;
  previewPage: string;
  onSelectSection: (section: CustomizerSection) => void;
  isInteractive?: boolean;
}

export function CustomizerCanvas({
  state,
  viewport,
  previewPage,
  onSelectSection,
  isInteractive = true,
}: CustomizerCanvasProps) {
  // Compute inline style overrides for the preview container based on live theme settings
  const containerStyle: React.CSSProperties = {
    "--primary": state.theme.primaryColor,
    "--secondary": state.theme.secondaryColor,
    "--accent": state.theme.accentColor,
    "--background": state.theme.backgroundColor || "oklch(0.14 0.005 60)",
    "--card": state.theme.surfaceColor || "oklch(0.18 0.008 70)",
    "--foreground": state.theme.textColor || "oklch(0.96 0.02 90)",
    "--muted-foreground": state.theme.mutedTextColor || "oklch(0.72 0.03 85)",
    "--border": state.theme.borderColor || "oklch(0.30 0.02 85 / 40%)",
    "--radius": `${state.theme.radius ?? 10}px`,
    fontFamily: state.theme.fontBody ? `"${state.theme.fontBody}", sans-serif` : undefined,
  } as React.CSSProperties;

  const renderPageContent = () => {
    switch (previewPage) {
      case "/about":
        return <AboutPage />;
      case "/property":
        return <PropertyPage />;
      case "/blog":
        return <BlogPage />;
      case "/faq":
        return <FAQPage />;
      case "/contact":
        return <ContactPage />;
      case "/":
      default:
        return <HomePage />;
    }
  };

  const getViewportWrapper = (children: React.ReactNode) => {
    if (viewport === "mobile") {
      return (
        <div className="py-6 px-2 flex justify-center bg-muted/40 min-h-full">
          <div className="w-[390px] min-h-[820px] rounded-[42px] border-[10px] border-neutral-800 bg-background shadow-2xl overflow-y-auto overflow-x-hidden relative flex flex-col">
            {/* iPhone Dynamic Island notch */}
            <div className="sticky top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-neutral-900 rounded-full z-50 mx-auto pointer-events-none mb-1 shadow-inner" />
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </div>
      );
    }

    if (viewport === "tablet") {
      return (
        <div className="py-6 px-4 flex justify-center bg-muted/40 min-h-full">
          <div className="w-[768px] min-h-[960px] rounded-[28px] border-[8px] border-neutral-800 bg-background shadow-2xl overflow-y-auto overflow-x-hidden relative flex flex-col">
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </div>
      );
    }

    // Desktop
    return (
      <div className="w-full min-h-full bg-background flex flex-col">
        {children}
      </div>
    );
  };

  return (
    <div
      className="w-full h-full overflow-y-auto bg-background transition-all"
      style={containerStyle}
    >
      {getViewportWrapper(
        <div className="flex-1 flex flex-col w-full">
          {/* Live Preview Header */}
          <PreviewHeader
            settings={state.header}
            mobileSettings={state.mobile}
            menus={state.menus}
            onSelectSection={onSelectSection}
            isInteractive={isInteractive}
          />

          {/* Active Preview Page Body */}
          <main className="flex-1 w-full">
            {renderPageContent()}
          </main>

          {/* Live Preview Footer */}
          <PreviewFooter
            settings={state.footer}
            menus={state.menus}
            onSelectSection={onSelectSection}
            isInteractive={isInteractive}
          />
        </div>
      )}
    </div>
  );
}
