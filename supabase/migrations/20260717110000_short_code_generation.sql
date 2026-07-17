-- Generate short codes in the database and expose create_link RPC.

create or replace function public.generate_short_code(p_length int default 7)
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_alphabet constant text :=
    '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  v_reserved constant text[] := array[
    'login',
    'dashboard',
    'links',
    'api',
    'auth',
    'favicon.ico',
    '_next',
    'public'
  ];
  v_result text;
  v_i int;
begin
  if p_length < 4 or p_length > 12 then
    raise exception 'short code length must be between 4 and 12'
      using errcode = '22023';
  end if;

  loop
    v_result := '';

    for v_i in 1..p_length loop
      v_result := v_result || substr(
        v_alphabet,
        1 + floor(random() * length(v_alphabet))::int,
        1
      );
    end loop;

    exit when not (lower(v_result) = any (v_reserved));
  end loop;

  return v_result;
end;
$$;

create or replace function public.create_link(
  p_destination_url text,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_term text default null,
  p_utm_content text default null
)
returns public.links
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_link public.links;
  v_short_code text;
  v_attempt int := 0;
  v_max_attempts constant int := 5;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  loop
    v_attempt := v_attempt + 1;

    if v_attempt > v_max_attempts then
      raise exception 'Could not generate a unique short code'
        using errcode = '23505';
    end if;

    v_short_code := public.generate_short_code();

    begin
      insert into public.links (
        short_code,
        destination_url,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        created_by
      )
      values (
        v_short_code,
        p_destination_url,
        p_utm_source,
        p_utm_medium,
        p_utm_campaign,
        p_utm_term,
        p_utm_content,
        auth.uid()
      )
      returning * into v_link;

      return v_link;
    exception
      when unique_violation then
        null;
    end;
  end loop;
end;
$$;

grant execute on function public.generate_short_code(int) to authenticated;
grant execute on function public.create_link(
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
