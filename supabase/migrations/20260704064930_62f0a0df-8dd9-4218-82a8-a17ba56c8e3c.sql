
-- Attach handle_new_user trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bootstrap RPC: if there are no roles yet, promote the caller to super_admin
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS TABLE(promoted boolean, role app_role)
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
    RETURN QUERY SELECT true, 'super_admin'::app_role;
  ELSE
    RETURN QUERY SELECT false, NULL::app_role;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;
