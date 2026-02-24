
-- =============================================================
-- FASE 4: Tabela de auditoria automática
-- =============================================================

CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tabela text NOT NULL,
  operacao text NOT NULL, -- INSERT, UPDATE, DELETE
  registro_id text,
  dados_antigos jsonb,
  dados_novos jsonb,
  user_id uuid,
  empresa_id uuid,
  unidade_id uuid,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Particionar por mês seria ideal mas mantemos simples
CREATE INDEX idx_audit_log_tabela ON public.audit_log(tabela);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at);
CREATE INDEX idx_audit_log_empresa ON public.audit_log(empresa_id);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestor can view audit logs"
ON public.audit_log FOR SELECT TO authenticated
USING (empresa_id = public.get_user_empresa_id());

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_empresa_id uuid;
  v_unidade_id uuid;
  v_registro_id text;
BEGIN
  v_user_id := auth.uid();
  v_empresa_id := (SELECT empresa_id FROM public.profiles WHERE user_id = v_user_id LIMIT 1);
  
  IF TG_OP = 'DELETE' THEN
    v_registro_id := OLD.id::text;
    v_unidade_id := CASE WHEN TG_TABLE_NAME IN ('pedidos','produtos','funcionarios','entregadores','contas_pagar','contas_receber','caixa_sessoes') 
                         THEN OLD.unidade_id ELSE NULL END;
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_antigos, user_id, empresa_id, unidade_id)
    VALUES (TG_TABLE_NAME, 'DELETE', v_registro_id, to_jsonb(OLD), v_user_id, v_empresa_id, v_unidade_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_registro_id := NEW.id::text;
    v_unidade_id := CASE WHEN TG_TABLE_NAME IN ('pedidos','produtos','funcionarios','entregadores','contas_pagar','contas_receber','caixa_sessoes') 
                         THEN NEW.unidade_id ELSE NULL END;
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_antigos, dados_novos, user_id, empresa_id, unidade_id)
    VALUES (TG_TABLE_NAME, 'UPDATE', v_registro_id, to_jsonb(OLD), to_jsonb(NEW), v_user_id, v_empresa_id, v_unidade_id);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    v_registro_id := NEW.id::text;
    v_unidade_id := CASE WHEN TG_TABLE_NAME IN ('pedidos','produtos','funcionarios','entregadores','contas_pagar','contas_receber','caixa_sessoes') 
                         THEN NEW.unidade_id ELSE NULL END;
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_novos, user_id, empresa_id, unidade_id)
    VALUES (TG_TABLE_NAME, 'INSERT', v_registro_id, to_jsonb(NEW), v_user_id, v_empresa_id, v_unidade_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Adicionar triggers nas tabelas críticas
CREATE TRIGGER audit_pedidos AFTER INSERT OR UPDATE OR DELETE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_caixa_sessoes AFTER INSERT OR UPDATE OR DELETE ON public.caixa_sessoes FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_contas_pagar AFTER INSERT OR UPDATE OR DELETE ON public.contas_pagar FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_contas_receber AFTER INSERT OR UPDATE OR DELETE ON public.contas_receber FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_produtos AFTER INSERT OR UPDATE OR DELETE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_funcionarios AFTER INSERT OR UPDATE OR DELETE ON public.funcionarios FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_entregadores AFTER INSERT OR UPDATE OR DELETE ON public.entregadores FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_clientes AFTER INSERT OR UPDATE OR DELETE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
