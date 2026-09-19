import { Target, Eye } from "lucide-react";

interface AboutMissionVisionSectionProps {
  missionData?: Record<string, any> | null;
  visionData?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (target: "mission" | "vision", field: string, value: any) => void;
}

export function AboutMissionVisionSection({
  missionData,
  visionData,
  isEditable,
  onUpdateField,
}: AboutMissionVisionSectionProps) {
  const mData = missionData || {};
  const vData = visionData || {};

  const missionTitle = mData.title ?? "Our Mission";
  const missionBody =
    mData.body ??
    "Our mission is to provide quality products and services while valuing our customers at every stage. We strive to make the best use of space and functionality so our plot owners can enjoy comfortable living.";

  const visionTitle = vData.title ?? "Our Vision";
  const visionBody =
    vData.body ??
    "Our vision is to provide quality plots and residential spaces that meet premium standards and support a better lifestyle. We aim to become one of Bangladesh's most admired land development companies by consistently meeting and exceeding customer expectations.";

  return (
    <section className="bg-secondary/20 py-20 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Mission */}
          <div className="rounded-3xl border border-border/60 bg-card p-8 sm:p-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-semibold sm:text-3xl">
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("mission", "title", e.currentTarget.textContent || "")}
                  className="outline-none hover:bg-primary/10 px-1 rounded transition"
                >
                  {missionTitle}
                </span>
              ) : (
                missionTitle
              )}
            </h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("mission", "body", e.currentTarget.textContent || "")}
                  className="outline-none hover:bg-primary/10 px-1 rounded transition block"
                >
                  {missionBody}
                </span>
              ) : (
                missionBody
              )}
            </p>
          </div>

          {/* Vision */}
          <div className="rounded-3xl border border-border/60 bg-card p-8 sm:p-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-semibold sm:text-3xl">
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("vision", "title", e.currentTarget.textContent || "")}
                  className="outline-none hover:bg-primary/10 px-1 rounded transition"
                >
                  {visionTitle}
                </span>
              ) : (
                visionTitle
              )}
            </h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("vision", "body", e.currentTarget.textContent || "")}
                  className="outline-none hover:bg-primary/10 px-1 rounded transition block"
                >
                  {visionBody}
                </span>
              ) : (
                visionBody
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
