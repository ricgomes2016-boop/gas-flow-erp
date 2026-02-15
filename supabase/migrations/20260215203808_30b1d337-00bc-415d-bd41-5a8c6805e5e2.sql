
-- Step 2: Add columns and RLS policies for parceiro portal

-- Add user_id column to vale_gas_parceiros
ALTER TABLE public.vale_gas_parceiros ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add consumidor_cpf column to vale_gas
ALTER TABLE public.vale_gas ADD COLUMN IF NOT EXISTS consumidor_cpf text;

-- RLS: Parceiros can view own vales
CREATE POLICY "Parceiros can view own vales"
ON public.vale_gas
FOR SELECT
USING (
  has_role(auth.uid(), 'parceiro'::app_role)
  AND parceiro_id IN (
    SELECT id FROM public.vale_gas_parceiros WHERE user_id = auth.uid()
  )
);

-- RLS: Parceiros can update own available vales (to sell to consumers)
CREATE POLICY "Parceiros can update own available vales"
ON public.vale_gas
FOR UPDATE
USING (
  has_role(auth.uid(), 'parceiro'::app_role)
  AND parceiro_id IN (
    SELECT id FROM public.vale_gas_parceiros WHERE user_id = auth.uid()
  )
  AND status = 'disponivel'
);

-- RLS: Parceiros can view own parceiro record
CREATE POLICY "Parceiros can view own record"
ON public.vale_gas_parceiros
FOR SELECT
USING (
  has_role(auth.uid(), 'parceiro'::app_role)
  AND user_id = auth.uid()
);

-- RLS: Parceiros can view own lotes
CREATE POLICY "Parceiros can view own lotes"
ON public.vale_gas_lotes
FOR SELECT
USING (
  has_role(auth.uid(), 'parceiro'::app_role)
  AND parceiro_id IN (
    SELECT id FROM public.vale_gas_parceiros WHERE user_id = auth.uid()
  )
);
