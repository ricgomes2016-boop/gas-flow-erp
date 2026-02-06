import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Package,
  Truck,
  CheckCircle2,
  Bell
} from "lucide-react";
import { DeliveryMap } from "@/components/cliente/DeliveryMap";
import { NotificationPermissionBanner, NotificationStatus } from "@/components/cliente/NotificationPermissionBanner";
import { useDeliveryNotifications } from "@/hooks/useDeliveryNotifications";

interface DeliveryStatus {
  id: string;
  status: "confirmed" | "preparing" | "on_the_way" | "arriving" | "delivered";
  estimatedTime: string;
  deliveryPerson: {
    name: string;
    phone: string;
    photo: string;
  };
  currentPosition: {
    lat: number;
    lng: number;
  };
  destinationPosition: {
    lat: number;
    lng: number;
  };
  orderItems: string[];
}

const statusSteps = [
  { key: "confirmed", label: "Confirmado", icon: CheckCircle2 },
  { key: "preparing", label: "Preparando", icon: Package },
  { key: "on_the_way", label: "A caminho", icon: Truck },
  { key: "arriving", label: "Chegando", icon: MapPin },
];

const statusProgress: Record<string, number> = {
  confirmed: 25,
  preparing: 50,
  on_the_way: 75,
  arriving: 90,
  delivered: 100,
};

export default function ClienteRastreamento() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { notifyStatusChange, requestPermission } = useDeliveryNotifications();
  const previousStatusRef = useRef<string | null>(null);
  
  // Simulated delivery data
  const [delivery, setDelivery] = useState<DeliveryStatus>({
    id: orderId || "1",
    status: "on_the_way",
    estimatedTime: "15-25 min",
    deliveryPerson: {
      name: "Carlos Silva",
      phone: "(11) 99999-8888",
      photo: "🧑‍💼"
    },
    currentPosition: {
      lat: -23.5505,
      lng: -46.6333
    },
    destinationPosition: {
      lat: -23.5605,
      lng: -46.6433
    },
    orderItems: ["1x Gás P13", "2x Água Mineral 20L"]
  });

  // Simulate real-time position updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDelivery(prev => {
        const progress = (prev.destinationPosition.lat - prev.currentPosition.lat) * 0.1;
        const progressLng = (prev.destinationPosition.lng - prev.currentPosition.lng) * 0.1;
        
        return {
          ...prev,
          currentPosition: {
            lat: prev.currentPosition.lat + progress,
            lng: prev.currentPosition.lng + progressLng
          }
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Send notification when status changes
  useEffect(() => {
    if (previousStatusRef.current !== null && previousStatusRef.current !== delivery.status) {
      notifyStatusChange(delivery.status, delivery.id);
    }
    previousStatusRef.current = delivery.status;
  }, [delivery.status, delivery.id, notifyStatusChange]);

  // Simulate status changes
  useEffect(() => {
    const statusSequence: DeliveryStatus["status"][] = ["confirmed", "preparing", "on_the_way", "arriving"];
    let currentIndex = statusSequence.indexOf(delivery.status);
    
    const interval = setInterval(() => {
      if (currentIndex < statusSequence.length - 1) {
        currentIndex++;
        setDelivery(prev => ({
          ...prev,
          status: statusSequence[currentIndex]
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const currentStepIndex = statusSteps.findIndex(step => step.key === delivery.status);

  return (
    <ClienteLayout>
      <div className="space-y-4">
        {/* Notification Banner */}
        <NotificationPermissionBanner />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Rastrear Pedido</h1>
              <p className="text-sm text-muted-foreground">Pedido #{delivery.id}</p>
            </div>
          </div>
          <NotificationStatus />
        </div>

        {/* Map */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[300px]">
              <DeliveryMap 
                deliveryPosition={delivery.currentPosition}
                destinationPosition={delivery.destinationPosition}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estimated Time */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6" />
                <div>
                  <p className="text-sm opacity-90">Tempo estimado</p>
                  <p className="text-2xl font-bold">{delivery.estimatedTime}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-primary">
                {delivery.status === "arriving" ? "Quase lá!" : "Em andamento"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-4">
            <Progress value={statusProgress[delivery.status]} className="mb-4" />
            <div className="flex justify-between">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1">
                    <div className={`
                      p-2 rounded-full transition-colors
                      ${isCurrent ? "bg-primary text-primary-foreground" : ""}
                      ${isActive && !isCurrent ? "bg-primary/20 text-primary" : ""}
                      ${!isActive ? "bg-muted text-muted-foreground" : ""}
                    `}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs text-center ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Person */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Seu Entregador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {delivery.deliveryPerson.photo}
                </div>
                <div>
                  <p className="font-medium">{delivery.deliveryPerson.name}</p>
                  <p className="text-sm text-muted-foreground">Entregador</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {delivery.orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardContent className="p-4">
            <Button variant="outline" className="w-full">
              Precisa de ajuda com seu pedido?
            </Button>
          </CardContent>
        </Card>
      </div>
    </ClienteLayout>
  );
}
