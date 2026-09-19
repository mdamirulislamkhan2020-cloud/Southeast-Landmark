export type PlotStatus = "available" | "booked" | "sold" | "reserved" | "hold";
export type FacingDirection = "North" | "South" | "East" | "West" | "North-East" | "North-West" | "South-East" | "South-West";
export type RoadWidth = "25 ft" | "30 ft" | "40 ft" | "60 ft" | "80 ft" | "100 ft";

export interface Plot {
  id: string;
  projectId: string; // references Property/Project id
  projectName: string;
  phase: string; // e.g., "Phase 1", "Phase 2"
  block: string; // e.g., "Block A", "Block B"
  road: string;  // e.g., "Road 04", "Avenue 01"
  roadWidth: RoadWidth;
  plotNumber: string; // e.g., "Plot #14"
  plotSizeKatha: number; // e.g., 3, 4, 5, 10
  facing: FacingDirection;
  category: "Residential" | "Commercial" | "Corner Plot" | "Avenue Plot";
  pricePerKatha: number; // in BDT
  totalPrice: number; // plotSizeKatha * pricePerKatha
  status: PlotStatus;
  isCorner: boolean;
  isAvenue: boolean;
  handoverYear?: number;
  reservedUntil?: string | null;
  bookedByLeadId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhaseSummary {
  phase: string;
  totalPlots: number;
  availablePlots: number;
  bookedPlots: number;
  soldPlots: number;
  blocks: string[];
}

export interface BlockSummary {
  block: string;
  phase: string;
  totalPlots: number;
  availablePlots: number;
  bookedPlots: number;
  soldPlots: number;
}

export interface PlotFilterOptions {
  projectId?: string;
  phase?: string;
  block?: string;
  road?: string;
  status?: PlotStatus | "all";
  facing?: FacingDirection | "all";
  minKatha?: number;
  maxKatha?: number;
  minPrice?: number;
  maxPrice?: number;
  isCorner?: boolean;
  search?: string;
}

export interface PlotBookingRequest {
  plotId: string;
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  installmentMonths: number; // 36, 48, 60
  downPaymentPercent: number; // 10%, 20%, 30%
  notes?: string;
}

export interface PlotBookingResult {
  success: boolean;
  message: string;
  plot?: Plot;
  leadId?: string;
  calculatedSummary?: {
    totalPrice: number;
    downPaymentAmount: number;
    monthlyInstallment: number;
    durationMonths: number;
  };
}
