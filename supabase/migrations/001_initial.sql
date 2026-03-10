-- Properties
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  address text not null,
  property_token text unique default substring(md5(random()::text), 1, 12),
  created_at timestamptz default now()
);

-- Units
create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  unit_number text not null,
  tenant_name text,
  tenant_email text,
  created_at timestamptz default now()
);

-- Maintenance Requests
create table if not exists maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  unit_number text not null,
  tenant_name text not null,
  category text not null,
  description text not null,
  urgency text not null default 'Medium',
  status text not null default 'submitted',
  request_token text unique default substring(md5(random()::text), 1, 16),
  landlord_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Status History
create table if not exists request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references maintenance_requests(id) on delete cascade,
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_properties_user_id on properties(user_id);
create index if not exists idx_properties_token on properties(property_token);
create index if not exists idx_units_property_id on units(property_id);
create index if not exists idx_requests_property_id on maintenance_requests(property_id);
create index if not exists idx_requests_token on maintenance_requests(request_token);
create index if not exists idx_requests_status on maintenance_requests(status);
create index if not exists idx_history_request_id on request_status_history(request_id);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);

-- RLS
alter table properties enable row level security;
alter table units enable row level security;
alter table maintenance_requests enable row level security;
alter table request_status_history enable row level security;
alter table subscriptions enable row level security;

-- RLS Policies
create policy "Users own their properties" on properties for all using (auth.uid() = user_id);
create policy "Property token public read" on properties for select using (true);

create policy "Units via property ownership" on units for all using (
  property_id in (select id from properties where user_id = auth.uid())
);

create policy "Requests via property ownership" on maintenance_requests for all using (
  property_id in (select id from properties where user_id = auth.uid())
);
create policy "Requests public read by token" on maintenance_requests for select using (true);
create policy "Requests public insert" on maintenance_requests for insert with check (true);

create policy "History via request ownership" on request_status_history for all using (
  request_id in (
    select mr.id from maintenance_requests mr
    join properties p on p.id = mr.property_id
    where p.user_id = auth.uid()
  )
);
create policy "History public insert" on request_status_history for insert with check (true);

create policy "Users own their subscriptions" on subscriptions for all using (auth.uid() = user_id);
