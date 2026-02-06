import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
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
  simulateNewDelivery: () => void;
}

const DeliveryNotificationContext = createContext<DeliveryNotificationContextType | undefined>(undefined);

// Dados simulados para demonstração
const mockNewDeliveries: Omit<Delivery, "id">[] = [
  {
    pedidoId: 2001,
    cliente: "Roberto Almeida",
    endereco: "Rua das Acácias, 456",
    bairro: "Jardim Europa",
    produto: "Botijão P13",
    quantidade: 2,
    horarioPrevisto: "14:30",
    valorTotal: 240.0,
  },
  {
    pedidoId: 2002,
    cliente: "Fernanda Lima",
    endereco: "Av. Central, 789",
    bairro: "Centro",
    produto: "Botijão P45",
    quantidade: 1,
    horarioPrevisto: "15:00",
    valorTotal: 450.0,
  },
  {
    pedidoId: 2003,
    cliente: "Pedro Souza",
    endereco: "Rua dos Pinheiros, 123",
    bairro: "Vila Nova",
    produto: "Botijão P13",
    quantidade: 3,
    horarioPrevisto: "15:30",
    valorTotal: 360.0,
  },
];

export function DeliveryNotificationProvider({ children }: { children: ReactNode }) {
  const [pendingDeliveries, setPendingDeliveries] = useState<Delivery[]>([]);
  const [nextId, setNextId] = useState(100);
  const [mockIndex, setMockIndex] = useState(0);
  const { notifyNewDelivery, permission } = useNotifications();

  const addDelivery = useCallback(
    (delivery: Delivery) => {
      setPendingDeliveries((prev) => [...prev, delivery]);
      
      // Enviar notificação push
      if (permission === "granted") {
        notifyNewDelivery(delivery.cliente, delivery.endereco, delivery.pedidoId);
      }
    },
    [notifyNewDelivery, permission]
  );

  const removeDelivery = useCallback((id: number) => {
    setPendingDeliveries((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const simulateNewDelivery = useCallback(() => {
    const mockDelivery = mockNewDeliveries[mockIndex % mockNewDeliveries.length];
    const newDelivery: Delivery = {
      ...mockDelivery,
      id: nextId,
      pedidoId: mockDelivery.pedidoId + nextId,
    };

    addDelivery(newDelivery);
    setNextId((prev) => prev + 1);
    setMockIndex((prev) => prev + 1);
  }, [addDelivery, mockIndex, nextId]);

  // Simular entregas chegando periodicamente (para demonstração)
  useEffect(() => {
    // Apenas simula se as notificações estiverem ativadas
    if (permission !== "granted") return;

    const interval = setInterval(() => {
      // 20% de chance de receber uma nova entrega a cada 30 segundos
      if (Math.random() < 0.2) {
        simulateNewDelivery();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [permission, simulateNewDelivery]);

  return (
    <DeliveryNotificationContext.Provider
      value={{
        pendingDeliveries,
        addDelivery,
        removeDelivery,
        simulateNewDelivery,
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
