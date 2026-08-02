-- ============================================================================
-- Juntos por Akira - Esquema completo de base de datos y seguridad (Supabase)
-- Ejecutar una sola vez en: Supabase Dashboard > SQL Editor > New query > Run.
-- Es idempotente: se puede volver a ejecutar sin romper datos existentes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabla de admins. Solo los usuarios listados aqui pueden escribir.
--    Se llena manualmente con el UID del usuario admin (ver instrucciones).
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Funcion de ayuda: devuelve true si el usuario autenticado actual es admin.
-- SECURITY DEFINER para poder leer public.admins sin exponerla al cliente.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Numeros de la rifa (1..300).
-- ---------------------------------------------------------------------------
create table if not exists public.raffle_numbers (
  n integer primary key check (n between 1 and 300),
  status text not null default 'available' check (status in ('available', 'sold')),
  buyer_name text,
  updated_at timestamptz not null default now()
);

-- Telefono de quien compro el numero. Sirve para agrupar los numeros de una
-- misma persona en el panel de seguimiento. Solo lo ve el admin en la tabla.
alter table public.raffle_numbers
  add column if not exists buyer_phone text;

create index if not exists raffle_numbers_buyer_phone_idx
  on public.raffle_numbers (buyer_phone);

-- Sembrar los 300 numeros. No sobrescribe filas existentes.
insert into public.raffle_numbers (n)
select generate_series(1, 300)
on conflict (n) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Mensajes del ticker de agradecimientos.
-- ---------------------------------------------------------------------------
create table if not exists public.ticker_messages (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(trim(message)) between 1 and 280),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Contenido editable de la seccion "Quien es Akira" (fila unica).
-- ---------------------------------------------------------------------------
create table if not exists public.akira_content (
  id text primary key default 'akira',
  title text not null default 'Quien es Akira',
  body text not null default '',
  photos text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint akira_content_singleton check (id = 'akira')
);

insert into public.akira_content (id, title, body, photos)
values (
  'akira',
  'Quien es Akira',
  'Akira es una gata muy querida que hoy necesita tratamiento veterinario. Con esta rifa buscamos cubrir sus gastos medicos. Cada numero suma y nos acerca a su recuperacion. Gracias por ayudar.',
  '{}'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4b. Donaciones: personas que aportaron sin comprar numeros.
-- ---------------------------------------------------------------------------
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text not null check (char_length(trim(donor_name)) between 1 and 80),
  amount integer not null check (amount > 0),
  message text not null default '' check (char_length(message) <= 200),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Trigger para mantener updated_at al dia en cada UPDATE.
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_raffle_numbers on public.raffle_numbers;
create trigger trg_touch_raffle_numbers
  before update on public.raffle_numbers
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_akira_content on public.akira_content;
create trigger trg_touch_akira_content
  before update on public.akira_content
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Row Level Security. Lectura publica; escritura solo admin autenticado.
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.raffle_numbers enable row level security;
alter table public.ticker_messages enable row level security;
alter table public.akira_content enable row level security;
alter table public.donations enable row level security;

-- admins: nadie la lee ni la escribe desde el cliente. Solo la funcion
-- is_admin() (SECURITY DEFINER) y el service_role la tocan. Sin politicas
-- permisivas => acceso denegado por defecto con RLS activado.

-- raffle_numbers
drop policy if exists raffle_numbers_select_public on public.raffle_numbers;
create policy raffle_numbers_select_public
  on public.raffle_numbers for select
  to anon, authenticated
  using (true);

drop policy if exists raffle_numbers_update_admin on public.raffle_numbers;
create policy raffle_numbers_update_admin
  on public.raffle_numbers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No se permite insert ni delete de numeros desde el cliente: el set de 300
-- es fijo y se siembra por SQL. Sin politicas de insert/delete => denegado.

-- ticker_messages
drop policy if exists ticker_select_public on public.ticker_messages;
create policy ticker_select_public
  on public.ticker_messages for select
  to anon, authenticated
  using (true);

drop policy if exists ticker_insert_admin on public.ticker_messages;
create policy ticker_insert_admin
  on public.ticker_messages for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists ticker_delete_admin on public.ticker_messages;
create policy ticker_delete_admin
  on public.ticker_messages for delete
  to authenticated
  using (public.is_admin());

-- akira_content
drop policy if exists akira_select_public on public.akira_content;
create policy akira_select_public
  on public.akira_content for select
  to anon, authenticated
  using (true);

drop policy if exists akira_update_admin on public.akira_content;
create policy akira_update_admin
  on public.akira_content for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- donations
drop policy if exists donations_select_public on public.donations;
create policy donations_select_public
  on public.donations for select
  to anon, authenticated
  using (true);

drop policy if exists donations_insert_admin on public.donations;
create policy donations_insert_admin
  on public.donations for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists donations_update_admin on public.donations;
create policy donations_update_admin
  on public.donations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists donations_delete_admin on public.donations;
create policy donations_delete_admin
  on public.donations for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. Storage: bucket publico de lectura para las fotos de Akira.
--    Subida y borrado solo para admins autenticados.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('akira-photos', 'akira-photos', true)
on conflict (id) do update set public = true;

drop policy if exists akira_photos_read on storage.objects;
create policy akira_photos_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'akira-photos');

drop policy if exists akira_photos_insert_admin on storage.objects;
create policy akira_photos_insert_admin
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'akira-photos' and public.is_admin());

drop policy if exists akira_photos_update_admin on storage.objects;
create policy akira_photos_update_admin
  on storage.objects for update
  to authenticated
  using (bucket_id = 'akira-photos' and public.is_admin())
  with check (bucket_id = 'akira-photos' and public.is_admin());

drop policy if exists akira_photos_delete_admin on storage.objects;
create policy akira_photos_delete_admin
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'akira-photos' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 8. Realtime: publicar cambios de las tablas publicas para actualizacion viva.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'raffle_numbers'
  ) then
    alter publication supabase_realtime add table public.raffle_numbers;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'ticker_messages'
  ) then
    alter publication supabase_realtime add table public.ticker_messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'akira_content'
  ) then
    alter publication supabase_realtime add table public.akira_content;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'donations'
  ) then
    alter publication supabase_realtime add table public.donations;
  end if;
end $$;
