-- ==============================================================================
-- Southeast Landmark — Security Functions & Procedures
-- ==============================================================================

-- 1. Helper function to check if current user is an admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  );
END;
$$;

-- 2. Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- 3. Bootstrap First Admin:
-- Assigns the 'super_admin' role to the calling user ONLY IF no users currently have the super_admin or admin role.
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_email TEXT;
  admin_count INT;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if any admin already exists in the system
  SELECT count(*) INTO admin_count
  FROM public.user_roles
  WHERE role IN ('super_admin', 'admin');

  IF admin_count > 0 THEN
    RETURN false; -- Admin already bootstrapped
  END IF;

  -- Get email from auth.users
  SELECT email INTO caller_email
  FROM auth.users
  WHERE id = caller_id;

  -- Insert profile if missing
  INSERT INTO public.profiles (id, email, name, active)
  VALUES (caller_id, coalesce(caller_email, 'admin@southeastlandmark.com'), 'Primary Administrator', true)
  ON CONFLICT (id) DO UPDATE
  SET active = true;

  -- Assign super_admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (caller_id, 'super_admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log action in activity_log
  INSERT INTO public.activity_log (user_id, actor_email, action, message, entity)
  VALUES (caller_id, caller_email, 'bootstrap_first_admin', 'Initial super_admin bootstrapped for system', 'auth');

  RETURN true;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;
