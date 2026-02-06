import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCliente } from "@/contexts/ClienteContext";
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Wallet,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

const paymentMethods = [
  { id: "pix", label: "PIX", icon: QrCode, description: "Pagamento instantâneo" },
  { id: "dinheiro", label: "Dinheiro", icon: Banknote, description: "Pague na entrega" },
  { id: "cartao", label: "Cartão", icon: CreditCard, description: "Débito ou Crédito" },
  { id: "vale-gas", label: "Vale Gás", icon: Wallet, description: "Use seu vale" },
];

export default function ClienteCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, cartTotal, addPurchase, useWalletBalance, clearCart } = useCliente();
  
  const { 
    couponDiscount = 0, 
    walletDiscount = 0, 
    useWallet = false,
    appliedCoupon,
    finalTotal = cartTotal
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [address, setAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    reference: ""
  });
  const [changeFor, setChangeFor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!address.street || !address.number || !address.neighborhood) {
      toast.error("Preencha o endereço completo");
      return;
    }

    setIsSubmitting(true);

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Use wallet balance if applicable
    if (useWallet && walletDiscount > 0) {
      useWalletBalance(walletDiscount);
    }

    // Add purchase to history
    addPurchase({
      date: new Date(),
      items: cart,
      total: finalTotal,
      paymentMethod: paymentMethods.find(p => p.id === paymentMethod)?.label || paymentMethod,
      status: "pending",
      discountApplied: couponDiscount + walletDiscount
    });

    toast.success("Pedido realizado com sucesso!");
    navigate("/cliente/historico");
  };

  return (
    <ClienteLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
        </div>

        {/* Delivery Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label>Rua</Label>
                <Input
                  placeholder="Nome da rua"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  placeholder="Nº"
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>Complemento</Label>
              <Input
                placeholder="Apto, bloco, etc."
                value={address.complement}
                onChange={(e) => setAddress({ ...address, complement: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Bairro</Label>
              <Input
                placeholder="Bairro"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Ponto de Referência</Label>
              <Textarea
                placeholder="Ex: Próximo ao mercado..."
                value={address.reference}
                onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Forma de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === method.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={method.id} />
                    <method.icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>

            {paymentMethod === "dinheiro" && (
              <div className="mt-4">
                <Label>Troco para quanto?</Label>
                <Input
                  type="number"
                  placeholder="Ex: 150.00"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Time */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Tempo estimado de entrega</p>
                <p className="text-sm text-muted-foreground">30 - 50 minutos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto cupom</span>
                <span>-R$ {couponDiscount.toFixed(2)}</span>
              </div>
            )}
            
            {walletDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Saldo carteira</span>
                <span>-R$ {walletDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Entrega</span>
              <span className="text-green-600">Grátis</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <Button 
          className="w-full h-12 text-lg gap-2"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Processando..."
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Confirmar Pedido
            </>
          )}
        </Button>
      </div>
    </ClienteLayout>
  );
}
