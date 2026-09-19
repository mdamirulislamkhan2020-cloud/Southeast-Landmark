export type { Plot, PlotStatus, PhaseSummary, BlockSummary, PlotFilterOptions, PlotBookingRequest, PlotBookingResult } from "./plots";
import type { Plot, PlotStatus, PhaseSummary, BlockSummary, PlotFilterOptions, PlotBookingRequest, PlotBookingResult } from "./plots";
import { submitLead } from "./crm-client";

export const LS_PLOTS = "sel_admin_plots_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const DEFAULT_PROJECTS = [
  { id: "proj-landmark-city-1", name: "Landmark City — Phase 1", location: "Purbachal, Dhaka", pricePerKatha: 1800000 },
  { id: "proj-riverside-township", name: "Riverside Township", location: "Keraniganj, Dhaka", pricePerKatha: 2400000 },
  { id: "proj-skyline-green", name: "Skyline Green Enclave", location: "Savar, Dhaka", pricePerKatha: 1200000 },
  { id: "proj-adabor-garden", name: "Adabor Garden Plots", location: "Adabor, Dhaka", pricePerKatha: 2200000 },
  { id: "proj-ring-road-signature", name: "Ring Road Signature Township", location: "Mohammadpur, Dhaka", pricePerKatha: 2800000 },
  { id: "proj-uttara-sky", name: "Uttara Sky Enclave", location: "Uttara, Dhaka", pricePerKatha: 3000000 },
];

