-- 155: Tablas faltantes del sistema de Leads / Funnels
-- Crea: asesores, campanas, formularios, calendarios, reservas, integraciones
-- Completa columnas de leads y repunta leads.asesor_id -> asesores.
-- Idempotente (IF NOT EXISTS / DROP POLICY IF EXISTS).

-- 1. ASESORES
create table if not exists public.asesores (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nombre text not null,
  email text,
  telefono text,
  whatsapp text,
  foto_url text,
  activo boolean default true,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);
create index if not exists idx_asesores_empresa on public.asesores(empresa_id);
create index if not exists idx_asesores_activo on public.asesores(activo);

-- 2. CAMPANAS
create table if not exists public.campanas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  asesor_id uuid references public.asesores(id) on delete set null,
  nombre text not null,
  descripcion text,
  estado text default 'activa',
  tipo_captura text default 'solo_formulario',
  formulario_id uuid,
  calendario_id uuid,
  producto_id uuid,
  notificar_email boolean default true,
  notificar_whatsapp boolean default false,
  emails_notificacion text[] default '{}',
  whatsapp_notificacion text[] default '{}',
  notion_database_id text,
  notion_sync boolean default false,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);
create index if not exists idx_campanas_empresa on public.campanas(empresa_id);
create index if not exists idx_campanas_asesor on public.campanas(asesor_id);
create index if not exists idx_campanas_estado on public.campanas(estado);

-- 3. FORMULARIOS
create table if not exists public.formularios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  campana_id uuid references public.campanas(id) on delete set null,
  nombre text not null,
  slug text not null unique,
  estado text default 'borrador',
  campos jsonb default '[]'::jsonb,
  apariencia jsonb default '{}'::jsonb,
  pasos_flujo jsonb default '[]'::jsonb,
  texto_boton text default 'Enviar',
  destino_lead_tipo text default 'lead',
  vistas integer default 0,
  respuestas integer default 0,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);
create index if not exists idx_formularios_empresa on public.formularios(empresa_id);
create index if not exists idx_formularios_slug on public.formularios(slug);

-- 4. CALENDARIOS
create table if not exists public.calendarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  campana_id uuid references public.campanas(id) on delete set null,
  nombre text not null,
  slug text not null unique,
  tipo text default 'personal',
  descripcion text,
  ubicacion_tipo text default 'videoconferencia',
  ubicacion_detalle text,
  logo text,
  color_principal text default '#d5c108',
  texto_boton text default 'Programar',
  audiencia_tipo text default 'publico',
  audiencia_ids text[] default '{}',
  tipo_horario text default 'semanal',
  horarios jsonb default '{}'::jsonb,
  fechas_especificas jsonb default '[]'::jsonb,
  configuracion jsonb default '{}'::jsonb,
  duracion integer default 30,
  intervalo integer default 30,
  aviso_minimo integer default 4,
  buffer_antes integer default 0,
  buffer_despues integer default 0,
  formulario jsonb default '[]'::jsonb,
  permitir_invitados boolean default false,
  requerir_consentimiento boolean default true,
  usuarios_asignados text[] default '{}',
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);
create index if not exists idx_calendarios_empresa on public.calendarios(empresa_id);
create index if not exists idx_calendarios_slug on public.calendarios(slug);

-- 5. RESERVAS
create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  calendario_id uuid references public.calendarios(id) on delete cascade,
  fecha date not null,
  hora_inicio text not null,
  hora_fin text,
  estado text default 'pendiente',
  nombre text,
  email text,
  telefono text,
  datos jsonb default '{}'::jsonb,
  creado_en timestamptz default now()
);
create index if not exists idx_reservas_calendario on public.reservas(calendario_id);
create index if not exists idx_reservas_fecha on public.reservas(fecha);
create index if not exists idx_reservas_lead on public.reservas(lead_id);

-- 6. INTEGRACIONES
create table if not exists public.integraciones (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  tipo text not null,
  nombre text not null,
  config jsonb default '{}'::jsonb,
  activa boolean default true,
  ultima_sincronizacion timestamptz,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);
create index if not exists idx_integraciones_empresa on public.integraciones(empresa_id);
create index if not exists idx_integraciones_tipo on public.integraciones(tipo);

-- 7. LEADS: columnas faltantes
alter table public.leads add column if not exists campana_id uuid references public.campanas(id) on delete set null;
alter table public.leads add column if not exists template_id uuid;
alter table public.leads add column if not exists whatsapp text;
alter table public.leads add column if not exists datos jsonb default '{}'::jsonb;
alter table public.leads add column if not exists presupuesto text;
alter table public.leads add column if not exists interes text;
alter table public.leads add column if not exists etiquetas text[] default '{}';
alter table public.leads add column if not exists contactado_en timestamptz;
alter table public.leads add column if not exists convertido_en timestamptz;
alter table public.leads add column if not exists origen text;

-- Repuntar FK de leads.asesor_id hacia asesores (leads estaba vacío)
alter table public.leads drop constraint if exists leads_asesor_id_fkey;
alter table public.leads add constraint leads_asesor_id_fkey
  foreign key (asesor_id) references public.asesores(id) on delete set null;

create index if not exists idx_leads_campana on public.leads(campana_id);

-- 8. RLS (el server usa service_role; estas políticas protegen acceso directo)
alter table public.asesores enable row level security;
alter table public.campanas enable row level security;
alter table public.formularios enable row level security;
alter table public.calendarios enable row level security;
alter table public.reservas enable row level security;
alter table public.integraciones enable row level security;

drop policy if exists asesores_staff_all on public.asesores;
create policy asesores_staff_all on public.asesores
  for all using (empresa_id = public.mi_empresa_id()) with check (empresa_id = public.mi_empresa_id());

drop policy if exists campanas_staff_all on public.campanas;
create policy campanas_staff_all on public.campanas
  for all using (empresa_id = public.mi_empresa_id()) with check (empresa_id = public.mi_empresa_id());

drop policy if exists formularios_staff_all on public.formularios;
create policy formularios_staff_all on public.formularios
  for all using (empresa_id = public.mi_empresa_id()) with check (empresa_id = public.mi_empresa_id());

drop policy if exists calendarios_staff_all on public.calendarios;
create policy calendarios_staff_all on public.calendarios
  for all using (empresa_id = public.mi_empresa_id()) with check (empresa_id = public.mi_empresa_id());

drop policy if exists reservas_staff_all on public.reservas;
create policy reservas_staff_all on public.reservas
  for all using (empresa_id = public.mi_empresa_id()) with check (empresa_id = public.mi_empresa_id());

drop policy if exists integraciones_staff_all on public.integraciones;
create policy integraciones_staff_all on public.integraciones
  for all using (empresa_id = public.mi_empresa_id()) with check (empresa_id = public.mi_empresa_id());

-- 9. Recargar cache de PostgREST
notify pgrst, 'reload schema';
