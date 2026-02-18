
-- Create a safe read-only query executor function
CREATE OR REPLACE FUNCTION public.execute_readonly_query(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  normalized text;
BEGIN
  -- Normalize and validate
  normalized := upper(trim(query_text));
  
  -- Only allow SELECT statements
  IF NOT (normalized LIKE 'SELECT%') THEN
    RAISE EXCEPTION 'Apenas consultas SELECT são permitidas';
  END IF;
  
  -- Block dangerous keywords
  IF normalized ~ '(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXECUTE|COPY)' THEN
    RAISE EXCEPTION 'Operação não permitida';
  END IF;
  
  -- Execute and return as JSON
  EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || query_text || ') t'
  INTO result;
  
  RETURN result;
END;
$$;
