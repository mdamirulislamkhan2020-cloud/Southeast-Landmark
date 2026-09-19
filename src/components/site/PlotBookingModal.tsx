import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LandPlot, Layers, MapPin, Compass, ShieldCheck, 
  Calculator, CheckCircle2, AlertCircle, Sparkles, ArrowRight 
} from "lucide-react";
import { listPlots, bookPlot, type Plot, type PlotBookingResult } from "@/admin/api/plots-client";
import { fbqTrack } from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";

interface PlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectName?: string;
  defaultPlotId?: string;
}

export function PlotBookingModal({ isOpen, onClose, selectedProjectName, defaultPlotId }: PlotBookingModalProps) {
  const [availablePlots, setAvailablePlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PlotBookingResult | null>(null);

  // Form fields
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [installmentMonths, setInstallmentMonths] = useState(36);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [notes, setNotes] = useState("");

  // Filters for selector inside modal
  const [filterPhase, setFilterPhase] = useState("all");
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterKatha, setFilterKatha] = useState<number | "all">("all");

  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      return;
    }

    const fetchPlots = async () => {
      setLoading(true);
      try {
        const plots = await listPlots();
        // Prefer available plots
        let filtered = plots.filter((p) => p.status === "available");
        if (selectedProjectName) {
          const matchProj = filtered.filter((p) => p.projectName.toLowerCase().includes(selectedProjectName.toLowerCase()));
          if (matchProj.length > 0) filtered = matchProj;
        }
        setAvailablePlots(filtered);

        if (defaultPlotId) {
          const found = plots.find((p) => p.id === defaultPlotId);
          if (found) setSelectedPlot(found);
        } else if (filtered.length > 0 && !selectedPlot) {
          setSelectedPlot(filtered[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlots();
  }, [isOpen, selectedProjectName, defaultPlotId]);

  // Derived calculations
  const totalPrice = selectedPlot ? selectedPlot.totalPrice : 0;
  const downPaymentAmount = Math.round((totalPrice * downPaymentPercent) / 100);
  const remainingAmount = totalPrice - downPaymentAmount;
  const monthlyInstallment = installmentMonths > 0 ? Math.round(remainingAmount / installmentMonths) : 0;

  // Filtered dropdown list
  const filteredPlotOptions = availablePlots.filter((p) => {
    if (filterPhase !== "all" && p.phase !== filterPhase) return false;
    if (filterBlock !== "all" && p.block !== filterBlock) return false;
    if (filterKatha !== "all" && p.plotSizeKatha !== filterKatha) return false;
    return true;
  });

  const phases = Array.from(new Set(availablePlots.map((p) => p.phase)));
  const blocks = Array.from(new Set(availablePlots.map((p) => p.block)));

  const handleSelectPlotChange = (id: string) => {
    const found = availablePlots.find((p) => p.id === id);
    if (found) setSelectedPlot(found);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlot) return;

    setSubmitting(true);
    try {
      const res = await bookPlot({
        plotId: selectedPlot.id,
        leadName,
        leadPhone,
        leadEmail,
        installmentMonths,
        downPaymentPercent,
        notes,
      });

      setResult(res);

      if (res.success) {
        // Track analytics
        fbqTrack("Lead", {
          content_name: `Plot Reservation - ${selectedPlot.plotNumber}`,
          value: totalPrice,
          currency: "BDT",
        });
        gtmPush("form_submit", {
          form_name: "plot_booking_reservation",
          plot_id: selectedPlot.id,
          project_name: selectedPlot.projectName,
          total_price: totalPrice,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold flex items-center gap-2 text-foreground">
            <LandPlot className="h-5 w-5 text-primary" />
            Direct Plot Selection & Reservation
          </DialogTitle>
        </DialogHeader>

        {result?.success ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Plot Hold Confirmed</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{result.message}</p>
            </div>

            {result.calculatedSummary && selectedPlot && (
              <div className="bg-muted/40 rounded-xl p-5 border border-border text-left space-y-2.5 max-w-md mx-auto text-sm">
                <div className="flex justify-between font-semibold pb-2 border-b border-border">
                  <span>Reserved Unit:</span>
                  <span className="text-primary">{selectedPlot.plotNumber} ({selectedPlot.projectName})</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Hierarchy:</span>
                  <span className="text-foreground">{selectedPlot.phase} • {selectedPlot.block} • {selectedPlot.road}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Plot Size:</span>
                  <span className="text-foreground">{selectedPlot.plotSizeKatha} Katha (Facing {selectedPlot.facing})</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Value:</span>
                  <span className="text-foreground font-semibold">৳ {(result.calculatedSummary.totalPrice / 100000).toFixed(2)} Lac</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Down Payment ({downPaymentPercent}%):</span>
                  <span className="text-foreground font-semibold">৳ {(result.calculatedSummary.downPaymentAmount / 100000).toFixed(2)} Lac</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Monthly Installment ({installmentMonths} mos):</span>
                  <span className="text-emerald-600 font-bold">৳ {result.calculatedSummary.monthlyInstallment.toLocaleString()}/mo</span>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={onClose} className="bg-primary text-primary-foreground w-full max-w-xs">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitBooking} className="space-y-6 pt-2">
            {/* 1. Plot Selector Box */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" /> Step 1: Select Plot Unit
                </span>
                <span className="text-xs text-muted-foreground">{filteredPlotOptions.length} available</span>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={filterPhase} 
                  onChange={(e) => setFilterPhase(e.target.value)}
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                >
                  <option value="all">All Phases</option>
                  {phases.map((ph) => <option key={ph} value={ph}>{ph}</option>)}
                </select>
                <select 
                  value={filterBlock} 
                  onChange={(e) => setFilterBlock(e.target.value)}
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                >
                  <option value="all">All Blocks</option>
                  {blocks.map((bk) => <option key={bk} value={bk}>{bk}</option>)}
                </select>
                <select 
                  value={filterKatha} 
                  onChange={(e) => setFilterKatha(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                >
                  <option value="all">All Katha</option>
                  <option value={3}>3 Katha</option>
                  <option value={4}>4 Katha</option>
                  <option value={5}>5 Katha</option>
                </select>
              </div>

              {/* Master Dropdown */}
              <div>
                <select 
                  value={selectedPlot?.id || ""} 
                  onChange={(e) => handleSelectPlotChange(e.target.value)}
                  className="w-full rounded-md border border-primary/50 bg-background px-3 py-2.5 text-sm font-medium outline-none focus:border-primary"
                  required
                >
                  {filteredPlotOptions.length === 0 ? (
                    <option value="">No available plots match your selection</option>
                  ) : (
                    filteredPlotOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.plotNumber} — {p.phase} • {p.block} • {p.road} ({p.plotSizeKatha} Katha, Facing {p.facing}) - ৳ {(p.totalPrice / 100000).toFixed(1)} Lac
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Active Plot Badge Specs */}
              {selectedPlot && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-border/60">
                  <div className="bg-muted/40 p-2 rounded-lg">
                    <span className="text-muted-foreground block">Dimensions:</span>
                    <span className="font-semibold text-foreground">{selectedPlot.plotSizeKatha} Katha</span>
                  </div>
                  <div className="bg-muted/40 p-2 rounded-lg">
                    <span className="text-muted-foreground block">Orientation:</span>
                    <span className="font-semibold text-foreground">Facing {selectedPlot.facing}</span>
                  </div>
                  <div className="bg-muted/40 p-2 rounded-lg">
                    <span className="text-muted-foreground block">Roadway:</span>
                    <span className="font-semibold text-foreground">{selectedPlot.roadWidth}</span>
                  </div>
                  <div className="bg-muted/40 p-2 rounded-lg">
                    <span className="text-muted-foreground block">Total Rate:</span>
                    <span className="font-bold text-primary">৳ {(selectedPlot.totalPrice / 100000).toFixed(1)} Lac</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Interactive Installment Schedule */}
            {selectedPlot && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-1.5"><Calculator className="h-4 w-4 text-primary" /> Step 2: Installment & Payment Plan</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Down Payment</Label>
                    <select 
                      value={downPaymentPercent} 
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                    >
                      <option value={10}>10% (৳ {(totalPrice * 0.1 / 100000).toFixed(1)} Lac)</option>
                      <option value={20}>20% (৳ {(totalPrice * 0.2 / 100000).toFixed(1)} Lac)</option>
                      <option value={30}>30% (৳ {(totalPrice * 0.3 / 100000).toFixed(1)} Lac)</option>
                      <option value={50}>50% (৳ {(totalPrice * 0.5 / 100000).toFixed(1)} Lac)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Installment Duration</Label>
                    <select 
                      value={installmentMonths} 
                      onChange={(e) => setInstallmentMonths(Number(e.target.value))}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                    >
                      <option value={24}>24 Months (2 Years)</option>
                      <option value={36}>36 Months (3 Years)</option>
                      <option value={48}>48 Months (4 Years)</option>
                      <option value={60}>60 Months (5 Years)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Estimated Monthly Installment:</span>
                    <span className="text-base font-bold text-primary">৳ {monthlyInstallment.toLocaleString()} / mo</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block">Down Payment Due:</span>
                    <span className="font-semibold text-foreground">৳ {(downPaymentAmount / 100000).toFixed(1)} Lac</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Applicant Details */}
            <div className="space-y-3">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Step 3: Applicant Contact & Verification
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Full Name *</Label>
                  <Input placeholder="Enter your full name" value={leadName} onChange={(e) => setLeadName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number *</Label>
                  <Input placeholder="017XXXXXXXX" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email Address (Optional)</Label>
                <Input type="email" placeholder="you@example.com" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !selectedPlot} className="bg-primary text-primary-foreground min-w-[140px]">
                {submitting ? "Reserving..." : "Reserve This Plot"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
