import { useEffect, useState } from "react";
import { getVisibility, VISIBILITY_UPDATE_EVENT } from "@/admin/api/visibility-client";
import { DEFAULT_VISIBILITY, type VisibilitySettings } from "@/admin/api/visibility";

export function useVisibility(): VisibilitySettings {
  const [data, setData] = useState<VisibilitySettings>(DEFAULT_VISIBILITY);
  useEffect(() => {
    let alive = true;
    const load = () => { getVisibility().then((v) => { if (alive) setData(v); }).catch(() => { /* ignore */ }); };
    load();
    const onUpd = () => load();
    window.addEventListener(VISIBILITY_UPDATE_EVENT, onUpd);
    window.addEventListener("storage", onUpd);
    return () => {
      alive = false;
      window.removeEventListener(VISIBILITY_UPDATE_EVENT, onUpd);
      window.removeEventListener("storage", onUpd);
    };
  }, []);
  return data;
}