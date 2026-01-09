
-- Create rate limit counters table
create table if not exists public.rate_limit_counters (
  key text primary key,
  count int default 1,
  window_start timestamp with time zone default now()
);

-- Enable RLS but don't add policies (only accessible via service_role/postgres usually, or security definer functions)
alter table public.rate_limit_counters enable row level security;

-- Function to check rate limit
-- usage: select check_rate_limit('user_123:ai_mentor', 10, '1 minute');
create or replace function public.check_rate_limit(
  limit_key text,
  limit_count int,
  window_interval interval
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  curr_count int;
begin
  -- Upsert: if key exists, update count/window. If new logic, reset.
  insert into public.rate_limit_counters (key, count, window_start)
  values (limit_key, 1, now())
  on conflict (key) do update
  set count = case
      when (now() - rate_limit_counters.window_start) > window_interval then 1
      else rate_limit_counters.count + 1
    end,
    window_start = case
      when (now() - rate_limit_counters.window_start) > window_interval then now()
      else rate_limit_counters.window_start
    end
  returning count into curr_count;

  -- If count is greater than limit, return false (rate limited)
  -- Note: The counter increments *before* check, so if limit is 10,
  -- 11th request sets count to 11 and returns false.
  if curr_count > limit_count then
    return false;
  else
    return true;
  end if;
end;
$$;
