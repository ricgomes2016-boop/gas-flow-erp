import { useState } from "react";
import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Save,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function ClientePerfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "João da Silva",
    email: "joao@email.com",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    address: {
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567"
    }
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const menuItems = [
    { icon: Bell, label: "Notificações", path: "/cliente/notificacoes" },
    { icon: MapPin, label: "Endereços salvos", path: "/cliente/enderecos" },
    { icon: Shield, label: "Privacidade e segurança", path: "/cliente/privacidade" },
    { icon: HelpCircle, label: "Ajuda e suporte", path: "/cliente/ajuda" },
    { icon: FileText, label: "Termos de uso", path: "/cliente/termos" },
  ];

  return (
    <ClienteLayout>
      <div className="space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Cliente desde 2023
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados Pessoais
            </CardTitle>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Nome completo</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  />
                ) : (
                  <p className="text-sm mt-1">{profile.name}</p>
                )}
              </div>
              
              <div>
                <Label className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  E-mail
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  />
                ) : (
                  <p className="text-sm mt-1">{profile.email}</p>
                )}
              </div>
              
              <div>
                <Label className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefone
                </Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-sm mt-1">{profile.phone}</p>
                )}
              </div>
              
              <div>
                <Label>CPF</Label>
                <p className="text-sm mt-1 text-muted-foreground">{profile.cpf}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p>{profile.address.street}, {profile.address.number}</p>
              {profile.address.complement && <p>{profile.address.complement}</p>}
              <p>{profile.address.neighborhood}</p>
              <p>{profile.address.city} - {profile.address.state}</p>
              <p className="text-muted-foreground">CEP: {profile.address.zipCode}</p>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-2">
            {menuItems.map((item, index) => (
              <div key={item.path}>
                {index > 0 && <Separator />}
                <Link
                  to={item.path}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>

        {/* Version Info */}
        <p className="text-center text-xs text-muted-foreground">
          GásExpress v1.0.0
        </p>
      </div>
    </ClienteLayout>
  );
}