export function seedPlots(): Plot[] {
  const existing = readLS<Plot[] | null>(LS_PLOTS, null);
  if (existing && existing.length > 0) return existing;

  const now = new Date().toISOString();
  const generated: Plot[] = [];

  const phases = ["Phase 1", "Phase 2"];
  const blocks = ["Block A", "Block B", "Block C", "Block D"];
  const roads = ["Road 01 (40 ft)", "Road 02 (30 ft)", "Road 03 (30 ft)", "Grand Avenue (60 ft)"];
  const facings: Array<Plot["facing"]> = ["South", "North", "East", "West", "South-East", "North-East"];

  DEFAULT_PROJECTS.forEach((proj) => {
    phases.forEach((phase) => {
      blocks.forEach((block) => {
        for (let i = 1; i <= 8; i++) {
          const isCorner = i === 1 || i === 8;
          const isAvenue = i % 4 === 0;
          const road = isAvenue ? roads[3] : roads[i % 3];
          const katha = i % 3 === 0 ? 5 : (i % 2 === 0 ? 4 : 3);
          const priceMultiplier = isCorner ? 1.08 : (isAvenue ? 1.05 : 1.0);
          const unitPrice = Math.round(proj.pricePerKatha * priceMultiplier);
          const totalPrice = unitPrice * katha;
          
          let status: PlotStatus = "available";
          if (i === 3) status = "reserved";
          else if (i === 5) status = "booked";
          else if (i === 7) status = "sold";

          generated.push({
            id: `plot-${proj.id}-${phase.replace(/\s+/g, "").toLowerCase()}-${block.replace(/\s+/g, "").toLowerCase()}-${i}`,
            projectId: proj.id,
            projectName: proj.name,
            phase,
            block,
            road,
            roadWidth: isAvenue ? "60 ft" : (i % 3 === 0 ? "40 ft" : "30 ft"),
            plotNumber: `Plot #${i < 10 ? "0" + i : i}`,
            plotSizeKatha: katha,
            facing: facings[(i + block.charCodeAt(6)) % facings.length],
            category: isCorner ? "Corner Plot" : (isAvenue ? "Avenue Plot" : "Residential"),
            pricePerKatha: unitPrice,
            totalPrice,
            status,
            isCorner,
            isAvenue,
            handoverYear: 2026,
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    });
  });

  writeLS(LS_PLOTS, generated);
  return generated;
}

export async function listPlots(filters: PlotFilterOptions = {}): Promise<Plot[]> {
  const plots = seedPlots();
  return plots.filter((p) => {
    if (filters.projectId && p.projectId !== filters.projectId) return false;
    if (filters.phase && filters.phase !== "all" && p.phase !== filters.phase) return false;
    if (filters.block && filters.block !== "all" && p.block !== filters.block) return false;
    if (filters.status && filters.status !== "all" && p.status !== filters.status) return false;
    if (filters.facing && filters.facing !== "all" && p.facing !== filters.facing) return false;
    if (filters.minKatha && p.plotSizeKatha < filters.minKatha) return false;
    if (filters.maxKatha && p.plotSizeKatha > filters.maxKatha) return false;
    if (filters.isCorner !== undefined && p.isCorner !== filters.isCorner) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match = (p.projectName + p.phase + p.block + p.road + p.plotNumber + p.category).toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export async function getPlotById(id: string): Promise<Plot | null> {
  const plots = seedPlots();
  return plots.find((p) => p.id === id) ?? null;
}

export async function updatePlot(id: string, patch: Partial<Plot>): Promise<Plot> {
  const plots = seedPlots();
  const idx = plots.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Plot not found");

  const updated: Plot = {
    ...plots[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  if (patch.pricePerKatha || patch.plotSizeKatha) {
    updated.totalPrice = updated.plotSizeKatha * updated.pricePerKatha;
  }

  plots[idx] = updated;
  writeLS(LS_PLOTS, plots);
  return updated;
}

export async function createPlot(input: Omit<Plot, "id" | "createdAt" | "updatedAt">): Promise<Plot> {
  const plots = seedPlots();
  const now = new Date().toISOString();
  const newPlot: Plot = {
    ...input,
    id: `plot-${uid()}`,
    totalPrice: input.plotSizeKatha * input.pricePerKatha,
    createdAt: now,
    updatedAt: now,
  };

  plots.unshift(newPlot);
  writeLS(LS_PLOTS, plots);
  return newPlot;
}

export async function deletePlot(id: string): Promise<boolean> {
  const plots = seedPlots();
  const filtered = plots.filter((p) => p.id !== id);
  writeLS(LS_PLOTS, filtered);
  return true;
}

export async function getPlotHierarchy(projectId?: string): Promise<{ phases: PhaseSummary[]; blocks: BlockSummary[] }> {
  const plots = seedPlots();
  const targetPlots = projectId ? plots.filter((p) => p.projectId === projectId) : plots;

  const phaseMap = new Map<string, PhaseSummary>();
  const blockMap = new Map<string, BlockSummary>();

  targetPlots.forEach((p) => {
    if (!phaseMap.has(p.phase)) {
      phaseMap.set(p.phase, {
        phase: p.phase,
        totalPlots: 0,
        availablePlots: 0,
        bookedPlots: 0,
        soldPlots: 0,
        blocks: [],
      });
    }
    const ps = phaseMap.get(p.phase)!;
    ps.totalPlots++;
    if (p.status === "available") ps.availablePlots++;
    if (p.status === "booked" || p.status === "reserved") ps.bookedPlots++;
    if (p.status === "sold") ps.soldPlots++;
    if (!ps.blocks.includes(p.block)) ps.blocks.push(p.block);

    const blockKey = `${p.phase}-${p.block}`;
    if (!blockMap.has(blockKey)) {
      blockMap.set(blockKey, {
        block: p.block,
        phase: p.phase,
        totalPlots: 0,
        availablePlots: 0,
        bookedPlots: 0,
        soldPlots: 0,
      });
    }
    const bs = blockMap.get(blockKey)!;
    bs.totalPlots++;
    if (p.status === "available") bs.availablePlots++;
    if (p.status === "booked" || p.status === "reserved") bs.bookedPlots++;
    if (p.status === "sold") bs.soldPlots++;
  });

  return {
    phases: Array.from(phaseMap.values()),
    blocks: Array.from(blockMap.values()),
  };
}

export async function bookPlot(req: PlotBookingRequest): Promise<PlotBookingResult> {
  const plot = await getPlotById(req.plotId);
  if (!plot) {
    return { success: false, message: "Selected plot could not be found." };
  }

  if (plot.status !== "available") {
    return {
      success: false,
      message: `Plot ${plot.plotNumber} is currently marked as ${plot.status}. Please choose another available plot.`,
    };
  }

  const downPaymentAmount = Math.round((plot.totalPrice * req.downPaymentPercent) / 100);
  const remainingAmount = plot.totalPrice - downPaymentAmount;
  const monthlyInstallment = Math.round(remainingAmount / req.installmentMonths);

  // Submit Lead to CRM
  const createdLead = await submitLead({
    source: "Plot Booking Application",
    answers: {
      name: req.leadName,
      phone: req.leadPhone,
      email: req.leadEmail,
      plotId: plot.id,
      projectName: plot.projectName,
      plotNumber: plot.plotNumber,
      phase: plot.phase,
      block: plot.block,
      road: plot.road,
      plotSizeKatha: `${plot.plotSizeKatha} Katha`,
      pricePerKatha: `BDT ${plot.pricePerKatha.toLocaleString()}`,
      totalPrice: `BDT ${plot.totalPrice.toLocaleString()}`,
      downPaymentPercent: `${req.downPaymentPercent}%`,
      downPaymentAmount: `BDT ${downPaymentAmount.toLocaleString()}`,
      monthlyInstallment: `BDT ${monthlyInstallment.toLocaleString()}/month`,
      durationMonths: `${req.installmentMonths} Months`,
      notes: req.notes || "",
    },
  });

  // Update Plot Status to 'reserved'
  const updatedPlot = await updatePlot(plot.id, {
    status: "reserved",
    bookedByLeadId: createdLead.id,
    reservedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return {
    success: true,
    message: `Plot ${plot.plotNumber} in ${plot.projectName} reserved successfully. Our executive will contact you to complete formal documentation.`,
    plot: updatedPlot,
    leadId: createdLead.id,
    calculatedSummary: {
      totalPrice: plot.totalPrice,
      downPaymentAmount,
      monthlyInstallment,
      durationMonths: req.installmentMonths,
    },
  };
}
