import { Search, RotateCcw, Filter } from "lucide-react";
import type { JobFilterOptions } from "@/admin/api/jobs";

interface JobFiltersProps {
  filters: JobFilterOptions;
  onChange: (filters: JobFilterOptions) => void;
  departments: string[];
  locations: string[];
  totalResults: number;
}

export function JobFilters({
  filters,
  onChange,
  departments,
  locations,
  totalResults,
}: JobFiltersProps) {
  const handleReset = () => {
    onChange({
      search: "",
      department: "all",
      location: "all",
      employmentType: "all",
      status: "all",
    });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.department && filters.department !== "all") ||
    (filters.location && filters.location !== "all") ||
    (filters.employmentType && filters.employmentType !== "all") ||
    (filters.status && filters.status !== "all");

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 md:p-6 shadow-sm mb-8 space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="job-search-input"
            type="text"
            placeholder="Search by job title, department, or keywords..."
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {totalResults} {totalResults === 1 ? "position" : "positions"} available
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-secondary text-amber-600 dark:text-amber-400 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40 text-xs">
        {/* Department */}
        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Department
          </label>
          <select
            id="job-filter-department"
            value={filters.department || "all"}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Location
          </label>
          <select
            id="job-filter-location"
            value={filters.location || "all"}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Employment Type
          </label>
          <select
            id="job-filter-employment-type"
            value={filters.employmentType || "all"}
            onChange={(e) => onChange({ ...filters, employmentType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contractual">Contractual</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Status
          </label>
          <select
            id="job-filter-status"
            value={filters.status || "all"}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Positions</option>
            <option value="closing_soon">Closing Soon</option>
          </select>
        </div>
      </div>
    </div>
  );
}
