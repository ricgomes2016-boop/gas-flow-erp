import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackPath?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  getHomeByPath = () => {
    const path = window.location.pathname;
    if (path.startsWith("/cliente")) return "/cliente";
    if (path.startsWith("/entregador")) return "/entregador";
    if (path.startsWith("/parceiro")) return "/parceiro";
    return "/";
  };

  handleGoBack = () => {
    this.setState({ hasError: false, error: null });
    window.history.back();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = this.getHomeByPath();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Tente novamente.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={this.handleGoBack}>
                Voltar
              </Button>
              <Button variant="outline" onClick={this.handleGoHome}>
                Início
              </Button>
              <Button onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
