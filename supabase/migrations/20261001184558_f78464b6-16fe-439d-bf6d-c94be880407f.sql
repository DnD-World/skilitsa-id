create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null,
  breed text not null default 'Golden Retriever',
  avatar text not null default 'golden',
  photo_url text,
  microchip text,
  medical_alerts text,
  owner_name text not null,
  owner_phone text not null,
  fingerprint_id text not null default upper(substr(md5(random()::text),1,12)),
  scannable boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.dogs to authenticated;
grant all on public.dogs to service_role;
alter table public.dogs enable row level security;
create policy "own dogs" on public.dogs for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  category text not null,
  label text not null,
  amount numeric(10,2) not null,
  spent_on date not null default current_date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.expenses to authenticated;
grant all on public.expenses to service_role;
alter table public.expenses enable row level security;
create policy "own expenses" on public.expenses for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table public.settings (
  owner_id uuid primary key default auth.uid(),
  monthly_budget numeric(10,2) not null default 200
);
grant select, insert, update, delete on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "own settings" on public.settings for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table public.health_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  dog_id uuid references public.dogs(id) on delete cascade,
  kind text not null,
  title text not null,
  due_on date not null,
  clinic text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.health_events to authenticated;
grant all on public.health_events to service_role;
alter table public.health_events enable row level security;
create policy "own health" on public.health_events for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  business text not null,
  code text not null,
  format text not null default 'CODE128',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.loyalty_cards to authenticated;
grant all on public.loyalty_cards to service_role;
alter table public.loyalty_cards enable row level security;
create policy "own cards" on public.loyalty_cards for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table public.food_bags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  brand text not null,
  bag_kg numeric(6,2) not null,
  days_lasting int not null,
  opened_on date not null default current_date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.food_bags to authenticated;
grant all on public.food_bags to service_role;
alter table public.food_bags enable row level security;
create policy "own bags" on public.food_bags for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.scan_match()
returns table (name text, breed text, avatar text, photo_url text, medical_alerts text, owner_name text, owner_phone text, fingerprint_id text)
language sql stable security definer set search_path = public as $$
  select name, breed, avatar, photo_url, medical_alerts, owner_name, owner_phone, fingerprint_id
  from public.dogs where scannable order by random() limit 1
$$;
revoke execute on function public.scan_match() from public;
grant execute on function public.scan_match() to anon, authenticated;