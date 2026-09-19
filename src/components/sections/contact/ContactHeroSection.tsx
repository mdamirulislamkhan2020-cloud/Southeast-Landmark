import { PageHero } from "@/components/site/PageHero";

interface ContactHeroSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function ContactHeroSection({ data, isEditable, onUpdateField }: ContactHeroSectionProps) {
  const d = data || {};
  const title = d.title ?? "Contact Us";
  const crumb = d.crumb ?? "Contact Us";

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
