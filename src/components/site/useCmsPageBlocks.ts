import { useEffect, useState } from "react";
import { getPageByPath } from "@/admin/api/client";
import type { PageBlock } from "@/admin/api/types";

export function useCmsPageBlocks(path: string) {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);

  useEffect(() => {
    let alive = true;
    getPageByPath(path)
      .then((page) => {
        if (!alive) return;
        setBlocks(Array.isArray(page?.blocks) ? page.blocks : []);
      })
      .catch(() => {
        if (alive) setBlocks([]);
      });
    return () => {
      alive = false;
    };
  }, [path]);

  return blocks;
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