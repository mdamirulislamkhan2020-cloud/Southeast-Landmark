import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useVisibility } from "@/lib/use-visibility";
import { decideVisibility } from "@/admin/api/visibility-client";
import { getSession } from "@/admin/api/client";
import type { ComingSoonSettings, MaintenanceSettings } from "@/admin/api/visibility";

export function VisibilityGate({ children }: { children: React.ReactNode }) {
  const settings = useVisibility();
  const loc = useLocation();
  const isAuthed = !!getSession();

  const decision = useMemo(
    () => decideVisibility(loc.pathname, settings, isAuthed),
    [loc.pathname, settings, isAuthed],
  );

  const meta = decision.noindex ? (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  ) : null;

  if (decision.action === "allow") {
    return (
      <>
        {meta}
        {children}
      </>
    );
  }

  if (decision.action === "redirect" && decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace />;
  }

  if (decision.action === "coming_soon") {
    return (
      <>
        {meta}
        <ComingSoonScreen data={settings.comingSoon} />
      </>
    );
  }

  if (decision.action === "maintenance") {
    return (
      <>
        {meta}
        <MaintenanceScreen data={settings.maintenance} />
      </>
    );
  }

  // 404
  return (
    <>
      {meta}
      <NotAvailableScreen />
    </>
  );
}

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

function ComingSoonScreen({ data }: { data: ComingSoonSettings }) {
  const { days, hours, minutes, seconds } = useCountdown(data.countdownTo);
  const cells: Array<[string, number]> = [["Days", days], ["Hours", hours], ["Minutes", minutes], ["Seconds", seconds]];
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16 text-center text-foreground"
      style={data.background ? { backgroundImage: `url(${data.background})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div className="relative z-10 mx-auto max-w-2xl">
        {data.logo && <img src={data.logo} alt="Logo" className="mx-auto mb-8 h-16 w-auto" />}
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{data.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{data.description}</p>
        <div className="mt-10 grid grid-cols-4 gap-3">
          {cells.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-card px-3 py-4 shadow-sm">
              <div className="text-3xl font-bold tabular-nums">{String(value).padStart(2, "0")}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        {(data.contactNumber || Object.values(data.socials).some(Boolean)) && (
          <div className="mt-10 flex flex-col items-center gap-3 text-sm text-muted-foreground">
            {data.contactNumber && <div>Contact: {data.contactNumber}</div>}
            <div className="flex gap-3">
              {Object.entries(data.socials).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" className="capitalize text-primary hover:underline">{k}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MaintenanceScreen({ data }: { data: MaintenanceSettings }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-center text-foreground">
      <div className="mx-auto max-w-xl">
        {data.logo && <img src={data.logo} alt="Logo" className="mx-auto mb-8 h-16 w-auto" />}
        <div className="inline-block rounded-full border border-border bg-secondary/40 px-4 py-1 text-xs uppercase tracking-widest text-muted-foreground">Maintenance</div>
        <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">{data.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{data.description}</p>
        {(data.contactEmail || data.contactNumber) && (
          <div className="mt-8 text-sm text-muted-foreground">
            Need urgent help?{" "}
            {data.contactEmail && <a className="text-primary hover:underline" href={`mailto:${data.contactEmail}`}>{data.contactEmail}</a>}
            {data.contactEmail && data.contactNumber && <span> • </span>}
            {data.contactNumber && <span>{data.contactNumber}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function NotAvailableScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-center text-foreground">
      <div className="mx-auto max-w-md">
        <div className="font-display text-6xl font-semibold text-primary">404</div>
        <h1 className="mt-4 text-2xl font-semibold">Page not available</h1>
        <p className="mt-2 text-muted-foreground">This page is currently unavailable. Please check back later.</p>
      </div>
    </div>
  );
}