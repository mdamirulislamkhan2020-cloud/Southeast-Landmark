import { PageHero } from "@/components/site/PageHero";

interface FaqHeroSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function FaqHeroSection({ data, isEditable, onUpdateField }: FaqHeroSectionProps) {
  const d = data || {};
  const title = d.title ?? "FAQ";
  const crumb = d.crumb ?? "FAQ";

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
