
-- Allow contador to read documentos_contabeis
CREATE POLICY "Contador can view documents"
ON public.documentos_contabeis
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'contador'::app_role));

-- Allow contador to insert documents
CREATE POLICY "Contador can insert documents"
ON public.documentos_contabeis
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'contador'::app_role));

-- Allow contador to update document status
CREATE POLICY "Contador can update documents"
ON public.documentos_contabeis
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'contador'::app_role));

-- Allow contador to view chat messages directed to/from them
CREATE POLICY "Contador can view chat messages"
ON public.chat_mensagens
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'contador'::app_role)
  AND (remetente_tipo = 'contador' OR destinatario_tipo = 'contador')
);

-- Allow contador to send chat messages
CREATE POLICY "Contador can send chat messages"
ON public.chat_mensagens
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'contador'::app_role));

-- Allow staff to view contador chat messages
CREATE POLICY "Staff can view contador chat"
ON public.chat_mensagens
FOR SELECT
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'financeiro'::app_role))
  AND (remetente_tipo = 'contador' OR destinatario_tipo = 'contador')
);
