UPDATE auth.users
SET email = 'dream@gmail.com',
    encrypted_password = crypt('dream0987654', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now(),
    raw_user_meta_data = COALESCE(raw_user_meta_data,'{}'::jsonb)
WHERE id = '0f78588a-c556-4edc-9d24-25fdce41bba5';

UPDATE auth.identities
SET identity_data = jsonb_set(COALESCE(identity_data,'{}'::jsonb), '{email}', to_jsonb('dream@gmail.com'::text)),
    updated_at = now()
WHERE user_id = '0f78588a-c556-4edc-9d24-25fdce41bba5';