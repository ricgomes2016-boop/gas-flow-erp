import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  clienteId: string;
}

export function ClienteTagsBadges({ clienteId }: Props) {
  const [tags, setTags] = useState<{ id: string; nome: string; cor: string }[]>([]);

  useEffect(() => {
    supabase
      .from("cliente_tag_associacoes")
      .select("tag_id, cliente_tags(id, nome, cor)")
      .eq("cliente_id", clienteId)
      .then(({ data }) => {
        const mapped = (data || []).map((t: any) => t.cliente_tags).filter(Boolean);
        setTags(mapped);
      });
  }, [clienteId]);

  if (tags.length === 0) return null;

  return (
    <div className="flex gap-0.5 flex-wrap">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          className="text-[9px] px-1.5 py-0"
          style={{ backgroundColor: tag.cor, borderColor: tag.cor }}
        >
          {tag.nome}
        </Badge>
      ))}
    </div>
  );
}
