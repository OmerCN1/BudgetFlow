create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  currency text not null default 'TRY',
  seeded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  is_income boolean not null default false,
  monthly_budget numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount >= 0),
  transaction_date date not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists monthly_income_target numeric(12, 2) not null default 0,
  add column if not exists locale text not null default 'tr-TR',
  add column if not exists timezone text not null default 'Europe/Istanbul',
  add column if not exists two_factor_enabled boolean not null default false,
  add column if not exists notification_email boolean not null default true,
  add column if not exists notification_push boolean not null default true,
  add column if not exists notification_sms boolean not null default false,
  add column if not exists phone_number text;

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'alert' check (type in ('alert', 'weekly')),
  notification_count int not null default 0,
  email_sent boolean not null default false,
  sms_sent boolean not null default false,
  email_error text,
  sms_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'broadcast',
  title text not null,
  message text not null,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notification_logs_user_id_idx on public.notification_logs(user_id);
create index if not exists notification_logs_created_at_idx on public.notification_logs(created_at);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_user_unread_idx on public.notifications(user_id, is_read);
create index if not exists notifications_created_at_idx on public.notifications(created_at);

alter table public.notification_logs enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Users can read own notification logs" on public.notification_logs;
create policy "Users can read own notification logs"
on public.notification_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Service role can insert notification logs" on public.notification_logs;
create policy "Service role can insert notification logs"
on public.notification_logs
for insert
to service_role
with check (true);

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
on public.notifications
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.notifications;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.notifications
  set is_read = true,
      read_at = coalesce(read_at, now())
  where id = p_notification_id
    and user_id = v_user_id
  returning * into v_row;

  if not found then
    raise exception 'Notification not found';
  end if;

  return v_row;
end;
$$;

grant execute on function public.mark_notification_read(uuid) to authenticated;

alter table public.categories
  add column if not exists icon text not null default 'Gider',
  add column if not exists is_archived boolean not null default false;

alter table public.transactions
  add column if not exists payment_method text not null default 'Kart',
  add column if not exists tags text[] not null default '{}',
  add column if not exists source text not null default 'manual',
  add column if not exists recurring_rule_id uuid,
  add column if not exists original_currency text not null default 'TRY',
  add column if not exists original_amount numeric(12, 4),
  add column if not exists location text;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null default 0,
  current_amount numeric(12, 2) not null default 0,
  target_date date,
  color text not null default '#10b981',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  contribution_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount >= 0),
  category_id uuid not null references public.categories(id) on delete restrict,
  frequency text not null default 'monthly' check (frequency in ('weekly', 'monthly')),
  day_of_month int not null default 1,
  next_date date not null,
  description text,
  payment_method text not null default 'Kart',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'AI Koç',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'coaching',
  title text not null,
  body text not null,
  severity text not null default 'info' check (severity in ('info', 'success', 'warning', 'danger')),
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  file_path text not null,
  file_name text not null,
  file_type text,
  file_size bigint,
  merchant text,
  amount numeric(12, 2) not null default 0,
  receipt_date date,
  payment_method text not null default 'Kart',
  notes text,
  scan_confidence numeric(5, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories(user_id);
create unique index if not exists categories_user_name_type_active_uidx
  on public.categories(user_id, lower(name), is_income)
  where is_archived = false;
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_category_id_idx on public.transactions(category_id);
create unique index if not exists transactions_recurring_rule_date_uidx
  on public.transactions(user_id, recurring_rule_id, transaction_date)
  where recurring_rule_id is not null;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_recurring_rule_id_fkey'
      and conrelid = 'public.transactions'::regclass
  ) then
    alter table public.transactions
      add constraint transactions_recurring_rule_id_fkey
      foreign key (recurring_rule_id)
      references public.recurring_rules(id)
      on delete set null;
  end if;
