-- 156: Registro de felicitaciones de cumpleaños enviadas (anti-duplicados)
create table if not exists public.cumpleanos_enviados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  anio integer not null,
  creado_en timestamptz default now(),
  unique (user_id, anio)
);

create index if not exists idx_cumpleanos_enviados_user on public.cumpleanos_enviados(user_id);

alter table public.cumpleanos_enviados enable row level security;

notify pgrst, 'reload schema';
