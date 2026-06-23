import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * App-wide error boundary. Catches render-time errors anywhere below it and
 * shows a calm recovery screen instead of a blank white page. Recovery clears
 * the error state and reloads the route the user was on.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for debugging / future error-reporting wiring.
    console.error("Uncaught render error:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          An unexpected error occurred. Reloading usually fixes it. If the problem persists,
          please get in touch.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
          <Button onClick={this.handleReload}>Reload</Button>
        </div>
      </div>
    );
  }
}
