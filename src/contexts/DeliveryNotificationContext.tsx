import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useNotifications } from "@/hooks/useNotifications";

interface Delivery {
  id: number;
  pedidoId: number;
  cliente: string;
  endereco: string;
  bairro: string;
  produto: string;
  quantidade: number;
  horarioPrevisto: string;
  valorTotal: number;
}

interface DeliveryNotificationContextType {
  pendingDeliveries: Delivery[];
  addDelivery: (delivery: Delivery) => void;
  removeDelivery: (id: number) => void;
}

const DeliveryNotificationContext = createContext<DeliveryNotificationContextType | undefined>(undefined);

export function DeliveryNotificationProvider({ children }: { children: ReactNode }) {
  const [pendingDeliveries, setPendingDeliveries] = useState<Delivery[]>([]);
  const { notifyNewDelivery, permission } = useNotifications();

  const addDelivery = useCallback(
    (delivery: Delivery) => {
      setPendingDeliveries((prev) => [...prev, delivery]);
      
      if (permission === "granted") {
        notifyNewDelivery(delivery.cliente, delivery.endereco, delivery.pedidoId);
      }
    },
    [notifyNewDelivery, permission]
  );

  const removeDelivery = useCallback((id: number) => {
    setPendingDeliveries((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <DeliveryNotificationContext.Provider
      value={{
        pendingDeliveries,
        addDelivery,
        removeDelivery,
      }}
    >
      {children}
    </DeliveryNotificationContext.Provider>
  );
}

export function useDeliveryNotifications() {
  const context = useContext(DeliveryNotificationContext);
  if (!context) {
    throw new Error("useDeliveryNotifications must be used within DeliveryNotificationProvider");
  }
  return context;
}
