import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getHeaderSettings,
  getFooterSettings,
  getMobileMenuSettings,
  saveHeaderSettings,
  saveFooterSettings,
  saveMobileMenuSettings,
  listMenus,
  saveMenu,
} from "../api/navigation-client";
import {
  getTheme,
  updateTheme,
  getGlobalSettings,
  updateGlobalSettings,
} from "../api/settings-client";
import type { CustomizerSection, CustomizerState, ViewportMode } from "./types";
import { CustomizerToolbar } from "./CustomizerToolbar";
import { CustomizerSidebar } from "./CustomizerSidebar";
import { CustomizerCanvas } from "./CustomizerCanvas";
import { Loader2 } from "lucide-react";
import { toErrorMessage } from "@/lib/error-handler";

const MAX_HISTORY = 25;

export function SiteCustomizerPage() {
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState<CustomizerSection>("header");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [previewPage, setPreviewPage] = useState<string>("/");
  const [isSaving, setIsSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Queries to load settings from Supabase
  const { data: headerSettings, isLoading: l1 } = useQuery({
    queryKey: ["headerSettings"],
    queryFn: getHeaderSettings,
  });
  const { data: footerSettings, isLoading: l2 } = useQuery({
    queryKey: ["footerSettings"],
    queryFn: getFooterSettings,
  });
  const { data: mobileSettings, isLoading: l3 } = useQuery({
    queryKey: ["mobileMenuSettings"],
    queryFn: getMobileMenuSettings,
  });
  const { data: menus = [], isLoading: l4 } = useQuery({
    queryKey: ["menus"],
    queryFn: listMenus,
  });
  const { data: themeSettings, isLoading: l5 } = useQuery({
    queryKey: ["theme"],
    queryFn: getTheme,
  });
  const { data: globalSettings, isLoading: l6 } = useQuery({
    queryKey: ["globalSettings"],
    queryFn: getGlobalSettings,
  });

  // Master local state for customizer
  const [state, setState] = useState<CustomizerState | null>(null);
  const initialSnapshot = useRef<string>("");

  // History stack for Undo / Redo
  const [history, setHistory] = useState<CustomizerState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize state once queries have loaded
  useEffect(() => {
    if (headerSettings && footerSettings && mobileSettings && themeSettings && globalSettings && !isReady) {
      const initial: CustomizerState = {
        header: headerSettings,
        footer: footerSettings,
        mobile: mobileSettings,
        theme: themeSettings,
        global: globalSettings,
        menus: menus.length > 0 ? menus : [],
      };
      setState(initial);
      initialSnapshot.current = JSON.stringify(initial);
      setHistory([initial]);
      setHistoryIndex(0);
      setIsReady(true);
    }
  }, [headerSettings, footerSettings, mobileSettings, themeSettings, globalSettings, menus, isReady]);

  // Push new state to history stack
  const updateStateWithHistory = useCallback((newState: CustomizerState) => {
    setState(newState);
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      if (next.length >= MAX_HISTORY) next.shift();
      return [...next, newState];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const handleUpdateHeader = (patch: Partial<CustomizerState["header"]>) => {
    if (!state) return;
    const next: CustomizerState = { ...state, header: { ...state.header, ...patch } };
    updateStateWithHistory(next);
  };

  const handleUpdateFooter = (patch: Partial<CustomizerState["footer"]>) => {
    if (!state) return;
    const next: CustomizerState = { ...state, footer: { ...state.footer, ...patch } };
    updateStateWithHistory(next);
  };

  const handleUpdateMobile = (patch: Partial<CustomizerState["mobile"]>) => {
    if (!state) return;
    const next: CustomizerState = { ...state, mobile: { ...state.mobile, ...patch } };
    updateStateWithHistory(next);
  };

  const handleUpdateTheme = (patch: Partial<CustomizerState["theme"]>) => {
    if (!state) return;
    const next: CustomizerState = { ...state, theme: { ...state.theme, ...patch } };
    updateStateWithHistory(next);
  };

  const handleUpdateGlobal = (patch: Partial<CustomizerState["global"]>) => {
    if (!state) return;
    const next: CustomizerState = { ...state, global: { ...state.global, ...patch } };
    updateStateWithHistory(next);
  };

  const handleUpdateMenus = (newMenus: CustomizerState["menus"]) => {
    if (!state) return;
    const next: CustomizerState = { ...state, menus: newMenus };
    updateStateWithHistory(next);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    setState(history[newIdx]);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    setState(history[newIdx]);
  };

  const handleReset = () => {
    if (!initialSnapshot.current) return;
    try {
      const parsed: CustomizerState = JSON.parse(initialSnapshot.current);
      updateStateWithHistory(parsed);
      toast.info("Reset changes to initial session state");
    } catch {
      // ignore
    }
  };

  const isDirty = state ? JSON.stringify(state) !== initialSnapshot.current : false;

  // Persist all changes to Supabase
  const handleSave = async () => {
    if (!state) return;
    setIsSaving(true);
    try {
      // 1. Save Nav Settings to Supabase nav_settings table
      await Promise.all([
        saveHeaderSettings(state.header),
        saveFooterSettings(state.footer),
        saveMobileMenuSettings(state.mobile),
      ]);

      // 2. Save App Settings to Supabase app_settings table
      await Promise.all([
        updateTheme(state.theme),
        updateGlobalSettings(state.global),
      ]);

      // 3. Save any updated Menus
      if (state.menus && state.menus.length > 0) {
        for (const m of state.menus) {
          await saveMenu(m);
        }
      }

      initialSnapshot.current = JSON.stringify(state);

      // Invalidate React Query caches so live preview and public pages reflect immediately
      qc.invalidateQueries({ queryKey: ["headerSettings"] });
      qc.invalidateQueries({ queryKey: ["footerSettings"] });
      qc.invalidateQueries({ queryKey: ["mobileMenuSettings"] });
      qc.invalidateQueries({ queryKey: ["menus"] });
      qc.invalidateQueries({ queryKey: ["theme"] });
      qc.invalidateQueries({ queryKey: ["globalSettings"] });

      toast.success("All website customizer settings published to Cloud!");
    } catch (err: unknown) {
      toast.error("Failed to save settings: " + toErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6 || !state;

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading Website Customizer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <CustomizerToolbar
        viewport={viewport}
        onViewportChange={setViewport}
        previewPage={previewPage}
        onPreviewPageChange={setPreviewPage}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onSave={handleSave}
        isSaving={isSaving}
        isDirty={isDirty}
      />

      {/* Main Workspace (Sidebar + Canvas) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Elementor style control tabs */}
        <div className="w-80 shrink-0 border-r border-border bg-card lg:w-96">
          <CustomizerSidebar
            state={state}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onUpdateHeader={handleUpdateHeader}
            onUpdateFooter={handleUpdateFooter}
            onUpdateMobile={handleUpdateMobile}
            onUpdateTheme={handleUpdateTheme}
            onUpdateGlobal={handleUpdateGlobal}
            onUpdateMenus={handleUpdateMenus}
          />
        </div>

        {/* Center Canvas: Live Website Preview with interactive section selection */}
        <div className="flex-1 overflow-hidden relative">
          <CustomizerCanvas
            state={state}
            viewport={viewport}
            previewPage={previewPage}
            onSelectSection={setActiveSection}
            isInteractive={true}
          />
        </div>
      </div>
    </div>
  );
}
