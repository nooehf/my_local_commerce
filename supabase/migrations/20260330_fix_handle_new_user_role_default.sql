-- Fix handle_new_user to avoid creating businesses for employees/customers
-- and ensure business_id is required for non-admin roles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
  new_business_id uuid;
  meta_business_id text;
begin
  -- 1) Resolve Role (Default to customer, never assume admin)
  user_role := coalesce(new.raw_user_meta_data->>'role', 'customer');

  -- 2) Resolve Business ID
  if user_role in ('admin', 'super_admin') then
    -- Create a new business for administrators
    insert into public.businesses (name, owner_user_id, email)
    values (
      coalesce(new.raw_user_meta_data->>'business_name', 'Mi Negocio'),
      new.id,
      new.email
    )
    returning id into new_business_id;
  else
    -- For employees and customers, business_id MUST be provided in metadata
    meta_business_id := new.raw_user_meta_data->>'business_id';

    if meta_business_id is null or meta_business_id = '' then
      raise exception 'business_id is required in user metadata for role % (user_id=%)', user_role, new.id;
    end if;

    new_business_id := meta_business_id::uuid;
  end if;

  -- 3) Create Profile
  insert into public.profiles (id, business_id, name, email, role)
  values (
    new.id,
    new_business_id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'first_name', new.email),
    new.email,
    user_role
  );

  return new;
end;
$$;
