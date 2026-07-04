import { PageHero } from "@/components/site/PageHero";
import { User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";
import { blockData, CmsAssignedLeadForm, cmsString, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { usePublishedBlogPosts } from "@/components/site/useCmsData";
import { formatShortDate } from "@/lib/format";

const fallbackImages = [p1, p2, p3];

export function BlogPage() {
  const blocks = useCmsPageBlocks("/blog");
  const heroBlock = blockData(blocks, "blog.hero");
  const gridBlock = blockData(blocks, "blog.grid");
  const { items: posts, loading } = usePublishedBlogPosts(24);

  return (
    <div>
      <PageHero title={cmsString(heroBlock, "title", "Blog")} crumb={cmsString(heroBlock, "crumb", "Blog")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-medium text-primary">{cmsString(gridBlock, "eyebrow", "News & Insights")}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {cmsString(gridBlock, "title", "Land Investment News & Township Insights")}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {cmsString(gridBlock, "subtitle", "Explore our journal for expert land investment articles, township planning updates and stories from behind the scenes at Southeast Landmark.")}
          </p>
        </div>
        {loading ? (
          <div className="mt-12 rounded-2xl border border-border/60 bg-card p-12 text-center text-sm text-muted-foreground">Loading articles…</div>
        ) : posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border/60 bg-card p-12 text-center text-sm text-muted-foreground">No articles have been published yet.</div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {posts.map((p, i) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="flex gap-5 rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/50">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                  <img src={p.featuredImage || fallbackImages[i % fallbackImages.length]} alt="" loading="lazy" width={200} height={200} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold leading-snug hover:text-primary">{p.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary" /> {p.author || "Editorial"}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" /> {formatShortDate(p.publishedAt || p.publishAt || p.updatedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <CmsAssignedLeadForm path="/blog" />
    </div>
  );
}
