import { PageHero } from "@/components/site/PageHero";

interface AboutHeroSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function AboutHeroSection({ data, isEditable, onUpdateField }: AboutHeroSectionProps) {
  const d = data || {};
  const title = d.title ?? "About Us";
  const crumb = d.crumb ?? "About Us";

  if (isEditable) {
    return (
      <div className="w-full">
        <PageHero
          title={
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("title", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/20 px-1 rounded transition inline-block"
            >
              {title}
            </span> as any
          }
          crumb={crumb}
        />
      </div>
    );
  }

  return <PageHero title={title} crumb={crumb} />;
}
