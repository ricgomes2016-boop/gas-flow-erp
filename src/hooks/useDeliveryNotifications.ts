import { useEffect, useRef, useCallback } from "react";

type NotificationPermission = "granted" | "denied" | "default";

interface UseDeliveryNotificationsOptions {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export function useDeliveryNotifications(options?: UseDeliveryNotificationsOptions) {
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      permissionRef.current = Notification.permission;
      options?.onPermissionChange?.(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("Este navegador não suporta notificações push");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.warn("Notificações foram bloqueadas pelo usuário");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      options?.onPermissionChange?.(permission);
      return permission === "granted";
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      return false;
    }
  }, [options]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!("Notification" in window)) {
      console.warn("Este navegador não suporta notificações push");
      return null;
    }

    if (Notification.permission !== "granted") {
      console.warn("Permissão de notificação não concedida");
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return null;
    }
  }, []);

  const notifyArriving = useCallback((deliveryPersonName: string, orderId: string) => {
    return sendNotification("🚚 Entrega Chegando!", {
      body: `${deliveryPersonName} está quase chegando com seu pedido #${orderId}`,
      tag: `delivery-arriving-${orderId}`,
      requireInteraction: true,
    });
  }, [sendNotification]);

  const notifyStatusChange = useCallback((status: string, orderId: string) => {
    const messages: Record<string, { title: string; body: string }> = {
      confirmed: {
        title: "✅ Pedido Confirmado!",
        body: `Seu pedido #${orderId} foi confirmado e está sendo preparado.`,
      },
      preparing: {
        title: "📦 Preparando seu Pedido",
        body: `Seu pedido #${orderId} está sendo preparado para entrega.`,
      },
      on_the_way: {
        title: "🚚 Saiu para Entrega!",
        body: `Seu pedido #${orderId} está a caminho do seu endereço.`,
      },
      arriving: {
        title: "🏠 Quase lá!",
        body: `Seu pedido #${orderId} está chegando! Prepare-se para receber.`,
      },
      delivered: {
        title: "🎉 Entrega Concluída!",
        body: `Seu pedido #${orderId} foi entregue. Obrigado pela preferência!`,
      },
    };

    const message = messages[status];
    if (message) {
      return sendNotification(message.title, {
        body: message.body,
        tag: `delivery-status-${orderId}`,
      });
    }
    return null;
  }, [sendNotification]);

  return {
    requestPermission,
    sendNotification,
    notifyArriving,
    notifyStatusChange,
    isSupported: "Notification" in window,
    permission: permissionRef.current,
  };
}
