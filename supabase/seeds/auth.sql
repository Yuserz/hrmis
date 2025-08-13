
BEGIN;

WITH new_user AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    raw_app_meta_data
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    '5775c2dd-f20e-4557-ab0a-394064c7ab0d',
    'authenticated',
    'authenticated',
    'admin2@example.com',
    '$2a$10$TrPumvBtf/cO6RnI002QRu5X/I9dWMnH9Ma9Garg0GL/Wbtgkd21i',
    '2025-08-12 02:21:51.900286+00',
    NULL,
    jsonb_build_object(
      'email_verified', true
    ),
    '2025-08-12 02:21:51.897564+00',
    '2025-08-12 02:21:51.90074+00',
    '',
    '',
    '',
    '',
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email')
    )
  )
  RETURNING id
)

INSERT INTO public.users (
  id,
  email,
  employee_id,
  role,
  username
)
SELECT
  id,
  'admin2@example.com',
  null,
  'admin',
  'zneret03'
FROM new_user
ON CONFLICT (id)
DO UPDATE SET
  email = EXCLUDED.email,
  employee_id = EXCLUDED.employee_id,
  role = EXCLUDED.role,
  username = EXCLUDED.username
RETURNING *;

COMMIT;
