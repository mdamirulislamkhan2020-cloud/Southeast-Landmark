
DROP FUNCTION IF EXISTS public.bootstrap_first_admin();

CREATE FUNCTION public.bootstrap_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existing_count int;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT count(*) INTO existing_count FROM public.user_roles;

  IF existing_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;
