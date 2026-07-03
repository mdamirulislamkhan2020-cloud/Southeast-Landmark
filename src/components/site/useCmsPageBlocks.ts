import { createElement, useEffect, useState } from "react";
import { getPageByPath } from "@/admin/api/client";
import type { CmsPage, PageBlock } from "@/admin/api/types";
import { BlockRenderer } from "@/admin/components/BlockRenderer";

export function useCmsPage(path: string) {
  const [page, setPage] = useState<CmsPage | null>(null);

  useEffect(() => {
    let alive = true;
    getPageByPath(path)
      .then((nextPage) => {
        if (alive) setPage(nextPage ?? null);
      })
      .catch(() => {
        if (alive) setPage(null);
      });
    return () => {
      alive = false;
    };
  }, [path]);

  return page;
}

export function useCmsPageBlocks(path: string) {
  const page = useCmsPage(path);
  return Array.isArray(page?.blocks) ? page.blocks : [];
}

export function CmsAssignedLeadForm({ path }: { path: string }) {
  const page = useCmsPage(path);
  if (!page?.formId) return null;
  return createElement(BlockRenderer, {
    block: { id: `${page.id}-assigned-form`, type: "lead_form", data: { formId: page.formId } },
    containerWidth: 1200,
    pageFormId: page.formId,
  });
}

export function blockData(blocks: PageBlock[], key: string) {
  return blocks.find((block) => block.data?.key === key)?.data ?? null;
}

export function cmsString(data: Record<string, unknown> | null, key: string, fallback: string) {
  const value = data?.[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function cmsList<T>(data: Record<string, unknown> | null, key: string, fallback: T[]): T[] {
  const value = data?.[key];
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
}