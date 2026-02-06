import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Search, UserPlus, User, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone, formatCEP } from "@/hooks/useInputMasks";

interface Cliente {
  id: string;
  nome: string;
  telefone: string | null;
  endereco: string | null;
  bairro: string | null;
  cep: string | null;
  cidade: string | null;
}

interface CustomerData {
  id: string | null;
  nome: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  observacao: string;
}

interface CustomerSearchProps {
  value: CustomerData;
  onChange: (data: CustomerData) => void;
}

export function CustomerSearch({ value, onChange }: CustomerSearchProps) {
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchClientes = async (term: string, field: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setActiveField(field);

    // Limpa caracteres especiais para busca por telefone
    const cleanTerm = field === "telefone" ? term.replace(/\D/g, "") : term;

    if (field === "telefone" && cleanTerm.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      let query = supabase
        .from("clientes")
        .select("id, nome, telefone, endereco, bairro, cep, cidade")
        .eq("ativo", true)
        .limit(8);

      if (field === "telefone") {
        // Busca por telefone (apenas números)
        query = query.ilike("telefone", `%${cleanTerm}%`);
      } else if (field === "nome") {
        // Busca por nome
        query = query.ilike("nome", `%${term}%`);
      } else if (field === "endereco") {
        // Busca inteligente por endereço: divide os termos e busca cada parte
        // Exemplo: "amaz 23" busca por "amaz" E "23" em endereco, bairro ou cidade
        const terms = term.trim().split(/\s+/).filter(t => t.length >= 2);
        
        if (terms.length === 0) {
          setSearchResults([]);
          setShowResults(false);
          return;
        }

        // Busca todos os clientes e filtra no frontend para maior flexibilidade
        const { data, error } = await supabase
          .from("clientes")
          .select("id, nome, telefone, endereco, bairro, cep, cidade")
          .eq("ativo", true)
          .limit(50);

        if (!error && data) {
          const filtered = data.filter(cliente => {
            const fullAddress = [
              cliente.endereco || "",
              cliente.bairro || "",
              cliente.cidade || ""
            ].join(" ").toLowerCase();

            // Todos os termos devem estar presentes no endereço
            return terms.every(t => fullAddress.includes(t.toLowerCase()));
          }).slice(0, 8);

          setSearchResults(filtered);
          setShowResults(filtered.length > 0);
        }
        return;
      }

      const { data, error } = await query;

      if (!error && data) {
        setSearchResults(data);
        setShowResults(data.length > 0);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const selectCliente = (cliente: Cliente) => {
    onChange({
      ...value,
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone || "",
      endereco: cliente.endereco || "",
      bairro: cliente.bairro || "",
      cep: cliente.cep || "",
    });
    setShowResults(false);
    setSearchResults([]);
  };

  const handleFieldChange = (field: keyof CustomerData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue, id: field === "nome" || field === "telefone" ? null : value.id });
  };

  // CEP lookup - busca automática quando digita 8 dígitos
  const buscarCEP = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        onChange({
          ...value,
          endereco: data.logradouro || value.endereco,
          bairro: data.bairro || value.bairro,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  // Handler para CEP que dispara busca ao completar
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    handleFieldChange("cep", formatted);
    
    // Busca automaticamente quando tiver 8 dígitos
    if (formatted.replace(/\D/g, "").length === 8) {
      buscarCEP(formatted);
    }
  };

  return (
    <Card ref={searchRef}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5" />
          Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Row */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Label className="text-xs text-muted-foreground">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="(00) 00000-0000"
                value={value.telefone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  handleFieldChange("telefone", formatted);
                  searchClientes(formatted, "telefone");
                }}
                className="pl-10"
                maxLength={16}
              />
            </div>
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Nome do Cliente</Label>
            <Input
              placeholder="Nome do cliente"
              value={value.nome}
              onChange={(e) => {
                handleFieldChange("nome", e.target.value);
                searchClientes(e.target.value, "nome");
              }}
            />
          </div>
          <Button variant="outline" className="mt-5" size="icon">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Autocomplete Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full max-w-md bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            {searchResults.map((cliente) => (
              <button
                key={cliente.id}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
                onClick={() => selectCliente(cliente)}
              >
                <p className="font-medium text-sm">{cliente.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {cliente.telefone} • {cliente.endereco}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Address Row */}
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-3 relative">
            <Label className="text-xs text-muted-foreground">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rua, Avenida..."
                value={value.endereco}
                onChange={(e) => {
                  handleFieldChange("endereco", e.target.value);
                  searchClientes(e.target.value, "endereco");
                }}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Número</Label>
            <Input
              placeholder="Nº"
              value={value.numero}
              onChange={(e) => handleFieldChange("numero", e.target.value)}
            />
          </div>
        </div>

        {/* Complement & Neighborhood */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">Complemento</Label>
            <Input
              placeholder="Apto, Bloco..."
              value={value.complemento}
              onChange={(e) => handleFieldChange("complemento", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bairro</Label>
            <Input
              placeholder="Bairro"
              value={value.bairro}
              onChange={(e) => handleFieldChange("bairro", e.target.value)}
            />
          </div>
        </div>

        {/* CEP */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">CEP</Label>
            <Input
              placeholder="00000-000"
              value={value.cep}
              onChange={handleCEPChange}
              maxLength={9}
            />
          </div>
        </div>

        {/* Observation */}
        <div>
          <Label className="text-xs text-muted-foreground">Observação do Pedido</Label>
          <Textarea
            placeholder="Observações sobre a entrega..."
            value={value.observacao}
            onChange={(e) => handleFieldChange("observacao", e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
