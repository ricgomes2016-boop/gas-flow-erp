import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const getHomeLink = () => {
    const path = location.pathname;
    if (path.startsWith("/cliente")) return "/cliente";
    if (path.startsWith("/entregador")) return "/entregador";
    if (path.startsWith("/parceiro")) return "/parceiro";
    return "/";
  };

  const getHomeLabel = () => {
    const path = location.pathname;
    if (path.startsWith("/cliente")) return "Voltar ao Início";
    if (path.startsWith("/entregador")) return "Voltar ao Início";
    if (path.startsWith("/parceiro")) return "Voltar ao Início";
    return "Voltar ao Dashboard";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <a href={getHomeLink()} className="text-primary underline hover:text-primary/90">
          {getHomeLabel()}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
