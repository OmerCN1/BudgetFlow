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
    'ai_insights'
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
    'ai_insights'
  )
order by tablename, policyname;

