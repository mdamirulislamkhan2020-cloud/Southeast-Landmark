import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { logError } from "@/lib/error-handler";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  scope?: string;
  /** When true, renders a compact inline card instead of a full-screen panel. */
  compact?: boolean;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(this.props.scope ?? "ErrorBoundary", error, { componentStack: info.componentStack });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    const wrapCls = this.props.compact
      ? "rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center"
      : "min-h-[60vh] flex items-center justify-center p-6";

    return (
      <div className={wrapCls} role="alert">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground break-words">
              {error.message || "An unexpected error occurred while rendering this section."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" onClick={this.reset}>Try again</Button>
            <Button size="sm" onClick={() => { if (typeof window !== "undefined") window.location.reload(); }}>
              Reload page
            </Button>
          </div>
        </div>
      </div>
    );
  }
}