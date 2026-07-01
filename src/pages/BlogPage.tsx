import { PageHero } from "@/components/site/PageHero";
import { User, Calendar } from "lucide-react";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";

const posts = [
  { title: "A Practical Guide to Land Investment in Bangladesh", date: "12/02/2026", img: p1 },
  { title: "Ten Tips Before Booking Your First Residential Plot", date: "05/02/2026", img: p2 },
  { title: "How to Evaluate a Planned Township Project", date: "22/01/2026", img: p3 },
  { title: "Planning Townships for the Next Generation of Plot Owners", date: "15/01/2026", img: p2 },
  { title: "How Do You Value a Residential Land Plot?", date: "05/01/2026", img: p1 },
  { title: "Starting Your Land Investment Journey with ৳ 10 Lac", date: "20/12/2025", img: p3 },
];

function BlogPageStatic() {
  return (
    <div>
      <PageHero title="Blog" crumb="Blog" />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-medium text-primary">News &amp; Insights</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Land Investment News &amp; Township Insights
            </h2>
          </div>
          <p className="text-muted-foreground">
            Explore our journal for expert land investment articles, township
            planning updates and stories from behind the scenes at Southeast
            Landmark.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {posts.map((p, i) => (
            <article key={i} className="flex gap-5 rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/50">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                <img src={p.img} alt="" loading="lazy" width={200} height={200} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold leading-snug hover:text-primary">{p.title}</h3>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary" /> Admin</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" /> {p.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
import { CmsPageContent as _CmsPageContent__BlogPage } from "@/components/site/CmsPageContent";
export function BlogPage() {
  return (
    <_CmsPageContent__BlogPage path="/blog">
      <BlogPageStatic />
    </_CmsPageContent__BlogPage>
  );
}
