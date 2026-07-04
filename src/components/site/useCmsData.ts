import { useEffect, useState } from "react";
import { listProperties } from "@/admin/api/properties-client";
import { listBlogPosts, listFaqs, listTestimonials } from "@/admin/api/content-client";
import { getGlobalSettings, DEFAULT_GLOBAL } from "@/admin/api/settings-client";
import { listSeoEntities } from "@/admin/api/seo-client";
import type { Property } from "@/admin/api/properties";
import type { BlogPost, Faq, Testimonial } from "@/admin/api/content";
import type { GlobalSettings } from "@/admin/api/settings";
import type { SeoMeta } from "@/admin/api/seo";
import { emptyMeta } from "@/admin/api/seo";

/**
 * Repository-backed read hooks for the public site. All database access still
 * lives in `src/admin/api/*-client.ts`; these hooks only expose the results to
 * React components so no page ever imports the raw supabase client.
 */

export function usePublishedProperties(limit = 24): { items: Property[]; loading: boolean } {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    listProperties({ status: "published", perPage: limit })
      .then((r) => { if (alive) setItems(r.items); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [limit]);
  return { items, loading };
}

export function usePublishedBlogPosts(limit = 12): { items: BlogPost[]; loading: boolean } {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    listBlogPosts({ status: "published", perPage: limit })
      .then((r) => { if (alive) setItems(r.items); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [limit]);
  return { items, loading };
}

export function useActiveFaqs(): { items: Faq[]; loading: boolean } {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    listFaqs({ active: "active" })
      .then((r) => { if (alive) setItems(r); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  return { items, loading };
}

export function useActiveTestimonials(): { items: Testimonial[]; loading: boolean } {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    listTestimonials({ active: "active" })
      .then((r) => { if (alive) setItems(r); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  return { items, loading };
}

export function useGlobalSettings(): GlobalSettings {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_GLOBAL);
  useEffect(() => {
    let alive = true;
    getGlobalSettings()
      .then((s) => { if (alive) setSettings(s); })
      .catch(() => { /* keep defaults */ });
    return () => { alive = false; };
  }, []);
  return settings;
}

/**
 * Look up per-page SEO overrides by canonical slug ("/", "/about", etc.).
 * Returns the DB record when available, else `emptyMeta()`.
 */
export function useSeoMeta(slug: string): { meta: SeoMeta; loading: boolean } {
  const [meta, setMeta] = useState<SeoMeta>(emptyMeta());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    listSeoEntities()
      .then((entities) => {
        if (!alive) return;
        const match = entities.find((e) => e.slug === slug);
        setMeta(match?.meta ?? emptyMeta());
      })
      .catch(() => { if (alive) setMeta(emptyMeta()); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);
  return { meta, loading };
}