-- ============ ENUMS ============
create type public.app_role as enum ('super_admin','manager','cashier','inventory_staff');
create type public.stock_status as enum ('in_stock','low_stock','out_of_stock','overstocked');
create type public.purchase_status as enum ('draft','ordered','received','partially_received','cancelled');
create type public.payment_method as enum ('cash','card','upi','wallet','split','bank_transfer');
create type public.sale_status as enum ('completed','held','refunded','cancelled');
create type public.return_status as enum ('requested','approved','completed','rejected');
create type public.discount_type as enum ('percentage','fixed','bxgy');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "roles readable" on public.user_roles for select to authenticated using (true);
create policy "self role bootstrap" on public.user_roles for insert to authenticated with check (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'manager') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index categories_name_parent_uidx on public.categories (lower(name), coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "cat all" on public.categories for all to authenticated using (true) with check (true);

-- ============ SUPPLIERS ============
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text,
  email text,
  address text,
  gst_number text,
  payment_terms text default 'Net 30',
  outstanding_amount numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.suppliers to authenticated;
grant all on public.suppliers to service_role;
alter table public.suppliers enable row level security;
create policy "sup all" on public.suppliers for all to authenticated using (true) with check (true);

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  barcode text unique,
  category_id uuid references public.categories(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  brand text,
  description text,
  image_url text,
  unit text not null default 'piece',
  purchase_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  mrp numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 5,
  discount numeric(5,2) not null default 0,
  stock numeric(12,2) not null default 0,
  min_stock numeric(12,2) not null default 10,
  max_stock numeric(12,2) not null default 500,
  location text default 'Main Store',
  expiry_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_name_idx on public.products(lower(name));
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "prod all" on public.products for all to authenticated using (true) with check (true);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- ============ CUSTOMERS ============
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  date_of_birth date,
  loyalty_points integer not null default 0,
  total_purchases numeric(12,2) not null default 0,
  outstanding_balance numeric(12,2) not null default 0,
  last_purchase_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_phone_idx on public.customers(phone);
grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "cust all" on public.customers for all to authenticated using (true) with check (true);

-- ============ EMPLOYEES ============
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  name text not null,
  email text,
  phone text,
  role public.app_role not null default 'cashier',
  department text,
  joining_date date not null default current_date,
  salary numeric(12,2) not null default 0,
  is_active boolean not null default true,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.employees to authenticated;
grant all on public.employees to service_role;
alter table public.employees enable row level security;
create policy "emp all" on public.employees for all to authenticated using (true) with check (true);

-- ============ SALES ============
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text,
  cashier_name text,
  cashier_id uuid references auth.users(id) on delete set null,
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  change_due numeric(12,2) not null default 0,
  payment_method public.payment_method not null default 'cash',
  status public.sale_status not null default 'completed',
  notes text,
  created_at timestamptz not null default now()
);
create index sales_created_idx on public.sales(created_at desc);
grant select, insert, update, delete on public.sales to authenticated;
grant all on public.sales to service_role;
alter table public.sales enable row level security;
create policy "sales all" on public.sales for all to authenticated using (true) with check (true);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  total numeric(12,2) not null default 0
);
create index sale_items_sale_idx on public.sale_items(sale_id);
grant select, insert, update, delete on public.sale_items to authenticated;
grant all on public.sale_items to service_role;
alter table public.sale_items enable row level security;
create policy "sale items all" on public.sale_items for all to authenticated using (true) with check (true);

-- ============ PURCHASES ============
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  purchase_number text not null unique,
  supplier_id uuid references public.suppliers(id) on delete set null,
  supplier_name text,
  invoice_number text,
  purchase_date date not null default current_date,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status public.purchase_status not null default 'draft',
  payment_status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.purchases to authenticated;
grant all on public.purchases to service_role;
alter table public.purchases enable row level security;
create policy "pur all" on public.purchases for all to authenticated using (true) with check (true);

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity numeric(12,2) not null default 1,
  unit_cost numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0
);
grant select, insert, update, delete on public.purchase_items to authenticated;
grant all on public.purchase_items to service_role;
alter table public.purchase_items enable row level security;
create policy "pur items all" on public.purchase_items for all to authenticated using (true) with check (true);

-- ============ INVENTORY MOVEMENTS ============
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  product_name text,
  movement_type text not null default 'adjustment',
  previous_qty numeric(12,2) not null default 0,
  new_qty numeric(12,2) not null default 0,
  difference numeric(12,2) not null default 0,
  reason text,
  performed_by text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.inventory_movements to authenticated;
grant all on public.inventory_movements to service_role;
alter table public.inventory_movements enable row level security;
create policy "inv mov all" on public.inventory_movements for all to authenticated using (true) with check (true);

-- ============ EXPENSES ============
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Miscellaneous',
  amount numeric(12,2) not null default 0,
  payment_method public.payment_method not null default 'cash',
  description text,
  expense_date date not null default current_date,
  added_by text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.expenses to authenticated;
grant all on public.expenses to service_role;
alter table public.expenses enable row level security;
create policy "exp all" on public.expenses for all to authenticated using (true) with check (true);

-- ============ DISCOUNTS ============
create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  discount_type public.discount_type not null default 'percentage',
  value numeric(12,2) not null default 0,
  start_date date not null default current_date,
  end_date date,
  min_purchase numeric(12,2) not null default 0,
  max_discount numeric(12,2),
  usage_limit integer,
  used_count integer not null default 0,
  applies_to text default 'all',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.discounts to authenticated;
grant all on public.discounts to service_role;
alter table public.discounts enable row level security;
create policy "disc all" on public.discounts for all to authenticated using (true) with check (true);

-- ============ RETURNS ============
create table public.returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique,
  sale_id uuid references public.sales(id) on delete set null,
  invoice_number text,
  customer_name text,
  reason text,
  refund_amount numeric(12,2) not null default 0,
  status public.return_status not null default 'requested',
  processed_by text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.returns to authenticated;
grant all on public.returns to service_role;
alter table public.returns enable row level security;
create policy "ret all" on public.returns for all to authenticated using (true) with check (true);

create table public.return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.returns(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0
);
grant select, insert, update, delete on public.return_items to authenticated;
grant all on public.return_items to service_role;
alter table public.return_items enable row level security;
create policy "ret items all" on public.return_items for all to authenticated using (true) with check (true);

-- ============ NOTIFICATIONS / AUDIT / SETTINGS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notif all" on public.notifications for all to authenticated using (true) with check (true);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  action text not null,
  module text not null,
  entity text,
  details text,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "audit read" on public.audit_logs for select to authenticated using (true);
create policy "audit write" on public.audit_logs for insert to authenticated with check (true);

create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'FreshMart Supermarket',
  address text default '14 MG Road, Pune, Maharashtra 411001',
  phone text default '+91 98765 43210',
  email text default 'billing@freshmart.in',
  gst_number text default '27AABCF1234M1ZP',
  currency text default 'INR',
  default_tax numeric(5,2) not null default 5,
  invoice_prefix text default 'INV',
  logo_url text,
  auto_print boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "settings all" on public.store_settings for all to authenticated using (true) with check (true);
insert into public.store_settings (store_name) values ('FreshMart Supermarket');
