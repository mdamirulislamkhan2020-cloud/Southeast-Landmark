import { useState, useEffect } from "react";
import { 
  LandPlot, Plus, Search, Filter, Layers, CheckCircle2, 
  Clock, AlertCircle, Trash2, Edit, Eye, ShieldCheck, ArrowUpDown 
} from "lucide-react";
import { listPlots, updatePlot, createPlot, deletePlot, getPlotHierarchy, type Plot, type PlotStatus } from "@/admin/api/plots-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlotsManagerPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [selectedBlock, setSelectedBlock] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Hierarchy data
  const [phases, setPhases] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, available: 0, reserved: 0, sold: 0 });

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [formData, setFormData] = useState({
    projectName: "Landmark City — Phase 1",
    projectId: "proj-landmark-city-1",
    phase: "Phase 1",
    block: "Block A",
    road: "Road 01 (40 ft)",
    roadWidth: "40 ft" as any,
    plotNumber: "Plot #01",
    plotSizeKatha: 3,
    facing: "South" as any,
    category: "Residential" as any,
    pricePerKatha: 1800000,
    status: "available" as PlotStatus,
    isCorner: false,
    isAvenue: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const allPlots = await listPlots({
        search,
        phase: selectedPhase,
        block: selectedBlock,
        status: selectedStatus as any,
      });
      setPlots(allPlots);

      const hierarchy = await getPlotHierarchy();
      const allPhases = hierarchy.phases.map((p) => p.phase);
      const allBlocks = Array.from(new Set(hierarchy.blocks.map((b) => b.block)));
      setPhases(allPhases);
      setBlocks(allBlocks);

      // Calculate stats
      const total = allPlots.length;
      const available = allPlots.filter((p) => p.status === "available").length;
      const reserved = allPlots.filter((p) => p.status === "reserved" || p.status === "booked").length;
      const sold = allPlots.filter((p) => p.status === "sold").length;
      setStats({ total, available, reserved, sold });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedPhase, selectedBlock, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingPlot(null);
    setFormData({
      projectName: "Landmark City — Phase 1",
      projectId: "proj-landmark-city-1",
      phase: "Phase 1",
      block: "Block A",
      road: "Road 01 (40 ft)",
      roadWidth: "40 ft",
      plotNumber: `Plot #${plots.length + 1}`,
      plotSizeKatha: 3,
      facing: "South",
      category: "Residential",
      pricePerKatha: 1800000,
      status: "available",
      isCorner: false,
      isAvenue: false,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plot: Plot) => {
    setEditingPlot(plot);
    setFormData({
      projectName: plot.projectName,
      projectId: plot.projectId,
      phase: plot.phase,
      block: plot.block,
      road: plot.road,
      roadWidth: plot.roadWidth,
      plotNumber: plot.plotNumber,
      plotSizeKatha: plot.plotSizeKatha,
      facing: plot.facing,
      category: plot.category,
      pricePerKatha: plot.pricePerKatha,
      status: plot.status,
      isCorner: plot.isCorner,
      isAvenue: plot.isAvenue,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlot) {
      await updatePlot(editingPlot.id, formData);
    } else {
      await createPlot(formData as any);
    }
    setIsDialogOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this plot record?")) {
      await deletePlot(id);
      loadData();
    }
  };

  const handleStatusQuickChange = async (id: string, newStatus: PlotStatus) => {
    await updatePlot(id, { status: newStatus });
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Plot Inventory & Management</h1>
          <p className="text-sm text-muted-foreground">Manage township phases, blocks, road layout, and individual plot reservation states.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Plot
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Plots</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold mt-2">{stats.total}</div>
          <div className="text-xs text-muted-foreground mt-1">Across all phases</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Available</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500 mt-2">{stats.available}</div>
          <div className="text-xs text-muted-foreground mt-1">Ready for booking</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Reserved / Booked</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500 mt-2">{stats.reserved}</div>
          <div className="text-xs text-muted-foreground mt-1">Under applicant review</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sold Out</span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary mt-2">{stats.sold}</div>
          <div className="text-xs text-muted-foreground mt-1">Deeds executed</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search plot #, road, project..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <select 
          value={selectedPhase} 
          onChange={(e) => setSelectedPhase(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All Phases</option>
          {phases.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select 
          value={selectedBlock} 
          onChange={(e) => setSelectedBlock(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All Blocks</option>
          {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="booked">Booked</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Plots Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Plot ID & Number</th>
                <th className="py-3.5 px-4 font-semibold">Project & Hierarchy</th>
                <th className="py-3.5 px-4 font-semibold">Size & Facing</th>
                <th className="py-3.5 px-4 font-semibold">Road & Category</th>
                <th className="py-3.5 px-4 font-semibold">Pricing (BDT)</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">Loading plot inventory...</td>
                </tr>
              ) : plots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">No plots found matching selected filters.</td>
                </tr>
              ) : (
                plots.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium">
                      <div className="font-semibold text-foreground">{p.plotNumber}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-foreground">{p.projectName}</div>
                      <div className="text-xs text-muted-foreground">{p.phase} • {p.block}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{p.plotSizeKatha} Katha</div>
                      <div className="text-xs text-muted-foreground">Facing {p.facing}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-foreground">{p.road}</div>
                      <div className="text-xs text-primary font-medium">{p.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">৳ {(p.totalPrice / 100000).toFixed(1)} Lac</div>
                      <div className="text-xs text-muted-foreground">৳ {(p.pricePerKatha / 100000).toFixed(1)} Lac/katha</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select 
                        value={p.status} 
                        onChange={(e) => handleStatusQuickChange(p.id, e.target.value as PlotStatus)}
                        className={`text-xs rounded-full px-2.5 py-1 font-semibold border outline-none ${
                          p.status === "available" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                          p.status === "reserved" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                          p.status === "booked" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" :
                          "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="booked">Booked</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(p)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plot Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlot ? "Edit Plot Specifications" : "Register New Plot"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Project Name</Label>
                <Input value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Plot Number (e.g. Plot #12)</Label>
                <Input value={formData.plotNumber} onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Phase</Label>
                <Input value={formData.phase} onChange={(e) => setFormData({ ...formData, phase: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Block</Label>
                <Input value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Road & Width</Label>
                <Input value={formData.road} onChange={(e) => setFormData({ ...formData, road: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Plot Size (Katha)</Label>
                <Input type="number" min={1} max={50} value={formData.plotSizeKatha} onChange={(e) => setFormData({ ...formData, plotSizeKatha: Number(e.target.value) })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Price per Katha (BDT)</Label>
                <Input type="number" step={50000} value={formData.pricePerKatha} onChange={(e) => setFormData({ ...formData, pricePerKatha: Number(e.target.value) })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Facing Direction</Label>
                <select 
                  value={formData.facing} 
                  onChange={(e) => setFormData({ ...formData, facing: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="South">South</option>
                  <option value="North">North</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="South-East">South-East</option>
                  <option value="North-East">North-East</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="Residential">Residential</option>
                  <option value="Corner Plot">Corner Plot</option>
                  <option value="Avenue Plot">Avenue Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Initial Status</Label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="booked">Booked</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.isCorner} onChange={(e) => setFormData({ ...formData, isCorner: e.target.checked })} className="rounded" /> Corner Plot
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.isAvenue} onChange={(e) => setFormData({ ...formData, isAvenue: e.target.checked })} className="rounded" /> Main Avenue
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground">{editingPlot ? "Update Plot" : "Create Plot"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