end $$;
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists goal_contributions_user_id_idx on public.goal_contributions(user_id);
create index if not exists recurring_rules_user_id_idx on public.recurring_rules(user_id);
create index if not exists ai_conversations_user_id_idx on public.ai_conversations(user_id);
create index if not exists ai_messages_user_id_idx on public.ai_messages(user_id);
create index if not exists ai_insights_user_id_idx on public.ai_insights(user_id);
create index if not exists receipts_user_id_idx on public.receipts(user_id);
create index if not exists receipts_transaction_id_idx on public.receipts(transaction_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_insights enable row level security;
alter table public.receipts enable row level security;

drop policy if exists "Users can manage their own profiles" on public.profiles;
create policy "Users can manage their own profiles"
on public.profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own categories" on public.categories;
create policy "Users can manage their own categories"
on public.categories
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own transactions" on public.transactions;
create policy "Users can manage their own transactions"
on public.transactions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own goals" on public.goals;
create policy "Users can manage their own goals"
on public.goals
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own goal contributions" on public.goal_contributions;
create policy "Users can manage their own goal contributions"
on public.goal_contributions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own recurring rules" on public.recurring_rules;
create policy "Users can manage their own recurring rules"
on public.recurring_rules
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own ai conversations" on public.ai_conversations;
create policy "Users can manage their own ai conversations"
on public.ai_conversations
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own ai messages" on public.ai_messages;
create policy "Users can manage their own ai messages"
on public.ai_messages
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own ai insights" on public.ai_insights;
create policy "Users can manage their own ai insights"
on public.ai_insights
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own receipts" on public.receipts;
create policy "Users can manage their own receipts"
on public.receipts
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  direction text not null check (direction in ('owed_to_me', 'i_owe')),
  description text,
  due_date date,
  is_settled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  payment_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists debts_user_id_idx on public.debts(user_id);
create index if not exists debt_payments_user_id_idx on public.debt_payments(user_id);
create index if not exists debt_payments_debt_id_idx on public.debt_payments(debt_id);

alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;

drop policy if exists "Users can manage their own debts" on public.debts;
create policy "Users can manage their own debts"
on public.debts
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own debt payments" on public.debt_payments;
create policy "Users can manage their own debt payments"
on public.debt_payments
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own receipt files" on storage.objects;
create policy "Users can read own receipt files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can upload own receipt files" on storage.objects;
create policy "Users can upload own receipt files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can update own receipt files" on storage.objects;
create policy "Users can update own receipt files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can delete own receipt files" on storage.objects;
create policy "Users can delete own receipt files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Assets (Varlıklar)
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  asset_type text not null check (asset_type in ('gold', 'silver', 'currency', 'bank', 'other')),
  gold_unit text check (gold_unit in ('gram', 'quarter', 'half', 'full', 'ata', 'republic')),
  currency_code text,
  quantity numeric(18, 6) not null default 0 check (quantity >= 0),
  unit_cost numeric(18, 4),
  note text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assets_user_id_idx on public.assets(user_id);

alter table public.assets enable row level security;

drop policy if exists "Users can manage their own assets" on public.assets;
create policy "Users can manage their own assets"
on public.assets
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Kredi Kartları
create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  bank_name text not null default '',
  card_type text not null default 'Visa' check (card_type in ('Visa', 'Mastercard', 'Amex', 'Troy', 'Diğer')),
  credit_limit numeric(12, 2) not null check (credit_limit >= 0),
  current_debt numeric(12, 2) not null default 0 check (current_debt >= 0),
  statement_day integer not null check (statement_day between 1 and 31),
  due_day integer not null check (due_day between 1 and 31),
  min_payment_rate numeric(5, 2) not null default 3.00,
  color text not null default '#4edea3',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists credit_cards_user_id_idx on public.credit_cards(user_id);

alter table public.credit_cards enable row level security;

drop policy if exists "Users can manage their own credit cards" on public.credit_cards;
create policy "Users can manage their own credit cards"
on public.credit_cards
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- ─── ADMIN PANEL MIGRATION ────────────────────────────────────────────────────

-- 1. profiles'a role ve is_banned kolonları
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin'));

alter table public.profiles
  add column if not exists is_banned boolean not null default false;

create index if not exists profiles_role_idx on public.profiles(role);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
      and is_banned = false
  );
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    old.role is distinct from new.role
    or old.is_banned is distinct from new.is_banned
  ) and not (select public.is_admin()) then
    raise exception 'Protected profile fields cannot be updated by this user';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_admin_fields_trigger on public.profiles;
create trigger protect_profile_admin_fields_trigger
before update on public.profiles
for each row
execute function public.protect_profile_admin_fields();

-- 2. admin_logs tablosu
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_logs_admin_id_idx on public.admin_logs(admin_id);
create index if not exists admin_logs_created_at_idx on public.admin_logs(created_at);

alter table public.admin_logs enable row level security;

drop policy if exists "Admins can read audit logs" on public.admin_logs;
create policy "Admins can read audit logs"
on public.admin_logs
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can insert audit logs" on public.admin_logs;
create policy "Admins can insert audit logs"
on public.admin_logs
for insert
to authenticated
with check (
  admin_id = (select auth.uid())
  and (select public.is_admin())
);

