import { Link } from "@tanstack/react-router";
import { Home, ChevronRight } from "lucide-react";
import heroBg from "@/assets/brand/hero.jpg";

export function PageHero({ title, crumb }: { title: string; crumb: string }) {
  return (
    <section
      className="relative isolate flex min-h-[320px] items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95" />
      <div className="relative z-10 flex flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl">
          {title}
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/70 px-5 py-2 text-sm backdrop-blur">
          <Link to="/" className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary">
            <Home className="h-4 w-4" /> Home
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-primary">{crumb}</span>
        </div>
      </div>
    </section>
  );
}