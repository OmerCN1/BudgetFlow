select
  table_name,
  case when table_name is not null then 'ok' else 'missing' end as status
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'categories',
    'transactions',
    'goals',
    'goal_contributions',
    'recurring_rules',
    'ai_conversations',
    'ai_messages',
    'ai_insights',
    'receipts',
    'debts',
    'debt_payments',
    'assets',
    'credit_cards',
    'notification_logs',
    'notifications',
    'admin_logs'
  )
order by table_name;

select
  schemaname,
  tablename,
  policyname
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles',
    'categories',
    'transactions',
    'goals',
    'goal_contributions',
    'recurring_rules',
    'ai_conversations',
    'ai_messages',
    'ai_insights',
    'receipts',
    'debts',
    'debt_payments',
    'assets',
    'credit_cards',
    'notification_logs',
    'notifications',
    'admin_logs'
  )
order by tablename, policyname;

select
  routine_name,
  routine_type
from information_schema.routines
where specific_schema = 'public'
  and routine_name in (
    'is_admin',
    'protect_profile_admin_fields',
    'mark_notification_read',
    'get_all_user_profiles',
    'set_user_role',
    'set_user_banned',
    'add_goal_contribution'
  )
order by routine_name;