drop policy if exists "Admins can insert notifications" on public.notifications;
create policy "Admins can insert notifications"
on public.notifications
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can read all notifications" on public.notifications;
create policy "Admins can read all notifications"
on public.notifications
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

-- 3. profiles RLS: eski "for all" policy'yi böl
drop policy if exists "Users can manage their own profiles" on public.profiles;
drop policy if exists "Users can write their own profiles" on public.profiles;

create policy "Users can write their own profiles"
on public.profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all categories" on public.categories;
create policy "Admins can read all categories"
on public.categories
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

-- 4. Admin cross-read: transactions
drop policy if exists "Admins can read all transactions" on public.transactions;
create policy "Admins can read all transactions"
on public.transactions
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all goals" on public.goals;
create policy "Admins can read all goals"
on public.goals
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all goal contributions" on public.goal_contributions;
create policy "Admins can read all goal contributions"
on public.goal_contributions
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all recurring rules" on public.recurring_rules;
create policy "Admins can read all recurring rules"
on public.recurring_rules
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all receipts" on public.receipts;
create policy "Admins can read all receipts"
on public.receipts
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all debts" on public.debts;
create policy "Admins can read all debts"
on public.debts
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all debt payments" on public.debt_payments;
create policy "Admins can read all debt payments"
on public.debt_payments
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all assets" on public.assets;
create policy "Admins can read all assets"
on public.assets
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can read all credit cards" on public.credit_cards;
create policy "Admins can read all credit cards"
on public.credit_cards
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

-- 5. Admin cross-read: notification_logs
drop policy if exists "Admins can read all notification_logs" on public.notification_logs;
create policy "Admins can read all notification_logs"
on public.notification_logs
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

create or replace function public.set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Access denied: admin role required';
  end if;

  if new_role not in ('user', 'admin') then
    raise exception 'Invalid role';
  end if;

  update public.profiles
  set role = new_role,
      updated_at = now()
  where user_id = target_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

grant execute on function public.set_user_role(uuid, text) to authenticated;

create or replace function public.set_user_banned(target_user_id uuid, next_is_banned boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Access denied: admin role required';
  end if;

  if next_is_banned and exists (
    select 1
    from public.profiles
    where user_id = target_user_id
      and role = 'admin'
  ) then
    raise exception 'Admin users cannot be banned';
  end if;

  update public.profiles
  set is_banned = next_is_banned,
      updated_at = now()
  where user_id = target_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

grant execute on function public.set_user_banned(uuid, boolean) to authenticated;

create or replace function public.add_goal_contribution(
  p_goal_id uuid,
  p_amount numeric,
  p_contribution_date date,
  p_note text default null
)
returns public.goal_contributions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.goal_contributions;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_goal_id is null then
    raise exception 'goalId required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Contribution amount must be positive';
  end if;

  if p_contribution_date is null then
    raise exception 'Contribution date required';
  end if;

  if not exists (
    select 1
    from public.goals
    where id = p_goal_id
      and user_id = v_user_id
  ) then
    raise exception 'Goal not found';
  end if;

  insert into public.goal_contributions (
    user_id,
    goal_id,
    amount,
    contribution_date,
    note
  )
  values (
    v_user_id,
    p_goal_id,
    p_amount,
    p_contribution_date,
    nullif(p_note, '')
  )
  returning * into v_row;

  update public.goals
  set current_amount = current_amount + p_amount,
      updated_at = now()
  where id = p_goal_id
    and user_id = v_user_id;

  return v_row;
end;
$$;

grant execute on function public.add_goal_contribution(uuid, numeric, date, text) to authenticated;

-- 6. Email erişimi için security definer function
drop function if exists public.get_all_user_profiles();

create or replace function public.get_all_user_profiles()
returns table (
  user_id uuid,
  email text,
  display_name text,
  user_role text,
  is_banned boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Access denied: admin role required';
  end if;

  return query
  select
    p.user_id,
    u.email::text,
    p.display_name,
    p.role as user_role,
    p.is_banned,
    p.created_at,
    p.updated_at
  from public.profiles p
  join auth.users u on u.id = p.user_id
  order by p.created_at desc;
end;
$$;

grant execute on function public.get_all_user_profiles() to authenticated;

-- ─── END ADMIN PANEL MIGRATION ───────────────────────────────────────────────
