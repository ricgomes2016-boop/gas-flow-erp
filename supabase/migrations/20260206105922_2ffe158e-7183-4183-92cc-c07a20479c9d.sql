-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gestor', 'financeiro', 'operacional', 'entregador', 'cliente');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create clients table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  cep TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tipo TEXT DEFAULT 'residencial',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entregadores table
CREATE TABLE public.entregadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  email TEXT,
  cnh TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'disponivel',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create veiculos table
CREATE TABLE public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT UNIQUE NOT NULL,
  modelo TEXT NOT NULL,
  marca TEXT,
  ano INTEGER,
  tipo TEXT DEFAULT 'moto',
  km_atual DOUBLE PRECISION DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create produtos table
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  estoque INTEGER DEFAULT 0,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pedidos table
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  entregador_id UUID REFERENCES public.entregadores(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pendente',
  valor_total DECIMAL(10,2) DEFAULT 0,
  forma_pagamento TEXT,
  endereco_entrega TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  observacoes TEXT,
  canal_venda TEXT DEFAULT 'balcao',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pedido_itens table
CREATE TABLE public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rotas table for driver routes
CREATE TABLE public.rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entregador_id UUID REFERENCES public.entregadores(id) ON DELETE CASCADE NOT NULL,
  veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE SET NULL,
  km_inicial DOUBLE PRECISION NOT NULL,
  km_final DOUBLE PRECISION,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'em_andamento',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rota_historico table for tracking driver positions
CREATE TABLE public.rota_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rota_id UUID REFERENCES public.rotas(id) ON DELETE CASCADE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rota_historico ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_entregadores_updated_at BEFORE UPDATE ON public.entregadores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON public.veiculos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Gestores can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'gestor'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clientes
CREATE POLICY "Authenticated users can view clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage clientes" ON public.clientes FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional')
);

-- RLS Policies for entregadores
CREATE POLICY "Authenticated users can view entregadores" ON public.entregadores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Entregadores can update their own record" ON public.entregadores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Staff can manage entregadores" ON public.entregadores FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor')
);

-- RLS Policies for veiculos
CREATE POLICY "Authenticated users can view veiculos" ON public.veiculos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage veiculos" ON public.veiculos FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor')
);

-- RLS Policies for produtos
CREATE POLICY "Anyone can view produtos" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "Staff can manage produtos" ON public.produtos FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional')
);

-- RLS Policies for pedidos
CREATE POLICY "Authenticated users can view pedidos" ON public.pedidos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert pedidos" ON public.pedidos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can manage pedidos" ON public.pedidos FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional') OR
  public.has_role(auth.uid(), 'entregador')
);

-- RLS Policies for pedido_itens
CREATE POLICY "Authenticated users can view pedido_itens" ON public.pedido_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert pedido_itens" ON public.pedido_itens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can manage pedido_itens" ON public.pedido_itens FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional')
);

-- RLS Policies for rotas
CREATE POLICY "Authenticated users can view rotas" ON public.rotas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Entregadores can manage their own rotas" ON public.rotas FOR ALL USING (
  entregador_id IN (SELECT id FROM public.entregadores WHERE user_id = auth.uid())
);
CREATE POLICY "Staff can manage all rotas" ON public.rotas FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor')
);

-- RLS Policies for rota_historico
CREATE POLICY "Authenticated users can view rota_historico" ON public.rota_historico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own route history" ON public.rota_historico FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  
  -- Default role is 'operacional' for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'operacional');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();