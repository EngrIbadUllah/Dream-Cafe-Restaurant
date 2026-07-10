-- Create admin user with confirmed email and admin role
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Only insert if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ibad0469427@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'ibad0469427@gmail.com',
      crypt('ibad0987654', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Restaurant Admin"}'::jsonb,
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'ibad0469427@gmail.com', 'email_verified', true),
      'email', new_user_id::text,
      now(), now(), now()
    );
  END IF;

  -- Grant admin role (idempotent)
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'ibad0469427@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, full_name)
  SELECT id, 'Restaurant Admin' FROM auth.users WHERE email = 'ibad0469427@gmail.com'
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
END $$;