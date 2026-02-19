import { useState, useEffect } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ClientePerfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // Get profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        // Try to find matching cliente
        const { data: clienteData } = await supabase
          .from("clientes")
          .select("*")
          .eq("email", user.email || "")
          .maybeSingle();

        const name = profileData?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "";
        const phone = profileData?.phone || clienteData?.telefone || "";
        const cpf = clienteData?.cpf || "";

        const newProfile = {
          name,
          email: user.email || "",
          phone,
          cpf,
          address: {
            street: clienteData?.endereco || "",
            number: clienteData?.numero || "",
            complement: "",
            neighborhood: clienteData?.bairro || "",
            city: clienteData?.cidade || "",
            state: "",
            zipCode: clienteData?.cep || ""
          }
        };

        setProfile(newProfile);
        setEditedProfile(newProfile);
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      // Update profiles table
      if (user) {
        await supabase
          .from("profiles")
          .update({ 
            full_name: editedProfile.name,
            phone: editedProfile.phone 
          })
          .eq("user_id", user.id);
      }

      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar perfil");
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const initials = profile.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl = user?.user_metadata?.avatar_url || "";

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
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{profile.name || "Carregando..."}</h1>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Cliente Gás Fácil
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
                  <p className="text-sm mt-1">{profile.name || "—"}</p>
                )}
              </div>
              
              <div>
                <Label className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  E-mail
                </Label>
                <p className="text-sm mt-1 text-muted-foreground">{profile.email}</p>
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
                  <p className="text-sm mt-1">{profile.phone || "Não informado"}</p>
                )}
              </div>
              
              {profile.cpf && (
                <div>
                  <Label>CPF</Label>
                  <p className="text-sm mt-1 text-muted-foreground">{profile.cpf}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        {profile.address.street && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p>{profile.address.street}{profile.address.number ? `, ${profile.address.number}` : ""}</p>
                {profile.address.complement && <p>{profile.address.complement}</p>}
                {profile.address.neighborhood && <p>{profile.address.neighborhood}</p>}
                {profile.address.city && <p>{profile.address.city}{profile.address.state ? ` - ${profile.address.state}` : ""}</p>}
                {profile.address.zipCode && <p className="text-muted-foreground">CEP: {profile.address.zipCode}</p>}
              </div>
            </CardContent>
          </Card>
        )}

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
        <Button 
          variant="outline" 
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>

        {/* Version Info */}
        <p className="text-center text-xs text-muted-foreground">
          Gás Fácil v1.0.0
        </p>
      </div>
    </ClienteLayout>
  );
}
