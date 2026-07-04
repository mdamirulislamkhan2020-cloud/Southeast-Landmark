import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Seo } from "@/components/site/Seo";
import { getBlogPostBySlug } from "@/admin/api/content-client";
import type { BlogPost } from "@/admin/api/content";
import { formatLongDate } from "@/lib/format";

export function BlogDetailPage() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPost | null | "notfound">(null);

  useEffect(() => {
    let alive = true;
    getBlogPostBySlug(slug)
      .then((p) => { if (alive) setPost(p ?? "notfound"); })
      .catch(() => { if (alive) setPost("notfound"); });
    return () => { alive = false; };
  }, [slug]);

  if (post === null) {
    return <div className="min-h-[50vh] flex items-center justify-center text-sm text-muted-foreground">Loading article…</div>;
  }
  if (post === "notfound") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">This article isn't available or hasn't been published.</p>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    );
  }

  const publishedOn = formatLongDate(post.publishedAt || post.publishAt || post.updatedAt);

  return (
    <>
      <Seo
        title={post.seo.title || `${post.title} — Southeast Landmark Ltd`}
        description={post.seo.description || post.excerpt || post.title}
        path={`/blog/${post.slug}`}
        ogImage={post.og.image || post.featuredImage || null}
      />
      <PageHero title={post.title} crumb="Blog" />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary" /> {post.author || "Editorial"}</span>
          {publishedOn && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> {publishedOn}</span>}
          {post.readingTime > 0 && <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {post.readingTime} min read</span>}
          {post.categories.map((c) => (
            <span key={c} className="rounded-full border border-primary/30 px-3 py-1 text-primary">{c}</span>
          ))}
        </div>
        {post.featuredImage && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-primary/20">
            <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}
        {post.excerpt && <p className="mt-8 text-lg text-muted-foreground">{post.excerpt}</p>}
        <div className="prose prose-sm mt-8 max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1">#{t}</span>
            ))}
          </div>
        )}
        <div className="mt-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to all articles
          </Link>
        </div>
      </article>
    </>
  );
}