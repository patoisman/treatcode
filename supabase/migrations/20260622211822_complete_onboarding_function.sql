
CREATE OR REPLACE FUNCTION complete_onboarding()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET onboarding_status = 'setup_complete',
      updated_at = now()
  WHERE id = auth.uid()
    AND onboarding_status = 'pledge_set';
END;
$$;

GRANT EXECUTE ON FUNCTION complete_onboarding() TO authenticated;
