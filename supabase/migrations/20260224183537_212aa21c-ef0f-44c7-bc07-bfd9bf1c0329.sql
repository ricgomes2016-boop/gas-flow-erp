
CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_empresa_id uuid;
  v_unidade_id uuid;
  v_registro_id text;
  v_has_unidade boolean;
BEGIN
  v_user_id := auth.uid();
  v_empresa_id := (SELECT empresa_id FROM public.profiles WHERE user_id = v_user_id LIMIT 1);
  
  -- Check if the table has a unidade_id column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = TG_TABLE_NAME 
      AND column_name = 'unidade_id'
  ) INTO v_has_unidade;

  IF TG_OP = 'DELETE' THEN
    v_registro_id := OLD.id::text;
    IF v_has_unidade THEN
      EXECUTE format('SELECT ($1).unidade_id') INTO v_unidade_id USING OLD;
    END IF;
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_antigos, user_id, empresa_id, unidade_id)
    VALUES (TG_TABLE_NAME, 'DELETE', v_registro_id, to_jsonb(OLD), v_user_id, v_empresa_id, v_unidade_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_registro_id := NEW.id::text;
    IF v_has_unidade THEN
      EXECUTE format('SELECT ($1).unidade_id') INTO v_unidade_id USING NEW;
    END IF;
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_antigos, dados_novos, user_id, empresa_id, unidade_id)
    VALUES (TG_TABLE_NAME, 'UPDATE', v_registro_id, to_jsonb(OLD), to_jsonb(NEW), v_user_id, v_empresa_id, v_unidade_id);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    v_registro_id := NEW.id::text;
    IF v_has_unidade THEN
      EXECUTE format('SELECT ($1).unidade_id') INTO v_unidade_id USING NEW;
    END IF;
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_novos, user_id, empresa_id, unidade_id)
    VALUES (TG_TABLE_NAME, 'INSERT', v_registro_id, to_jsonb(NEW), v_user_id, v_empresa_id, v_unidade_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;
